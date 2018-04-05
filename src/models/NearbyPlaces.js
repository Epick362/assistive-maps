import axios from "axios";

const GOOGLE_API_KEY = "AIzaSyDAIqv6972rtwEXJI0lTlNCy3yBp_XZuME";

class NearbyPlaces {
    static getNearby(position) {
        const nearbyApi = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';

        const nearbyApiUrl = nearbyApi +
            "location=" +
            [position.coords.latitude, position.coords.longitude].join(',') +
            "&rankby=distance" +
            "&type=point_of_interest" +
            "&key=" +
            GOOGLE_API_KEY;

        return axios.get(nearbyApiUrl);
    }

    static getStreetName(position) {
        const reverseGeocodingApi = 'https://maps.googleapis.com/maps/api/geocode/json?';

        const reverseGeocodingApiUrl = reverseGeocodingApi + 
            "latlng=" +
            [position.latitude, position.longitude].join(',') +
            "&key=" +
            GOOGLE_API_KEY;

        return axios.get(reverseGeocodingApiUrl);
    }
}

export default NearbyPlaces;