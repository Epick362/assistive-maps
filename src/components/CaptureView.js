import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    Image,
    View,
    CameraRoll,
    Alert,
    ScrollView,
    TouchableHighlight,
    TouchableWithoutFeedback,
    Dimensions,
    DeviceEventEmitter,
    Modal,
    PanResponder,
    Vibration
} from "react-native";

import { RNCamera } from "react-native-camera";
import ReactNativeHeading from "react-native-heading";
import _ from "lodash";
import Tts from 'react-native-tts';
import Voice from 'react-native-voice';
import Icon from 'react-native-fa-icons';

import NearbyView from './NearbyView';
import GalleryView from './GalleryView';
import Button from './Button';

import Location from '../models/Location';
import Photo from '../models/Photo';
import Maps from '../models/Maps';
import VoiceRecognition from '../models/VoiceRecognition';

import {
    DIRECTION_DOWN,
    DIRECTION_UP,
    DIRECTION_LEFT,
    DIRECTION_RIGHT
} from '../constants';

const { width } = Dimensions.get('window')

class CaptureView extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            drag: '',
            heading: 0,
            latitude: 0, 
            longitude: 0,
            galleryVisible: false,
            error: null,
            nearby: []
        };

        this.galleryRef = React.createRef();
      }

    componentDidMount() {
        Voice.isAvailable()
        .then(console.warn);

        ReactNativeHeading.start(5).then(didStart => {
            if (!didStart) {
                console.error('ReactNativeHeading is not supported.')
            }
        });

        DeviceEventEmitter.addListener('headingUpdated', this.updateHeading);

        const locationOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000,
            distanceFilter: 10
        };

        navigator.geolocation.watchPosition(this.updateLocation, this.errorLocation, locationOptions);

        Tts.setDefaultLanguage('cs-CZ');
    }

    componentWillMount() {
        let debouncedDragResponder = _.debounce(this.dragResponder, 200, {trailing: true});

        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => !!this.getDirection(gestureState),
            onPanResponderMove: (evt, gestureState) => {
                const drag = this.getDirection(gestureState);

                debouncedDragResponder(drag);
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
        });
    }

    componentWillUnmount() {
        ReactNativeHeading.stop();
        DeviceEventEmitter.removeAllListeners('headingUpdated');
    }

    render() {
        return <View style={styles.container} {...this._panResponder.panHandlers}>
            <RNCamera 
                ref={cam => {
                    this.camera = cam;
                }} 
                style={styles.preview}
                permissionDialogTitle={'Permission to use camera'}
                permissionDialogMessage={'We need your permission to use your camera phone'}
            >
                <TouchableWithoutFeedback style={styles.touchableCapture} onPress={this.takePicture}>
                    <View />
                </TouchableWithoutFeedback>
                <View style={styles.bottomActions}>
                    <Button 
                        style={styles.actionGallery} 
                        onPress={this.openModal}
                        icon={'photo'}
                        label={'Galéria'}
                        raised={true}
                    ></Button>
                    <Button style={styles.actionCapture} onPress={this.takePicture} icon={'camera'} raised={true}></Button>
                </View>
            </RNCamera>

            <Modal
                animationType={"slide"}
                transparent={false}
                visible={this.state.galleryVisible}
                onRequestClose={this.closeModal}
            >
                <GalleryView ref={this.galleryRef} closeModal={this.closeModal}></GalleryView>
            </Modal>
        </View>;
    }

    updateLocation = (position) => {
        this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });

        Maps.getNearby(position).then(data => {
            let processedNearby = this.processNearbyData(position, data.data.results);

            this.setState({ nearby: processedNearby });

            return data;
        });
    }

    errorLocation = (positionError) => {
        this.setState({ error: positionError.message });
    }

    updateHeading = (data) => {
        let lookingAt = this.updateWorldData(data.heading, this.state.nearby);

        this.setState({
            heading: data.heading,
            nearby: lookingAt,
            targets: lookingAt.slice(0, 3)
        });
    }
    
    openModal = (speak = true) => {
        if (this.state.galleryVisible) {
            return;
        }

        if (speak) {
            Tts.speak('Galeria otvorena');
        }

        this.setState({ galleryVisible: true });
    }

    closeModal = (speak = true) => {
        if (!this.state.galleryVisible) {
            return;
        }

        if (speak) {
            Tts.speak('Galeria zatvorena');
        }

        this.setState({ galleryVisible: false });
    }

    takePicture = () => {
        let photo = new Photo();
        let photoData = null;
        let metaData = {
            location: {
                latitude: this.state.latitude,
                longitude: this.state.longitude
            },
            heading: this.state.heading,
            nearby: this.state.targets,
            timestamp: new Date()
        }

        Tts.stop();

        this.camera.takePictureAsync()
        .then(data => {
            photoData = data;

            return Promise.all([this.loadAddress(metaData.location), this.recordCapturedName()]);
        })
        .then(values => {
            let streetData = values[0];
            let fileName = values[1];

            metaData.street = streetData;
            metaData.name = fileName;

            return photo.save(photoData, metaData);
        })
        .catch(err => console.error(err));
    }

    recordCapturedName = () => {
        let voiceRec = new VoiceRecognition();

        return voiceRec.recordPhotoName('Cvak! Po zaznení tónu, vyslovte názov fotky')
        .then((recognizedText) => {
            Tts.speak('Fotka uložená pod menom: ' + recognizedText);

            return recognizedText;
        });
    }

    processNearbyData = (position, nearby = []) => {
        nearby = _.map(nearby, (near) => {
            near.coords = {
                latitude: near.geometry.location.lat,
                longitude: near.geometry.location.lng
            };
            near.theta = Location.calculateTheta(position.coords, near.coords);

            return near;
        });

        return nearby;
    }

    loadAddress = (location) => {
        return Maps.getStreetName(location)
        .then((streetData) => {
            if (streetData.data.results[0]) {
                return streetData.data.results[0];
            }

            return null;
        });
    }

    updateWorldData = (heading, nearby = []) => {
        let { latitude, longitude } = this.state;

        nearby.forEach((near) => {
            near.thetaHeading = near.theta ? Math.abs(heading - near.theta) : 0;
            near.distance = Location.calculateDistance(near.coords, { latitude, longitude });
        });

        return _.sortBy(nearby, 'thetaHeading');
    }

    getDirection = ({ moveX, moveY, dx, dy }) => {
        const draggedDown = dy > 50;
        const draggedUp = dy < -50;
        const draggedLeft = dx < -40;
        const draggedRight = dx > 40;
    
        if (draggedDown) {
            return DIRECTION_DOWN;
        }

        if (draggedUp) {
            return DIRECTION_UP;
        }

        if (draggedLeft) {
            return DIRECTION_LEFT;
        }

        if (draggedRight) {
            return DIRECTION_RIGHT;
        }
    
        return null;
    }

    dragResponder = (direction) => {
        if (direction === DIRECTION_UP) {
            this.openModal();
        }

        if (direction === DIRECTION_DOWN) {
            if (this.state.galleryVisible) {
                this.closeModal();
                return;
            }

            this.openModal(false);
            this.galleryRef.current.searchGallery();
        }
    }
}

const styles = StyleSheet.create({
    'container': {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    'preview': {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        height: '100%',
        width: '100%'
    },
    'bottomActions': {
        position: 'absolute',
        width: '90%',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        bottom: 30,
    },
    'actionGallery': {
        
    },
    'actionCapture': {
        width: 60,
        height: 60,
    },
    'nearby': {
        height: '60%',
        marginBottom: 100,
        marginTop: 30,
        width: '90%'
    },
    'gpsPosition': {
        flex: 0,
        backgroundColor: "#fff",
        borderRadius: 5,
        padding: 10,
        margin: 40
    },
    'gpsPosition__text': {
        color: "#000", 
        textAlign: 'center'
    },
    'gallery': {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 5,
        borderColor: '#FF4400',
        marginBottom: 15,
        marginTop: 20
    },
    'touchableCapture': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    helpTop: {
        position: 'absolute',
        alignSelf: 'center',
        top: 40,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 10
    },
    helpTopText: {
        color: '#202020',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 5,
        backgroundColor: 'transparent',
    }
});

export default CaptureView;