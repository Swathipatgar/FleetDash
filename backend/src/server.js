require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import Database Connection
const connectDB = require("./config/database");

// Import Routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Initialize Express App
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
//app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("FleetDash Backend Running Successfully");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on Port ${PORT}`);
});