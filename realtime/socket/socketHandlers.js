export const registerSocketHandlers = (socket) => {

    socket.on("vehicle:update", (data) => {
        console.log("Vehicle Update:", data);
    });

    socket.on("vehicle:online", (data) => {
        console.log("Vehicle Online:", data);
    });

    socket.on("vehicle:offline", (data) => {
        console.log("Vehicle Offline:", data);
    });

};
