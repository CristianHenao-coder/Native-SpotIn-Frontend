export const TARGET_LOCATION = {
    // Example coordinates (Change these to your Institution's location)
    latitude: 6.2442,   // Example: Medelling, Colombia
    longitude: -75.5812,
    radiusMeters: 100, // Allowed radius in meters
};

// Haversine formula to calculate distance in meters
export const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
};

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}
