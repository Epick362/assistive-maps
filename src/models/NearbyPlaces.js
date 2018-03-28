import axios from "axios";

class NearbyPlaces {
    static getNearby(position) {
        const nearbyApi = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
        const GOOGLE_API_KEY = "AIzaSyDAIqv6972rtwEXJI0lTlNCy3yBp_XZuME";

        const nearbyApiUrl = nearbyApi +
            "location=" +
            [position.coords.latitude, position.coords.longitude].join(',') +
            "&rankby=distance" +
            "&type=point_of_interest" +
            "&key=" +
            GOOGLE_API_KEY;

        return axios.get(nearbyApiUrl);
    }
}

export default NearbyPlaces;