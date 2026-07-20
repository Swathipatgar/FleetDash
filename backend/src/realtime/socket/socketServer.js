const { Server } = require("socket.io");
const registerSocketHandlers = require("./socketHandlers");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => registerSocketHandlers(io, socket));
  return io;
}

module.exports = initializeSocket;