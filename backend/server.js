import cors from "cors";
import { Server } from "socket.io";
import express from "express";
import http from "http";
// import { registerGameEvents } from "./socket/gameManager.js";
import wordsRouter from "./routes/wordRoutes.js";
import { initializeSocketIO } from "./socket/socketInit.js";

const app = express();
const server = http.createServer(app);

// CORS
const corsOptions = { origin: "*", methods: ["GET","POST"] };
app.use(cors(corsOptions));
app.use(express.json());
app.use("/palabras", wordsRouter);

// --- Crear **una sola instancia** de Socket.IO ---
const io = new Server(server, { cors: corsOptions });

// Registrar eventos
// registerGameEvents(io);
initializeSocketIO(io);

// --- Puerto de escucha ---
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[IO] http://localhost:${port}`));
