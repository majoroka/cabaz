const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(from, to) {
  if (
    !from ||
    !to ||
    !Number.isFinite(from.lat) ||
    !Number.isFinite(from.lng) ||
    !Number.isFinite(to.lat) ||
    !Number.isFinite(to.lng)
  ) {
    return null;
  }

  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const startLat = toRadians(from.lat);
  const endLat = toRadians(to.lat);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function getAverageCoordinates(locations) {
  const validLocations = locations.filter(
    (location) => Number.isFinite(location.lat) && Number.isFinite(location.lng)
  );

  if (validLocations.length === 0) {
    return null;
  }

  return {
    lat: validLocations.reduce((sum, location) => sum + location.lat, 0) / validLocations.length,
    lng: validLocations.reduce((sum, location) => sum + location.lng, 0) / validLocations.length
  };
}
