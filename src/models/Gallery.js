import { Platform, CameraRoll } from 'react-native';
import _ from 'lodash';
import RNPhotosFramework from 'react-native-photos-framework';
import CameraRollExtended from 'react-native-store-photos-album';
import Hashes from 'jshashes';

import Storage from '../models/Storage';

import { ALBUM_NAME } from '../constants';

let MD5 = new Hashes.MD5;

class Gallery {
    constructor() {
        this.photos = [];
        this.loaded = false;
    }
    
    static saveToAlbum(imageAsset, album) {
        return RNPhotosFramework.createAssets({
            images : [imageAsset],
            album : album,
            includeMetadata: true
        });
    }

    static save(imageAsset) {
        return CameraRoll.saveToCameraRoll(imageAsset.uri, 'photo');
    }

    load() {
        if (Platform.OS === 'ios') {
            return this._loadiOSPhotos()
        } else {
            return this._loadAndroidPhotos()
        }
    }

    _loadiOSPhotos() {
        let photosData;

        return Promise.all([RNPhotosFramework.getAlbumsByTitle(ALBUM_NAME), Storage.retrieve()])
        .then((promises) => {
            let album = promises[0].albums[0];
            photosData = promises[1];

            return album.getAssets({
                startIndex: 0,
                endIndex: 20
            });
        })
        .then((result) => {
            let assets = result.assets;

            _.map(assets, (asset) => {
                let assetHash = MD5.hex(asset.localIdentifier);
                let assetData = photosData[assetHash] || null;

                this.photos.push({
                    hash: assetHash,
                    image: asset.image,
                    data: assetData
                });
            });

            this.loaded = true;

            return this.photos;
        });
    }

    _loadAndroidPhotos() {
        return Promise.all([CameraRoll.getPhotos({first: 20, assetType: 'Photos'}), Storage.retrieve()])
        .then((promises) => {
            let assets = promises[0].edges;
            let photosData = promises[1] || {};

            _.map(assets, (asset) => {
                let assetHash = MD5.hex(asset.node.image.uri);
                let assetData = photosData[assetHash] || null

                this.photos.push({
                   hash: assetHash,
                   image: asset.node.image,
                   data: assetData
                });
            });

            this.loaded = true;

            return this.photos;
        })
    }
}

export default Gallery;