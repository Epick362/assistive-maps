/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
    AppRegistry,
    Dimensions,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    DeviceEventEmitter,
    CameraRoll,
    Alert,
    Modal
} from "react-native";
import { RNCamera } from "react-native-camera";
import axios from "axios";
import ReactNativeHeading from "react-native-heading";
import _ from "lodash";
import CameraRollExtended from 'react-native-store-photos-album';

import NearbyListView from './nearbyListView';
import PhotoGallery from './PhotoGallery';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            latitude: null, 
            longitude: null,
            error: null,
            galleryVisible: false,
            nearby: []
        };
    }

    componentDidMount() {
        ReactNativeHeading.start(1).then(didStart => {
            this.setState({
                headingIsSupported: didStart
            });
        });

        DeviceEventEmitter.addListener('headingUpdated', data => {
            let lookingAt = this.updateWorldData(data.heading, this.state.nearby);

            this.setState({
                heading: data.heading,
                nearby: lookingAt,
                targets: lookingAt.slice(0, 3)
            });
        });

        navigator.geolocation.watchPosition(
        position => {
            this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                error: null
            });

            this.loadNearby(position);
        },
        error => this.setState({ error: error.message }),
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000,
            distanceFilter: 10
        }
        );
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
                <NearbyListView style={styles.nearby} data={this.state.targets} />
                <Text style={styles.capture} onPress={this.takePicture.bind(this)}>
                    [CAPTURE]
                </Text>
                <Text style={styles.capture} onPress={this.toggleModal}>
                    [Gallery]
                </Text>
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.galleryVisible}
                >
                    <PhotoGallery toggleModal={this.toggleModal}></PhotoGallery>
                </Modal>
                <View style={styles.gpsPosition}>
                    <Text style={styles.gpsPosition__text}>
                    LAT: {this.state.latitude}
                    </Text>
                    <Text style={styles.gpsPosition__text}>
                    LNG: {this.state.longitude}
                    </Text>
                    <Text style={styles.gpsPosition__text}>
                    Heading: {this.state.heading}
                    </Text>
                    {this.state.error ? <Text>
                        Error: {this.state.error}
                    </Text> : null}
                </View>
            </RNCamera>
        </View>;
    }
    
    toggleModal = () => {
        this.setState({ galleryVisible: !this.state.galleryVisible });
    }

    takePicture() {
        this.camera.takePictureAsync()
        .then((data) => {
            CameraRollExtended.saveToCameraRoll({uri: data.uri, album: 'Assistive Maps'}, 'photo')
            .then(Alert.alert('Success', 'Photo added to album!'))
            // CameraRoll.saveToCameraRoll(data.uri)
            // .then(Alert.alert('Success', 'Photo added to camera roll!'))
        })
        .catch(err => console.error(err));
    }

    loadNearby(position) {
        const nearbyApi = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
        const GOOGLE_API_KEY = "AIzaSyDAIqv6972rtwEXJI0lTlNCy3yBp_XZuME";

        const nearbyApiUrl = nearbyApi +
            "location=" +
            [position.coords.latitude, position.coords.longitude].join(',') +
            "&rankby=distance" +
            "&type=point_of_interest" +
            "&key=" +
            GOOGLE_API_KEY;

        return axios.get(nearbyApiUrl).then(data => {
            let processedNearby = this.processNearbyData(position, data.data.results);

            this.setState({ nearby: processedNearby });

            return data;
        });
    }

    processNearbyData(position, nearby = []) {
        nearby = _.map(nearby, (near) => {
            near.coords = {
                latitude: near.geometry.location.lat,
                longitude: near.geometry.location.lng
            };
            near.theta = this.calculateTheta(position.coords, near.coords);

            return near;
        });

        return nearby;
    }

    calculateTheta(point1, point2) {
        let theta = Math.atan2(
            point2.longitude - point1.longitude,
            point2.latitude - point1.latitude
        );

        // theta = (theta + Math.PI) * 360.0 / (2.0 * Math.PI);
        theta = theta * 180 / Math.PI;

        return theta + Math.ceil(-theta / 360) * 360;
    }

    calculateDistance(point1, point2) {
        // Fast Haversine distance
        let p = 0.017453292519943295;    // Math.PI / 180
        let c = Math.cos;
        let a = 0.5 - c((point2.latitude - point1.latitude) * p)/2 + 
                c(point1.latitude * p) * c(point2.latitude * p) * 
                (1 - c((point2.longitude - point1.longitude) * p))/2;

        return 12742 * Math.asin(Math.sqrt(a)) * 1000; // 2 * R; R = 6371 km
    }

    updateWorldData(heading, nearby = []) {
        let { latitude, longitude } = this.state;


        nearby.forEach((near) => {
            near.thetaHeading = near.theta ? Math.abs(heading - near.theta) : 0;
            near.distance = this.calculateDistance(near.coords, { latitude, longitude });
        });

        return _.sortBy(nearby, 'thetaHeading');
    }
}

const styles = StyleSheet.create({
    'container': {
        flex: 1,
        flexDirection: "row"
    },
    'preview': {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center"
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
    'nearby': {
        flex: 0
    },
    'capture': {
        margin: 20
    }
});
