// backend/db.js
import mysql from 'mysql2/promise';

// Creamos un "pool" de conexiones. Es más eficiente que crear una conexión por cada consulta.
const pool = mysql.createPool({
  host: process.env.DB_HOST,     // Esto será 'db' (del docker-compose)
  user: process.env.DB_USER,     // De tu .env
  password: process.env.DB_PASS, // De tu .env
  database: process.env.DB_NAME,   // De tu .env
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("[DB] Pool de conexiones MySQL creado.");

export default pool;