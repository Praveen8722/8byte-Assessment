import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import portfolioRoutes from "./routes/portfolio.js";
import { computeValuations, tickMarket } from "./utils/helpers.js";
import sectors from "./data/sectors.js";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

// Pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/api/portfolio", portfolioRoutes);

// --- Socket.IO ---
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.emit("valuations", computeValuations(sectors));
});

// Broadcast live updates every 15s
const PRICE_UPDATE_INTERVAL_MS = 15 * 1000;
setInterval(() => {
  tickMarket(sectors);
  io.emit("valuations", computeValuations(sectors));
}, PRICE_UPDATE_INTERVAL_MS);

const PORT = 4000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
