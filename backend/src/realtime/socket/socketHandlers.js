const { updateVehicleLocation } = require("../../services/vehicleService");
const { checkGeofence } = require("../services/geofenceService");

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isFleetId = (value) => typeof value === "string" && value.trim().length > 0;

module.exports = (io, socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("join:fleet", (fleetId, acknowledge) => {
    if (!isFleetId(fleetId)) {
      const error = "A valid fleetId is required.";
      if (typeof acknowledge === "function") acknowledge({ ok: false, error });
      return socket.emit("joined:fleet:error", { error });
    }

    const room = fleetId.trim();
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
    socket.emit("joined:fleet", room);
    if (typeof acknowledge === "function") acknowledge({ ok: true, fleetId: room });
  });

  socket.on("vehicle:location", (data = {}, acknowledge) => {
    const { fleetId, vehicleId, latitude, longitude, speed } = data;
    const isValid = isFleetId(fleetId) && typeof vehicleId === "string" && vehicleId.trim() &&
      isFiniteNumber(latitude) && latitude >= -90 && latitude <= 90 &&
      isFiniteNumber(longitude) && longitude >= -180 && longitude <= 180 &&
      (speed === undefined || (isFiniteNumber(speed) && speed >= 0));

    if (!isValid) {
      const error = "fleetId, vehicleId, valid latitude/longitude, and a non-negative numeric speed are required.";
      if (typeof acknowledge === "function") acknowledge({ ok: false, error });
      return socket.emit("vehicle:location:error", { error });
    }

    const room = fleetId.trim();
    const vehicle = updateVehicleLocation(room, vehicleId.trim(), { latitude, longitude, ...(speed === undefined ? {} : { speed }) });
    io.to(room).emit("vehicle:location", vehicle);

    const geofenceEvent = checkGeofence(`${room}:${vehicle.vehicleId}`, {
      latitude,
      longitude,
    });
    if (geofenceEvent) {
      const alert = { fleetId: room, vehicleId: vehicle.vehicleId, location: vehicle.location, occurredAt: new Date(), ...geofenceEvent };
      io.to(room).emit("geofence:alert", alert);
      console.log(`Vehicle ${vehicle.vehicleId} ${geofenceEvent.event} ${geofenceEvent.geofenceId}`);
    }

    console.log(`Vehicle ${vehicle.vehicleId} location updated for ${room}`);
    if (typeof acknowledge === "function") acknowledge({ ok: true, vehicle });
  });

  socket.on("disconnect", () => console.log(`Disconnected: ${socket.id}`));
};