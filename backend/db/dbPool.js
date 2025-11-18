// DEPENDENCIAS
import mysql from "mysql2/promise";
import "dotenv/config";

// --- DB Pool ---
// Creamos y exportamos el pool para que esté disponible en otros archivos
export const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
