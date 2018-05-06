import RNPhotosFramework from 'react-native-photos-framework';
import { Platform } from 'react-native';

import Gallery from './Gallery';
import Storage from '../models/Storage';

import { ALBUM_NAME } from '../constants';

class Photo {
    constructor() {
        this.uri = null;
    }

    save(data, meta) {
        this.uri = data.uri;

        console.log('Photo data:', data);
        
        if (Platform.OS === 'ios') {
            return RNPhotosFramework.getAlbumsByTitle(ALBUM_NAME)
            .then((result) => {
                if (result.albums.length <= 0) {
                    return RNPhotosFramework.createAlbum(ALBUM_NAME)
                    .then((album) => {
                        return Gallery.saveToAlbum({uri: data.uri}, album);
                    })
                } else {
                    return Gallery.saveToAlbum({uri: data.uri}, result.albums[0]);
                }
            })
            .then((photo) => {
                return Storage.appendMetadataToStorage(photo, meta);
            })
        } else {
            return Gallery.save({uri: data.uri})
            .then((photo) => {
                return Storage.appendMetadataToStorage(photo, meta);
            });
        }
    }
}

export default Photo;