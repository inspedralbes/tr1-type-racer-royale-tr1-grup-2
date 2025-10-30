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
