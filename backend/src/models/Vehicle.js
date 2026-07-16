const Vehicle = require("../models/Vehicle");

// GET All Vehicles
const getVehicles = async (req, res) => {

    try {

        const vehicles = await Vehicle.find();

        res.status(200).json({
            success: true,
            totalVehicles: vehicles.length,
            data: vehicles
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// CREATE Vehicle
const createVehicle = async (req, res) => {

    try {

        const vehicle = await Vehicle.create(req.body);

        res.status(201).json({
            success: true,
            message: "Vehicle Added Successfully",
            data: vehicle
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
{
    vehicleNumber: {
        type: String,
        required: [true, "Vehicle number is required"],
        unique: true,
        trim: true
    },

    driver: {
        type: String,
        required: [true, "Driver name is required"],
        trim: true
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Vehicle", vehicleSchema);