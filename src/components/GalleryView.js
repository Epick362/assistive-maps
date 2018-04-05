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
    Dimensions
} from "react-native";
import RNPhotosFramework from 'react-native-photos-framework';
import Storage from '../models/Storage';
import Gallery from '../models/Gallery';
import NearbyPlaces from "../models/NearbyPlaces";

const { width } = Dimensions.get('window')

class GalleryView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            photos: []
        };
    }

    componentDidMount() {
        Gallery.load()
        .then(photos => {
            this.setState({
                photos: photos.assets
            });
        })
    }

    render() {
        return (
            <View style={styles.modalContainer}>
                <Button
                    title='Close'
                    onPress={this.props.toggleModal}
                />
                <ScrollView contentContainerStyle={styles.scrollView}>
                    {
                        this.state.photos.map((p, i) => {
                        return (
                            <TouchableHighlight
                            key={i}
                            underlayColor='transparent'
                            onPress={() => this.setIndex(i)}
                            >
                                <Image
                                    style={{
                                    width: width/3,
                                    height: width/3
                                    }}
                                    source={p.image}
                                />
                            </TouchableHighlight>
                        )
                        })
                    }
                </ScrollView>
            </View>
        )
    }

    setIndex(i) {
        console.log('index', i);
        console.log('photo data', this.state.photos[i]);
        Storage.getPhotoByIdentifier(this.state.photos[i].localIdentifier)
        .then((data) => {
            console.log('photo metadata', data);
        })
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        paddingTop: 20,
        flex: 1
      },
      scrollView: {
        flexWrap: 'wrap',
        flexDirection: 'row'
    }
})

export default GalleryView;