// DEPENDENCIAS
import cors from "cors";
import express from "express";
import http from "http";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

// 👉 Importamos la función de conexión a MongoDB desde el archivo dbmongo.js
import connectMongoStatsDB from "./dbmongo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.resolve(__dirname, "../.env") });

// SOCKET.IO
import { Server } from "socket.io";
import { initializeSocketIO } from "./socket/socketInit.js";

// RUTAS DE LA API
import wordsRouter from "./routes/wordRoutes.js";
import registerRouter from "./routes/registerRoutes.js"; // 👈 1. DESCOMENTAR/IMPORTAR
import statsRouter from "./routes/statsRoutes.js";

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

// --- Conexión a MongoDB (Estadísticas) ---
connectMongoStatsDB();

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

// PUERTO DE ESCUCHA
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[IO] http://localhost:${port}`));
