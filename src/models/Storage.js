import { AsyncStorage, Platform } from 'react-native';
import Hashes from 'jshashes';

let MD5 = new Hashes.MD5;

export const PHOTOS_LIBRARY_KEY = 'photos';

class Storage {
    static save(key, data) {
        return AsyncStorage.setItem(key, JSON.stringify(data));
    }

    static retrieve(key = PHOTOS_LIBRARY_KEY) {
        return AsyncStorage.getItem(key).then(data => {
            return JSON.parse(data);
        });
    }

    static appendMetadata(photo, metaData) {
        return Storage.retrieve(PHOTOS_LIBRARY_KEY)
        .then((library) => {
            if (!library) {
                library = {}
            }

            let hash;
            if (Platform.OS === 'ios') {
                hash = MD5.hex(photo[0].localIdentifier);
            } else {
                hash = MD5.hex(photo);
            }
            library[hash] = metaData;

            return Storage.save(PHOTOS_LIBRARY_KEY, library)
        });
    }
}

export default Storage;