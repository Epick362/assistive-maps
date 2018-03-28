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
    Modal
} from "react-native";

import { RNCamera } from "react-native-camera";
import ReactNativeHeading from "react-native-heading";
import _ from "lodash";

import NearbyView from './NearbyView';
import GalleryView from './GalleryView';

import Location from '../models/Location';
import Photo from '../models/Photo';
import NearbyPlaces from '../models/NearbyPlaces';

const { width } = Dimensions.get('window')

class CaptureView extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            heading: 0,
            latitude: 0, 
            longitude: 0,
            galleryVisible: false,
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

    componentWillUnmount() {
        ReactNativeHeading.stop();
        DeviceEventEmitter.removeAllListeners('headingUpdated');
    }

    render() {
        return <View style={styles.container}>
            <RNCamera ref={cam => {
                this.camera = cam;
            }} style={styles.preview}>
                <View style={styles.nearby}>
                    <NearbyView data={this.state.targets} />
                </View>
                <View style={styles.bottomActions}>
                    <TouchableHighlight 
                        style={styles.capture} 
                        onPress={this.takePicture.bind(this)}
                        underlayColor="rgba(255, 255, 255, 0.5)">
                        <View />
                    </TouchableHighlight>

                    <View style={styles.gpsPosition}>
                        <Text style={styles.gpsPosition__text}>
                        LAT: {this.state.latitude.toFixed(3)}°
                        </Text>
                        <Text style={styles.gpsPosition__text}>
                        LNG: {this.state.longitude.toFixed(3)}°
                        </Text>
                        <Text style={styles.gpsPosition__text}>
                        Heading: { Math.round(this.state.heading) }°
                        </Text>
                        {this.state.error ? <Text>
                            Error: {this.state.error}
                        </Text> : null}
                    </View>
                    <TouchableHighlight 
                        style={styles.gallery}
                        onPress={this.toggleModal}
                        underlayColor="rgba(255, 255, 255, 0.5)">
                       <View />
                    </TouchableHighlight>
                </View>
                
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

        console.log(NearbyPlaces);

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
    
    toggleModal = () => {
        this.setState({ galleryVisible: !this.state.galleryVisible });
    }

    takePicture() {
        let photo = new Photo();

        this.camera.takePictureAsync()
        .then(photo.save)
        .catch(err => console.error(err));
    }

    processNearbyData(position, nearby = []) {
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

    updateWorldData(heading, nearby = []) {
        let { latitude, longitude } = this.state;

        nearby.forEach((near) => {
            near.thetaHeading = near.theta ? Math.abs(heading - near.theta) : 0;
            near.distance = Location.calculateDistance(near.coords, { latitude, longitude });
        });

        return _.sortBy(nearby, 'thetaHeading');
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
    }
});

export default CaptureView;