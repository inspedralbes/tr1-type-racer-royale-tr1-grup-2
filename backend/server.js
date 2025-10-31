const cors = require("cors");
import { Server } from "socket.io";
import { registerGameEvents } from "./socket/gameManager.js";
import wordsRouter from "./routes/wordRoutes.js"; // tu router de palabras
import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app); // <-- Creamos el servidor HTTP

// 1. Importamos NUESTRAS funciónes
const { initializeSocketIO } = require("./socket/gameLogin.js");

const io = new Server(httpServer, {
  cors: { origin: "*" },
});
// --- Configuración de CORS para Express (rutas API) y Socket.IO ---
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/palabras", wordsRouter);

//  Inicializa Socket.IO con el servidor HTTP y las opciones de CORS
initializeSocketIO(server, corsOptions);


registerGameEvents(io);
// --- Puerto de escucha ---
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[IO] http://localhost:${port}`));
