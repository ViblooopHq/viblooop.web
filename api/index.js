import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { initSocket } from "./src/socket/notification.socket.js";
import { initChatSocket } from "./src/socket/chat.socket.js";
import logger from "./src/utils/logger.util.js";

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

initSocket(io);
initChatSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
