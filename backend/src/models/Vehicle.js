const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({

    vehicleNumber: {
        type: String,
        required: true
    },

    driver: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Vehicle", vehicleSchema);