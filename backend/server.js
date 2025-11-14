// server.js
import cors from "cors";
import express from "express";
import http from "http";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });


import { Server } from "socket.io";
import { initializeSocketIO } from "./socket/socketInit.js";
import mongoose from "mongoose";


import wordsRouter from "./routes/wordRoutes.js";
import registerRouter from "./routes/registerRoutes.js";
import profileRouter from "./routes/profileRoutes.js";


import connectMongoStatsDB from "./dbmongo.js";


const app = express();
const server = http.createServer(app);


let corsOptions;
if (process.env.NODE_ENV === "development") {
 corsOptions = { origin: "*", methods: ["GET", "POST"] };
 console.log("[CORS] Desarrollo: todos los orígenes permitidos");
} else {
 const allowedOrigin =
   process.env.FRONT_URL || "http://typebet.daw.inspedralbes.cat";
 corsOptions = { origin: allowedOrigin, methods: ["GET", "POST", "PUT"] };
 console.log(`[CORS] Producción: solo permitiendo ${allowedOrigin}`);
}


app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));


// --- Conexión a MongoDB (Estadísticas) ---
connectMongoStatsDB();


app.use("/api/palabras", wordsRouter);


// MODIFICACIÓN CLAVE: Cambiamos el prefijo de /api a /api/user para
// que las rutas como /login o /profile se resuelvan como /api/user/login y /api/user/profile.
app.use("/api/user", registerRouter);
app.use("/api/user", profileRouter);




const io = new Server(server, { cors: corsOptions });
initializeSocketIO(io);


// CONEXIÓN A MONGODB
// Las líneas de conexión a Mongoose están correctamente comentadas para evitar
// la doble conexión que causaba el error anterior.


const port = process.env.APP_HOST_PORT || 3000;
const host = process.env.APP_HOST_IP || "0.0.0.0";


server.listen(port, host, () => {
 console.log(
   `[IO] Servidor corriendo en http://${host}:${port} - NODE_ENV=${process.env.NODE_ENV}`
 );
});




