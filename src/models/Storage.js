import { AsyncStorage } from 'react-native';

export const PHOTOS_LIBRARY_KEY = 'photos';

class Storage {
    static save(key, data) {
        return AsyncStorage.setItem(key, JSON.stringify(data));
    }

    static retrieve(key) {
        return AsyncStorage.getItem(key).then(data => {
            return JSON.parse(data);
        });
    }

    static getPhotoByIdentifier(id) {
        return Storage.retrieve(PHOTOS_LIBRARY_KEY)
        .then(data => {
            if (!data || !data[id]) {
                return null;
            }

            return data[id];
        })
    }

    static appendMetadataToStorage(photo, metaData) {
        return Storage.retrieve(PHOTOS_LIBRARY_KEY)
        .then((library) => {
            if (!library) {
                library = {}
            }

            library[photo[0].localIdentifier] = {
                ...metaData,
                data: photo[0]
            };

            return Storage.save(PHOTOS_LIBRARY_KEY, library)
        });
    }
}

export default Storage;