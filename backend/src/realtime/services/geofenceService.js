const geofences = [
  {
    id: "office",
    center: { latitude: 13.0827, longitude: 80.2707 },
    radius: 1000,
  },
];

const vehicleStates = Object.create(null);

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function checkGeofence(vehicleKey, location) {
  for (const fence of geofences) {
    const distance = getDistance(location.latitude, location.longitude, fence.center.latitude, fence.center.longitude);
    const inside = distance <= fence.radius;
    const previous = vehicleStates[vehicleKey]?.[fence.id] || false;

    if (inside !== previous) {
      if (!vehicleStates[vehicleKey]) vehicleStates[vehicleKey] = {};
      vehicleStates[vehicleKey][fence.id] = inside;
      return { geofenceId: fence.id, event: inside ? "entered" : "exited", distance: Math.round(distance) };
    }
  }
  return null;
}

module.exports = { checkGeofence, getDistance };