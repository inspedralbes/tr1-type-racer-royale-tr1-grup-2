// DEPENDENCIAS
import cors from "cors";
import { Server } from "socket.io";
import express from "express";
import http from "http";
import "dotenv/config";

// RUTAS DE LA API
import wordsRouter from "./routes/wordRoutes.js";
import registerRouter from "./routes/registerRoutes.js";
import { initializeSocketIO } from "./socket/socketInit.js";

// --- Express ---
const app = express();
const server = http.createServer(app);

// --- CORS ---
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Routers ---
app.use("/api/palabras", wordsRouter);
app.use("/api/user", registerRouter);

// --- Socket.IO ---
const io = new Server(server, { cors: corsOptions });
initializeSocketIO(io);
io.on("connection", (socket) => {
  socket.on("ping_test", (data) => {
    console.log("📥 Ping recibido:", data);
    socket.emit("pong_test", { ok: true });
  });
});

// --- Puerto de escucha ---
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[IO] http://localhost:${port}`));
