import React, { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useVehicleLocations } from "../../hooks/useVehicleLocations";
import { Wifi, WifiOff, RefreshCw, Cpu, Activity, Info, MapPin, Send, Gauge } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { geofence } from "../../utils/geofence";
import { isVehicleInsideGeofence } from "../../utils/geofenceHelper";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const sampleLocation = {
  fleetId: "fleet-001",
  vehicleId: "VH001",
  latitude: 12.9716,
  longitude: 77.5946,
  speed: 72,
};

function ChangeMapView({ center }) {
  const map = useMap();

  React.useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

function Dashboard() {
  const { isConnected, transport, reconnectAttempts, socket } = useSocket();
  const { vehicles, events, alerts, sendLocation, joinFleet, joinedFleet } = useVehicleLocations();
  const [location, setLocation] = useState(sampleLocation);
  const [sendError, setSendError] = useState("");
  const [breachMessage, setBreachMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isConnected) joinFleet("fleet-001");
  }, [isConnected, joinFleet]);
  useEffect(() => {
  if (vehicles.length === 0) return;

  const vehicle = vehicles[0];

  const inside = isVehicleInsideGeofence(
    vehicle.location.latitude,
    vehicle.location.longitude,
    geofence
  );

  if (inside) {
    setBreachMessage("🟢 Vehicle is inside the geofence.");
  } else {
    setBreachMessage("🔴 Vehicle is outside the geofence.");
  }
}, [vehicles]);

  const updateField = (field, value) => setLocation((current) => ({ ...current, [field]: value }));
  const handleJoinFleet = () => {
    setSendError("");
    joinFleet(location.fleetId, (result) => {
      if (!result?.ok) setSendError(result?.error || "Unable to join fleet.");
    }); 
  };
  const publishLocation = (event) => {
    event.preventDefault();
    setSendError("");
    joinFleet(location.fleetId);
    sendLocation({
      fleetId: location.fleetId.trim(),
      vehicleId: location.vehicleId.trim(),
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      speed: Number(location.speed),
    }, (result) => {
      if (!result?.ok) setSendError(result?.error || "Location update failed.");
    });
  };
  const insideVehicles = vehicles.filter((vehicle) =>
  isVehicleInsideGeofence(
    vehicle.location.latitude,
    vehicle.location.longitude,
    geofence
  )
);

const outsideVehicles = vehicles.filter(
  (vehicle) =>
    !isVehicleInsideGeofence(
      vehicle.location.latitude,
      vehicle.location.longitude,
      geofence
    )
);
const filteredVehicles = vehicles.filter((vehicle) =>
  vehicle.vehicleId.toLowerCase().includes(search.toLowerCase())
);
const SPEED_LIMIT = 80;
  


  return(
  <div className="dashboard-container">
    <header className="dashboard-header glass"><div className="brand"><Activity className="brand-icon pulse" /><div><h1>FleetDash</h1><span className="badge-beta">{joinedFleet ? `Joined ${joinedFleet}` : "Live Location Streaming"}</span></div></div>
      <span className={`status-pill ${isConnected ? "online" : "offline"}`}>{isConnected ? <Wifi size={14} className="pulse" /> : <WifiOff size={14} />}{isConnected ? "Connected" : "Disconnected"}</span>
    </header>

    <main className="dashboard-content">
      <section className="status-grid">
        <div className="status-card glass"><div className="card-header"><Cpu className="card-icon" /><h3>Socket connection</h3></div><div className="card-body">
          <div className="stat-row"><span className="label">Status</span><b className={isConnected ? "text-success" : "text-danger"}>{isConnected ? "ACTIVE" : "INACTIVE"}</b></div>
          <div className="stat-row"><span className="label">Socket ID</span><span className="font-mono text-small">{socket.id || "Not connected"}</span></div>
          <div className="stat-row"><span className="label">Transport</span><span className="font-mono">{transport}</span></div>
          {reconnectAttempts > 0 && <div className="stat-row reconnecting"><span>Reconnecting</span><span className="text-warning"><RefreshCw size={12} className="spin-icon" /> #{reconnectAttempts}</span></div>}
        </div></div>
        <div className="status-card glass"><div className="card-header"><Info className="card-icon" /><h3>Live fleet feed</h3></div><div className="card-body">
          <div className="stat-row"><span className="label">Tracked vehicles</span><b>{vehicles.length}</b></div>
          <div className="stat-row"><span className="label">Joined fleet</span><span className="font-mono text-small">{joinedFleet || "None"}</span></div>
          <div className="stat-row"><span className="label">Latest event</span><span className="text-small">{events[0] ? new Date(events[0].updatedAt).toLocaleTimeString() : "Waiting"}</span></div>
        </div></div>
      </section>
      );
      <div
  style={{
    background: "#007bff",
    color: "white",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  }}
><br />
  <strong>Total Vehicles:</strong> {vehicles.length}
</div>
<div
  style={{
    background: "#007bff",
    color: "white",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  }}
>
  <strong>Current Fleet:</strong> {joinedFleet || "Not Joined"}
  <br />
  <strong>Total Vehicles:</strong> {vehicles.length}
</div>
  
  <h3>Total Vehicles: {vehicles.length}</h3>

      <section className="location-grid">
        <form className="status-card glass location-form" onSubmit={publishLocation}><div className="card-header"><Send className="card-icon" /><h3>Send test location</h3></div>
          <label>Fleet ID<input value={location.fleetId} onChange={(e) => updateField("fleetId", e.target.value)} required /></label>
          <button type="button" className="join-button" onClick={handleJoinFleet} disabled={!isConnected}>Join fleet</button>
          <label>Vehicle ID<input value={location.vehicleId} onChange={(e) => updateField("vehicleId", e.target.value)} required /></label>
          <label>Latitude<input type="number" step="any" value={location.latitude} onChange={(e) => updateField("latitude", e.target.value)} required /></label>
          <label>Longitude<input type="number" step="any" value={location.longitude} onChange={(e) => updateField("longitude", e.target.value)} required /></label>
          <label>Speed (km/h)<input type="number" min="0" value={location.speed} onChange={(e) => updateField("speed", e.target.value)} required /></label>
          {sendError && <p className="form-error">{sendError}</p>}<button disabled={!isConnected} type="submit">Broadcast location</button>
        </form>
        <section className="status-card glass live-locations">
          <div className="card-header"><MapPin className="card-icon" />
          <div style={{ marginBottom: "15px" }}>
  <input
    type="text"
    placeholder="Search Vehicle ID..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />
</div>
          <h3>Latest vehicle locations</h3></div>
          {!vehicles.length && <p className="empty-state">No location updates received yet.</p>}
          {filteredVehicles.map((vehicle) => <article className="location-row" key={`${vehicle.fleetId}-${vehicle.vehicleId}`}><MapPin size={17} /><div><b>{vehicle.vehicleId} <small> -  {vehicle.fleetId}</small></b><small>{vehicle.location.latitude.toFixed(5)}, {vehicle.location.longitude.toFixed(5)}
            </small></div>
            <div>
  <span>
    <Gauge size={15} /> {vehicle.location.speed ?? 0} km/h
  </span>

  {vehicle.location.speed > SPEED_LIMIT && (
    <div
      style={{
        color: "red",
        fontWeight: "bold",
        marginTop: "5px",
      }}
    >
      ⚠ Overspeed Alert
    </div>
  )}
</div><time>{new Date(vehicle.updatedAt).toLocaleTimeString()}</time></article>)}
        </section>
      </section>
      <section className="status-card glass">
  <div className="card-header">
    <MapPin className="card-icon" />
    <section
  style={{
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  }}
>
  <div
    style={{
      flex: 1,
      padding: "15px",
      background: "#0d6efd",
      color: "white",
      borderRadius: "10px",
    }}
  >
    <h3>Total Vehicles</h3>
    <h2>{vehicles.length}</h2>
  </div>

  <div
    style={{
      flex: 1,
      padding: "15px",
      background: "#198754",
      color: "white",
      borderRadius: "10px",
    }}
  >
    <h3>Inside Geofence</h3>
    <h2>{insideVehicles.length}</h2>
  </div>

  <div
    style={{
      flex: 1,
      padding: "15px",
      background: "#dc3545",
      color: "white",
      borderRadius: "10px",
    }}
  >
    <h3>Outside Geofence</h3>
    <h2>{outsideVehicles.length}</h2>
  </div>
</section>
    <h3>Fleet Live Map</h3>
  </div>
  <section className="status-card glass">
  <div className="card-header">
    <MapPin className="card-icon" />
    <h3>Fleet Live Map</h3>
  </div>

  {/* Overspeed Summary */}
  <div
    style={{
      background: "#fff3cd",
      border: "1px solid #ffeeba",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "20px",
    }}
  >
    <h3>Overspeed Vehicles</h3>

    <h2>
      {
        vehicles.filter(
          (vehicle) => vehicle.location.speed > SPEED_LIMIT
        ).length
      }
    </h2>
  </div>
  <div
  style={{
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#f8f9fa",
  }}
>
  <h3>Vehicle Information</h3>

  {vehicles.length === 0 ? (
    <p>No vehicle data available.</p>
  ) : (
    vehicles.map((vehicle) => {
      const inside = isVehicleInsideGeofence(
        vehicle.location.latitude,
        vehicle.location.longitude,
        geofence
      );

      return (
        <div
          key={vehicle.vehicleId}
          style={{
            marginBottom: "15px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <p><strong>Vehicle ID:</strong> {vehicle.vehicleId}</p>

          <p><strong>Fleet ID:</strong> {vehicle.fleetId}</p>

          <p><strong>Speed:</strong> {vehicle.location.speed} km/h</p>

          <p>
            <strong>Status:</strong>{" "}
            {inside ? "🟢 Inside Geofence" : "🔴 Outside Geofence"}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {vehicle.location.latitude},
            {vehicle.location.longitude}
          </p>

          <p>
            <strong>Updated:</strong>{" "}
            {new Date(vehicle.updatedAt).toLocaleString()}
          </p>
        </div>
      );
    })
  )}
</div>
  
  {breachMessage && (
  <div
    style={{
      backgroundColor: "#fff3cd",
      color: "#856404",
      padding: "10px",
      marginBottom: "10px",
      border: "1px solid #ffeeba",
      borderRadius: "8px",
      fontWeight: "bold",
    }}
  >
    {breachMessage}
  </div>
)}
<div
  style={{
    marginTop: "15px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#f8f9fa",
  }}
>
  <h3>Geofence Details</h3>

  <p>
    <strong>Name:</strong> Fleet Main Zone
  </p>

  <p>
    <strong>Radius:</strong> {geofence.radius} meters
  </p>

  <p>
    <strong>Center:</strong> {geofence.center[0]}, {geofence.center[1]}
  </p>
</div>
  <MapContainer
    center={[12.9716, 77.5946]}
    zoom={12}
    style={{ height: "400px", width: "100%", borderRadius: "10px" }}
  >
  
  <Circle
  center={geofence.center}
  radius={geofence.radius}
  pathOptions={{
    color: "blue",
    fillColor: "lightblue",
    fillOpacity: 0.3,
    weight: 3,
  }}
/>

  <thead>
    <tr>
      <th>Vehicle</th>
      <th>Fleet</th>
      <th>Speed</th>
      <th>Status</th>
    </tr>
  </thead>

  <tbody>
    <div
  style={{
    marginBottom: "15px",
    padding: "10px",
    background: "#0d6efd",
    color: "white",
    borderRadius: "8px",
  }}
>
  <h3>Total Vehicles : {vehicles.length}</h3>
</div>
    {vehicles.map((vehicle) => {

      const inside = isVehicleInsideGeofence(
        vehicle.location.latitude,
        vehicle.location.longitude,
        geofence
      );

      return (
        <tr key={vehicle.vehicleId}>

          <td>{vehicle.vehicleId}</td>

          <td>{vehicle.fleetId}</td>

          <td>{vehicle.location.speed} km/h</td>

          <td>
            {inside
              ? "🟢 Inside"
              : "🔴 Outside"}
          </td>

        </tr>
      );
    })}
  </tbody>

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

   {vehicles.map((vehicle) => {

  const inside = isVehicleInsideGeofence(
    vehicle.location.latitude,
    vehicle.location.longitude,
    geofence
  );

  return (
    <Marker
  key={vehicle.vehicleId}
  position={[
    vehicle.location.latitude,
    vehicle.location.longitude,
  ]}
>
      <Popup>
        <br />

{vehicle.location.speed > SPEED_LIMIT ? (
  <span style={{ color: "red", fontWeight: "bold" }}>
    ⚠ Overspeed
  </span>
) : (
  <span style={{ color: "green", fontWeight: "bold" }}>
    ✔ Normal Speed
  </span>
)}
        <br />

Latitude :
{vehicle.location.latitude}

<br />

Longitude :
{vehicle.location.longitude}
<br />

Last Updated :

{new Date(vehicle.updatedAt).toLocaleString()}

  <div>

    <strong>{vehicle.vehicleId}</strong>

    <br />

    Fleet : {vehicle.fleetId}

    <br />

    Speed : {vehicle.location.speed} km/h


    <br />

    Latitude : {vehicle.location.latitude}

    <br />

    Longitude : {vehicle.location.longitude}

    <br />

    <strong>
      {inside
        ? "🟢 Inside Geofence"
        : "🔴 Outside Geofence"}
    </strong>

  </div>
</Popup>
    </Marker>
  );

})}

  </MapContainer>
  <div style={{ marginTop: "15px" }}>
  {vehicles.map((vehicle) => {
    const inside = isVehicleInsideGeofence(
      vehicle.location.latitude,
      vehicle.location.longitude,
      geofence
    );

    return (
      <div
        key={vehicle.vehicleId}
        style={{
          padding: "10px",
          marginBottom: "8px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <strong>{vehicle.vehicleId}</strong>

        <br />

        {inside ? (
          <span style={{ color: "green" }}>
            🟢 Vehicle Inside Geofence
          </span>
        ) : (
          <span style={{ color: "red" }}>
            🔴 Vehicle Outside Geofence
          </span>
        )}
      </div>
    );
  })}
</div>
</section>

      <section className="terminal-panel glass"><div className="terminal-header"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /><span className="terminal-title">Geofence Alerts</span></div>
        <div className="terminal-body font-mono">{!alerts.length ? <div className="terminal-line timestamp">No geofence alerts received.</div> : alerts.map((alert) => <div className={alert.event === "entered" ? "terminal-line success" : "terminal-line danger"} key={`${alert.fleetId}-${alert.vehicleId}-${alert.geofenceId}-${alert.occurredAt}`}>[{new Date(alert.occurredAt).toISOString()}] {alert.event === "entered" ? "[ENTERED]" : "[EXITED]"} {alert.vehicleId} {alert.event} {alert.geofenceId.charAt(0).toUpperCase() + alert.geofenceId.slice(1)} ({alert.distance}m away)</div>)}</div>
      </section>
      <section className="terminal-panel glass"><div className="terminal-header"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /><span className="terminal-title">Vehicle Location Event Stream</span></div>
        <div className="terminal-body font-mono">{!events.length ? <div className="terminal-line timestamp">Waiting for fleet-scoped vehicle:location events�</div> : events.map((event) => <div className="terminal-line success" key={`${event.fleetId}-${event.vehicleId}-${event.updatedAt}`}>[{new Date(event.updatedAt).toISOString()}] {event.fleetId}/{event.vehicleId}: {event.location.latitude}, {event.location.longitude} � {event.location.speed ?? 0} km/h</div>)}</div>
      </section>
    </main>
  </div>;
}


export default Dashboard;