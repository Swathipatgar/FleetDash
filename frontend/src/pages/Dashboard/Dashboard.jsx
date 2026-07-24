import React, { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useVehicleLocations } from "../../hooks/useVehicleLocations";
import { Wifi, WifiOff, RefreshCw, Cpu, Activity, Info, MapPin, Send, Gauge } from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

  useEffect(() => {
    if (isConnected) joinFleet("fleet-001");
  }, [isConnected, joinFleet]);

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

  return <div className="dashboard-container">
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
          <div className="stat-row"><span className="label">Latest event</span><span className="text-small">{events[0] ? new Date(events[0].updatedAt).toLocaleTimeString() : "Waiting�"}</span></div>
        </div></div>
      </section>

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
        <section className="status-card glass live-locations"><div className="card-header"><MapPin className="card-icon" /><h3>Latest vehicle locations</h3></div>
          {!vehicles.length && <p className="empty-state">No location updates received yet.</p>}
          {vehicles.map((vehicle) => <article className="location-row" key={`${vehicle.fleetId}-${vehicle.vehicleId}`}><MapPin size={17} /><div><b>{vehicle.vehicleId} <small>� {vehicle.fleetId}</small></b><small>{vehicle.location.latitude.toFixed(5)}, {vehicle.location.longitude.toFixed(5)}</small></div><span><Gauge size={15} /> {vehicle.location.speed ?? 0} km/h</span><time>{new Date(vehicle.updatedAt).toLocaleTimeString()}</time></article>)}
        </section>
      </section>
      <section className="status-card glass">
  <div className="card-header">
    <MapPin className="card-icon" />
    <h3>Fleet Live Map</h3>
  </div>

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