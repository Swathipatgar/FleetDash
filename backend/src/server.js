require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");

const vehicleRoutes = require("./routes/vehicleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");
const authRoutes = require("./routes/authRoutes");

const initializeSocket = require("./realtime/socket/socketServer");

const app = express();
const server = http.createServer(app);

const io = initializeSocket(server);
app.set("io", io);

// Database Connection
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/auth", authRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("FleetDash Backend Running Successfully");
});

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on Port ${PORT}`);
});