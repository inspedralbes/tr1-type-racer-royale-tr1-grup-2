// server.js
import cors from "cors";
import { Server } from "socket.io";
import express from "express";
import http from "http";
import "dotenv/config";

import wordsRouter from "./routes/wordRoutes.js";
import registerRouter from "./routes/registerRoutes.js";
import { initializeSocketIO } from "./socket/socketInit.js";

const app = express();
const server = http.createServer(app);

let corsOptions;
if (process.env.NODE_ENV === "development") {
  corsOptions = { origin: "*", methods: ["GET", "POST"] };
  console.log("[CORS] Desarrollo: todos los orígenes permitidos");
} else {
  const allowedOrigin =
    process.env.FRONT_URL || "http://typebet.daw.inspedralbes.cat";
  corsOptions = { origin: allowedOrigin, methods: ["GET", "POST"] };
  console.log(`[CORS] Producción: solo permitiendo ${allowedOrigin}`);
}

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/palabras", wordsRouter);
app.use("/api/user", registerRouter);

const io = new Server(server, { cors: corsOptions });
initializeSocketIO(io);

const port = process.env.APP_HOST_PORT || 3000;
const host = process.env.APP_HOST_IP || "0.0.0.0";

server.listen(port, host, () => {
  console.log(
    `[IO] Servidor corriendo en http://${host}:${port} - NODE_ENV=${process.env.NODE_ENV}`
  );
});
