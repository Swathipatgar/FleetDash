const getVehicles = (req, res) => {

    const vehicles = [
        {
            id: 1,
            vehicleNumber: "KA01AB1234",
            driver: "Ramesh",
            status: "Active"
        },
        {
            id: 2,
            vehicleNumber: "KA19XY5678",
            driver: "Suresh",
            status: "Inactive"
        }
    ];

    res.status(200).json({
        success: true,
        totalVehicles: vehicles.length,
        data: vehicles
    });

};

module.exports = {
    getVehicles
};