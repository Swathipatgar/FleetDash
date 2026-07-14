import http from "http";
import dotenv from "dotenv";
import app from "./app.js";

import { initializeSocket } from "./realtime/socket/socketServer.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});