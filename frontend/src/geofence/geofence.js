<MapContainer
  center={[12.9716, 77.5946]}
  zoom={12}
  style={{ height: "400px", width: "100%", borderRadius: "10px" }}
>

  <ChangeMapView
    center={[
      location.latitude,
      location.longitude,
    ]}
  />

  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  <Circle
    center={geofence.center}
    radius={geofence.radius}
    pathOptions={{
      color: "red",
      fillColor: "red",
      fillOpacity: 0.2,
    }}
  />

  {vehicles.map((vehicle) => (
    <Marker
      key={vehicle.vehicleId}
      position={[
        vehicle.location.latitude,
        vehicle.location.longitude,
      ]}
    >
      <Popup>
        <div>
          <strong>{vehicle.vehicleId}</strong>
          <br />
          Fleet: {vehicle.fleetId}
          <br />
          Speed: {vehicle.location.speed} km/h
        </div>
      </Popup>
    </Marker>
  ))}

</MapContainer>