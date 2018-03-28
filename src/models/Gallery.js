import RNPhotosFramework from 'react-native-photos-framework';

class Gallery {
    static saveToAlbum(imageAsset, album) {
        return RNPhotosFramework.createAssets({
            images : [imageAsset],
            album : album,
            includeMetadata: true
        });
    }
}

export default Gallery;