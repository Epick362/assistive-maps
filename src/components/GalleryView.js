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
    TouchableOpacity,
    Dimensions
} from "react-native";
import Carousel from 'react-native-snap-carousel';
import Tts from 'react-native-tts';
import Icon from 'react-native-fa-icons';
import Fuse from 'fuse.js';
import ImagePreview from 'react-native-image-preview';

import Gallery from '../models/Gallery';
import Maps from "../models/Maps";
import VoiceRecognition from '../models/VoiceRecognition';

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
        Tts.stop();
        let ttsContent = 'Fotka ';

        if (photo.data) {
            if (photo.data.name) {
                ttsContent += photo.data.name + ', ';
            }

            if (photo.data.street && photo.data.street.formatted_address) {
                ttsContent += 'odfotená na adrese '+ photo.data.street.formatted_address + '. ';
            }

            if (photo.data.nearby.length > 0) {
                ttsContent += 'Blízke miesta: ';
                let nearbyNames = photo.data.nearby.map((near) => near.name);
                ttsContent += nearbyNames.join(', ');
                ttsContent += '.';
            }

            if (photo.data.timestamp) {
                let date = new Date(photo.data.timestamp);
                let humanDate = date.toLocaleString('sk-SK');
                ttsContent += 'Odfotené dňa '+ humanDate + '.';
            }
        }

        Tts.speak(ttsContent);
    }

    componentDidMount() {
        let gallery = new Gallery();

        gallery.load()
        .then(photos => {
            this.setState({
                photos: photos
            });
        });
    }

    _renderItem = ({item, index}) => {
        return (
            <View style={styles.slideInnerContainer}>
            <TouchableOpacity 
                onPress={() => this.tapPhoto(item)}
                onLongPress={() => this.openPreview(item)}
            >
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={item.image}
                    />
                </View>
                {
                    item.data &&
                    <View style={styles.dataContainer}>
                        <Text style={styles.propertyTitle}>
                            Názov fotky
                        </Text>
                        <Text style={styles.propertyValue}>
                            {item.data.name}
                        </Text>
                
                        <Text style={styles.propertyTitle}>
                            Adresa
                        </Text>
                        <Text style={styles.propertyValue}>
                            {item.data.street.formatted_address}
                        </Text>
                        
                        <Text style={styles.propertyTitle}>
                           Blízke miesta
                        </Text>
                        <View style={styles.propertyValue}>
                            {
                                item.data.nearby.map((near, i) => {
                                    return (
                                        <Text key={i}>{ near.name }</Text>
                                    )
                                })
                            }
                        </View>
                    </View>
                }
                </TouchableOpacity>
            </View>
        );
    }

    renderBottomButton() {
        if (!this.state.query) {
            return (
                <TouchableHighlight 
                    accessible={true}
                    accessibilityLabel={'Vyhľadať fotku'}
                    onPress={this.searchGallery} style={styles.searchButton}>
                    <Text style={styles.defaultButtonText}>
                        <Icon name='search' /> Vyhľadávanie
                    </Text>
                </TouchableHighlight>
            );
        } else {
            return (
                <TouchableHighlight 
                    onPress={this.clearSearch} style={styles.clearSearchButton}>
                    <Text style={styles.defaultButtonText}>
                        <Icon name='times' /> Ukončiť vyhľadávanie "{this.state.query}"
                    </Text>
                </TouchableHighlight>
            );
        }
    }

    render() {
        return (
            <View style={styles.modalContainer}>
                <Text style={styles.galleryTitle}><Icon name='photo' /> Galéria</Text>
                <View style={styles.galleryButtons}>
                    <TouchableHighlight 
                        accessible={true}
                        accessibilityLabel={'Zatvoriť galériu'}
                        onPress={this.props.closeModal} style={styles.closeGalleryButton}>
                        <Text style={styles.defaultButtonText}>
                            <Icon name='chevron-down' />
                        </Text>
                    </TouchableHighlight>
                </View>

                <Carousel
                    ref={(c) => { this._carousel = c; }}
                    data={this.state.query ? this.state.searchResults : this.state.photos}
                    renderItem={this._renderItem}
                    sliderWidth={sliderWidth}
                    itemWidth={itemWidth}
                    // onSnapToItem={}
                />

                <View style={styles.bottomActions}>
                    { this.renderBottomButton() }
                </View>
            </View>
        )
    }

    openPreview = (photo) => {
        this.setState({
            previewVisible: true,
            preview: photo
        });
    }

    closePreview = () => {
        this.setState({
            previewVisible: false,
            preview: null
        })
    }

    searchGallery = () => {
        this.recordLookupPhotoName()
        .then(query => {
            var options = {
                shouldSort: true,
                threshold: 0.6,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: [
                  "data.name",
                  "data.street.formatted_address",
                  "data.nearby.name"
              ]
            };

            var fuse = new Fuse(this.state.photos, options);
            var result = fuse.search(query);

            if (!result) {
                Tts.speak('Nenašiel som žiadne fotky pre výraz: ' + query);
                return;
            }

            this._carousel.snapToItem(0, false, false);
            this.setState({
                query: query,
                searchResults: result
            });

            Tts.speak('Našiel som ' + result.length + ' fotiek pre výraz: ' + query);

            let resultNames = result.map((item) => item.data.name);
            Tts.speak(resultNames.join(', '));
        });
    }

    clearSearch = () => {
        this.setState({
            query: ''
        });
    }

    recordLookupPhotoName = () => {
        let voiceRec = new VoiceRecognition();

        return voiceRec.recordPhotoName('Vyhľadávanie. Po zaznení tónu, vyslovte hľadaný výraz', 5500);
    }
}

const bottomButton = {
    justifyContent: 'center', 
    alignItems: 'center', 
    alignSelf: 'center',
    borderRadius: 14,
    padding: 20,
    width: '90%',
    marginHorizontal: 5
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        paddingTop: 90
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
    galleryTitle: {
        position: 'absolute',
        left: 20,
        top: 40,
        fontSize: 28,
        fontWeight: 'bold'
    },
    bottomActions: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignSelf: 'center'
    },
    galleryButtons: {
        position: 'absolute',
        top: 40,
        right: 10,
        flex: 1,
        flexDirection: 'row'
    },
    searchButton: {
        ...bottomButton,
        backgroundColor: '#5158bb',
    },
    clearSearchButton: {
        ...bottomButton,
        backgroundColor: '#FF4400'
    },
    closeGalleryButton: {
        backgroundColor: '#FF4400',
        justifyContent: 'center', 
        alignItems: 'center', 
        width: 45,
        height: 45,
        borderRadius: 45
    },
    defaultButtonText: {
        color: '#FFF'
    }
})

export default GalleryView;