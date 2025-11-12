// DEPENDENCIAS
import cors from "cors";
import express from "express";
import http from "http";
import "dotenv/config";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// SOCKET.IO
import { Server } from "socket.io";
import { initializeSocketIO } from "./socket/socketInit.js";

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
app.use("/palabras", wordsRouter);
app.use("/api", registerRouter);
app.use("/user", registerRouter);
app.use("/stats", statsRouter);

// --- Socket.IO ---
const io = new Server(server, { cors: corsOptions });
initializeSocketIO(io);
// CONEXIÓN A MONGODB
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar MongoDB:", err));

io.on("connection", (socket) => {
  socket.on("ping_test", (data) => {
    console.log("📥 Ping recibido:", data);
    socket.emit("pong_test", { ok: true });
  });
});

// PUERTO DE ESCUCHA
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[IO] http://localhost:${port}`));
