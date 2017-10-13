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
    DeviceEventEmitter
} from "react-native";
import Camera from "react-native-camera";
import axios from "axios";
import ReactNativeHeading from "react-native-heading";

import NearbyListView from './nearbyListView';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            latitude: null, 
            longitude: null,
            error: null,
            nearby: []
        };
    }

    componentDidMount() {
        ReactNativeHeading.start(1).then(didStart => {
            this.setState({
                headingIsSupported: didStart
            });
        });

        DeviceEventEmitter.addListener("headingUpdated", data => {
            this.setState({
                heading: data.heading
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
        <Camera ref={cam => {
            this.camera = cam;
          }} style={styles.preview} aspect={Camera.constants.Aspect.fill}>
          <NearbyListView style={styles.nearby} data={this.state.nearby} />
          <View style={styles.gpsPosition}>
            <Text style={styles.gpsPosition__text}>
              Latitude: {this.state.latitude}
            </Text>
            <Text style={styles.gpsPosition__text}>
              Longitude: {this.state.longitude}
            </Text>
            <Text style={styles.gpsPosition__text}>
              Heading: {this.state.heading}
            </Text>
            {this.state.error ? <Text>
                Error: {this.state.error}
              </Text> : null}
          </View>
        </Camera>
      </View>;
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
            this.setState({ nearby: data.data.results });
            console.log('Nearby', data.data.results);

            return data;
        });
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
        flex: 0,
        height: 200
    }
});
