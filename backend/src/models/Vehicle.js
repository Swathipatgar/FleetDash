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

module.exports = {
    getVehicles,
    createVehicle
};