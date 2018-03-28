import RNPhotosFramework from 'react-native-photos-framework';

import Gallery from './Gallery'

const ALBUM_NAME = 'Assistive Maps';

class Photo {
    constructor() {
        this.uri = null;
    }

    save(data) {
        this.uri = data.uri;

        return RNPhotosFramework.getAlbumsByTitle(ALBUM_NAME)
        .then((result) => {
            if (result.albums.length <= 0) {
                return RNPhotosFramework.createAlbum(ALBUM_NAME)
                .then((album) => {
                    return Gallery.saveToAlbum({uri: data.uri}, album)
                })
            } else {
                return Gallery.saveToAlbum({uri: data.uri}, result.albums[0])
            }
        });
    }
}

export default Photo;