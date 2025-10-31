<<<<<<< HEAD
<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
const http = require("http");
=======
import cors from "cors";
import { Server } from "socket.io";
import express from "express";
import http from "http";
import { registerGameEvents } from "./socket/gameManager.js";
import wordsRouter from "./routes/wordRoutes.js";
import { initializeSocketIO } from "./socket/gameLogin.js";

>>>>>>> origin/f18.-Back-de-pantalla-de-joc
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
registerGameEvents(io);
initializeSocketIO(io);

// --- Puerto de escucha ---
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[IO] http://localhost:${port}`));
<<<<<<< HEAD
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
=======
>>>>>>> origin/f18.-Back-de-pantalla-de-joc
