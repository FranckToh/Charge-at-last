/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @returns Distance in Kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

/**
 * Calculates ETA in minutes assuming an average urban driving speed.
 */
export const calculateEtaMinutes = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
  // Average urban speed ~35 km/h considering traffic and stoplights
  const averageSpeedKmH = 35; 
  // Add 2 minutes for buffering/parking
  const bufferMinutes = 2;
  
  const timeHours = distanceKm / averageSpeedKmH;
  const timeMinutes = Math.ceil(timeHours * 60) + bufferMinutes;
  
  return Math.max(1, timeMinutes); // Minimum 1 minute
};