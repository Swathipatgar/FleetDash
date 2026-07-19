require("dotenv").config();

const express = require("express");
const cors = require("cors");


// Import Database Connection
const connectDB = require("./config/database");

// Import Routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");

// Initialize Express App
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("FleetDash Backend Running Successfully");
});

// Start Server
const PORT = process.env.PORT || 5000;
const http = require('http');

const server = http.createServer(app);

// Initialize Socket.IO (dynamically import ESM module)
(async () => {
    try {
        const { initializeSocket } = await import('./realtime/socket/socketServer.js');
        const io = initializeSocket(server);
        // store io instance on the app so controllers can access it
        app.set('io', io);
        console.log('Socket.IO initialized');
    } catch (err) {
        console.error('Failed to initialize Socket.IO:', err);
    }
})();

server.listen(PORT, () => {
    console.log(`🚀 Server running on Port ${PORT}`);
});