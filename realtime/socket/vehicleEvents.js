import { getIO } from "./socketServer.js";

export const broadcastVehicleUpdate = (vehicle) => {

    const io = getIO();

    io.emit("vehicle:update", vehicle);

};
