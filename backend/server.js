<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app); // <-- Creamos el servidor HTTP

// 1. Importamos NUESTRAS funciónes
const { initializeSocketIO } = require("./socket/gameLogin.js");

// --- Configuración de CORS para Express (rutas API) y Socket.IO ---
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

//  Inicializa Socket.IO con el servidor HTTP y las opciones de CORS
initializeSocketIO(server, corsOptions);

// --- Puerto de escucha ---
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[IO] http://localhost:${port}`));
=======
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
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.IO escuchando en http://localhost:${PORT}`);
});
>>>>>>> origin/F18.ConexiónServer
