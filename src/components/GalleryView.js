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
import Carousel from 'react-native-snap-carousel';
import Storage, {PHOTOS_LIBRARY_KEY} from '../models/Storage';
import Gallery from '../models/Gallery';
import NearbyPlaces from "../models/NearbyPlaces";

const { width, height } = Dimensions.get('window');

function wp (percentage) {
    const value = (percentage * width) / 100;
    return Math.round(value);
}

const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);

const sliderWidth = width;
const itemWidth = slideWidth + itemHorizontalMargin * 2;


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

            return photos;
        })
        .then(imageAssets => {
            return Storage.retrieve(PHOTOS_LIBRARY_KEY);
        })
        .then(imageMetadata => {
            this.state.photos.map((photo) => {
                if (imageMetadata[photo.localIdentifier]) {
                    photo.metaData = imageMetadata[photo.localIdentifier];
                }

                return photo;
            });
        })
    }

    _renderItem ({item, index}) {
        return (
            <View style={styles.slideInnerContainer}>
                <Text style={styles.title}>{ item.localIdentifier }</Text>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={item.image}
                    />
                </View>
                <Text>
                    { JSON.stringify(item.metaData) }
                </Text>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.modalContainer}>
                <Carousel
                    ref={(c) => { this._carousel = c; }}
                    data={this.state.photos}
                    renderItem={this._renderItem}
                    sliderWidth={sliderWidth}
                    itemWidth={itemWidth}
                />
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
        flex: 1,
        paddingTop: 50
    },
    slideInnerContainer: {
        width: itemWidth,
        height: height * 0.36,
        paddingHorizontal: itemHorizontalMargin
    },
    imageContainer: {
        backgroundColor: 'white'
    },
    image: {
        width: itemWidth,
        height: 200,
        resizeMode: 'contain'
    }
})

export default GalleryView;