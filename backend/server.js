import cors from "cors";
import { Server } from "socket.io";
import express from "express";
import http from "http";

// RUTAS DE LA API
import wordsRouter from "./routes/wordRoutes.js";
import registerRouter from "./routes/registerRoutes.js";

// SOCKET.IO
import { initializeSocketIO } from "./socket/socketInit.js";

const app = express();
const server = http.createServer(app);

// --- Configurar CORS solo para tu frontend ---
const corsOptions = {
  origin: "http://typebet.daw.inspedralbes.cat", // Solo permite este dominio
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Rutas de la API
app.use("/palabras", wordsRouter);
app.use("/user", registerRouter);

// --- Crear instancia de Socket.IO ---
const io = new Server(server, { cors: corsOptions });

// Registrar eventos
initializeSocketIO(io);

io.on("connection", (socket) => {
  socket.on("ping_test", (data) => {
    console.log("📥 Ping recibido:", data);
    socket.emit("pong_test", { ok: true });
  });
});

// --- Puerto de escucha ---
const port = process.env.PORT || 3000;
const host = "0.0.0.0"; // Escucha en todas las interfaces del contenedor
server.listen(port, host, () => {
  console.log(`[IO] Server listening on port ${port}`);
});
