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
    TouchableOpacity,
    Dimensions
} from "react-native";
import RNPhotosFramework from 'react-native-photos-framework';
import Carousel from 'react-native-snap-carousel';
import Tts from 'react-native-tts';

import Storage, {PHOTOS_LIBRARY_KEY} from '../models/Storage';
import Gallery from '../models/Gallery';
import Maps from "../models/Maps";

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

    tapPhoto = (photo) => {
        let ttsContent = 'Fotka ';

        if (photo.metaData) {
            if (photo.metaData.street && photo.metaData.street.formatted_address) {
                ttsContent += 'odfotena na ulici '+ photo.metaData.street.formatted_address + '. ';
            }

            if (photo.metaData.nearby.length > 0) {
                ttsContent += 'Blízke miesta: ';
                let nearbyNames = photo.metaData.nearby.map((near) => near.name);
                ttsContent += nearbyNames.join(',');
                ttsContent += '.';
            }

            if (photo.metaData.timestamp) {
                let date = new Date(photo.metaData.timestamp);
                let humanDate = date.toLocaleString('cs-CZ');
                ttsContent += 'Fotka bola vytvorená dňa '+ humanDate;
            }
        }

        Tts.speak(ttsContent);
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

    _renderItem = ({item, index}) => {
        return (
            <TouchableOpacity onPress={() => this.tapPhoto(item)}>
            <View style={styles.slideInnerContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={item.image}
                    />
                </View>
                {
                    item.metaData &&
                    <View style={styles.metadataContainer}>
                        <Text style={styles.propertyTitle}>
                            Nazov ulice
                        </Text>
                        <Text style={styles.propertyValue}>
                            {item.metaData.street.formatted_address}
                        </Text>
                        
                        <Text style={styles.propertyTitle}>
                           Blízke miesta
                        </Text>
                        <View style={styles.propertyValue}>
                            {
                                item.metaData.nearby.map((near, i) => {
                                    return (
                                        <Text key={i}>{ near.name }</Text>
                                    )
                                })
                            }
                        </View>

                        <Text style={styles.propertyTitle}>
                            GPS lokácia
                        </Text>
                        <View style={styles.propertyValue}>
                            <Text>Latitude: {item.metaData.location.latitude}</Text>
                            <Text>Longitude: {item.metaData.location.longitude}</Text>
                            <Text>Smer: {item.metaData.heading}˚</Text>
                        </View>
                    </View>
                }
            </View>
            </TouchableOpacity>
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
                    onSnapToItem={(index) => Tts.stop() }
                />

                <Text style={styles.closeGallery}>Potiahni dole pre zatvorenie Galérie</Text>
            </View>
        )
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
        marginVertical: 20
    },
    image: {
        width: itemWidth,
        height: 300,
        resizeMode: 'contain'
    },
    propertyTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginVertical: 5
    },
    propertyValue: {

    },
    closeGallery: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        fontSize: 16
    }
})

export default GalleryView;