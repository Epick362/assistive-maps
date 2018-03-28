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

const { width } = Dimensions.get('window')

class GalleryView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            photos: []
        };
    }

    componentDidMount() {
        CameraRoll.getPhotos({
            first: 20,
            groupTypes: 'Album',
            groupName: 'Assistive Maps'
        })
        .then(photos => {
            this.setState({
                photos: photos.edges
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
                <ScrollView
                    contentContainerStyle={styles.scrollView}>
                    {
                        this.state.photos.map((p, i) => {
                        return (
                            <TouchableHighlight
                            key={i}
                            underlayColor='transparent'
                            // onPress={() => this.setIndex(i)}
                            >
                            <Image
                                style={{
                                width: width/3,
                                height: width/3
                                }}
                                source={{uri: p.node.image.uri}}
                            />
                            </TouchableHighlight>
                        )
                        })
                    }
                </ScrollView>
            </View>
        )
    }

    closeGallery() {

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