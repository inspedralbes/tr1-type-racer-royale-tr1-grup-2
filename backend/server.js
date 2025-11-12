// DEPENDENCIAS
import cors from "cors";
import express from "express";
import http from "http";
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
import statsRouter from "./routes/statsRoutes.js";

// MODELOS
import Palabra from "./models/Word.js";

// EXPRESS Y SERVIDOR
const app = express();
const server = http.createServer(app);

// CORS
const corsOptions = { origin: "*", methods: ["GET", "POST"] };
app.use(cors(corsOptions));
app.use(express.json());

// RUTAS
app.use("/palabras", wordsRouter);
app.use("/user", registerRouter);
app.use("/stats", statsRouter);

// SOCKET.IO
const io = new Server(server, { cors: corsOptions });
initializeSocketIO(io);

// CONEXIÓN A MONGODB
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar MongoDB:", err));

// PUERTO DE ESCUCHA
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[IO] http://localhost:${port}`));
