// index.js
import { Server } from "socket.io";
import { registerGameEvents } from "./socket/gameManager.js";
import wordsRouter from "./routes/wordRoutes.js"; // tu router de palabras
import express from "express";
import http from "http";

const app = express();
const httpServer = http.createServer(app);
const PORT = 3000;

// Crear servidor HTTP y Socket.IO
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(express.json());
app.use("/palabras", wordsRouter);

// Registrar la lógica del juego (se hace en otro archivo)
registerGameEvents(io);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.IO escuchando en http://localhost:${PORT}`);
});
