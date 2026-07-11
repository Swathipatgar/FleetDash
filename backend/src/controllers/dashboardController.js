const getDashboardStats = (req, res) => {
    res.status(200).json({
        totalVehicles: 250,
        activeVehicles: 230,
        inactiveVehicles: 20,
        totalDrivers: 180,
        todayTrips: 95
    });
};

module.exports = { getDashboardStats };