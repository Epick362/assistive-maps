import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    Image,
    View,
    CameraRoll,
    Alert,
    Button,
    ScrollView,
    TouchableHighlight,
    Dimensions,
    DeviceEventEmitter,
    Modal,
    PanResponder
} from "react-native";

import { RNCamera } from "react-native-camera";
import ReactNativeHeading from "react-native-heading";
import _ from "lodash";

import NearbyView from './NearbyView';
import GalleryView from './GalleryView';

import Location from '../models/Location';
import Photo from '../models/Photo';
import NearbyPlaces from '../models/NearbyPlaces';

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
    }

    componentDidMount() {
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
            <RNCamera ref={cam => {
                this.camera = cam;
            }} style={styles.preview}>
                <TouchableHighlight style={styles.touchableCapture} onPress={this.takePicture.bind(this)}>
                    <View />
                </TouchableHighlight>
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.galleryVisible}
                >
                    <GalleryView toggleModal={this.toggleModal}></GalleryView>
                </Modal>
            </RNCamera>
        </View>;
    }

    updateLocation = (position) => {
        this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });

        NearbyPlaces.getNearby(position).then(data => {
            let processedNearby = this.processNearbyData(position, data.data.results);

            this.setState({ nearby: processedNearby });

            return data;
        });
    }

    errorLocation = (positionError) => {
        this.setState({ error: error.message });
    }

    updateHeading = (data) => {
        let lookingAt = this.updateWorldData(data.heading, this.state.nearby);

        this.setState({
            heading: data.heading,
            nearby: lookingAt,
            targets: lookingAt.slice(0, 3)
        });
    }
    
    openModal = () => {
        this.setState({ galleryVisible: true });
    }

    closeModal = () => {
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
            nearby: this.state.targets
        }

        this.camera.takePictureAsync()
        .then(data => {
            photoData = data;
            return this.loadAddress(metaData.location);
        })
        .then(streetData => {
            metaData.street = streetData;

            return photo.save(photoData, metaData);
        })
        .catch(err => console.error(err));
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
        return NearbyPlaces.getStreetName(location)
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
        const draggedDown = dy > 30;
        const draggedUp = dy < -30;
        const draggedLeft = dx < -30;
        const draggedRight = dx > 30;
    
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
            this.closeModal();
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
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
    'bottomActions': {
        flex: 1,
        flexDirection: 'row'
    },
    'nearby': {
    //    flexGrow: 1
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
    'capture': {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 5,
        borderColor: '#FFF',
        marginBottom: 15,
        marginTop: 20
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
    }
});

export default CaptureView;