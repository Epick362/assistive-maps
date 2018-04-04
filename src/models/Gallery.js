import RNPhotosFramework from 'react-native-photos-framework';
import { ALBUM_NAME } from '../constants';

class Gallery {
    static saveToAlbum(imageAsset, album) {
        return RNPhotosFramework.createAssets({
            images : [imageAsset],
            album : album,
            includeMetadata: true
        });
    }

    static load() {
        return RNPhotosFramework.getAlbumsByTitle(ALBUM_NAME)
        .then((result) => {
            let album = result.albums[0];

            return album.getAssets({
                startIndex: 0,
                endIndex: 20
            });
        });
    }
}

export default Gallery;