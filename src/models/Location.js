class Location {
    static calculateTheta(point1, point2) {
        let theta = Math.atan2(
            point2.longitude - point1.longitude,
            point2.latitude - point1.latitude
        );

        theta = theta * 180 / Math.PI;

        return theta + Math.ceil(-theta / 360) * 360;
    }

    static calculateDistance(point1, point2) {
        // Fast Haversine distance
        let p = 0.017453292519943295;    // Math.PI / 180
        let c = Math.cos;
        let a = 0.5 - c((point2.latitude - point1.latitude) * p)/2 + 
                c(point1.latitude * p) * c(point2.latitude * p) * 
                (1 - c((point2.longitude - point1.longitude) * p))/2;

        return 12742 * Math.asin(Math.sqrt(a)) * 1000; // 2 * R; R = 6371 km
    }
}

export default Location;