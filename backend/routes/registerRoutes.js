// DEPENDENCIAS
import express from "express";
// import bcrypt from "bcryptjs"; // 👈 COMENTADO: Ya no necesitamos bcrypt sin MySQL
// import { dbPool } from "../db/dbPool.js"; // 👈 COMENTADO: Ya no necesitamos el pool de MySQL
import Usuario from "../models/User.js";

// --- Router ---
const router = express.Router();

// --- Registro (SIMULADO) ---
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuario y contraseña son requeridos." });
  }

  try {
    // --- 1. Lógica de registro en MySQL (Si está descomentada) ---
    //        const salt = await bcrypt.genSalt(10);
    //    const hashedPassword = await bcrypt.hash(password, salt);
    //    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    //    const [result] = await dbPool.query(sql, [username, hashedPassword]);

    // 🚨 Obtener la ID generada por MySQL (la necesitas para Mongo)
    //    const newPlayerId = result.insertId;
    const simulatedPlayerId = `u_${Date.now()}`;

    // --- 2. Lógica de creación en MongoDB (¡NUEVO!) ---
    await Usuario.create({
      playerId: simulatedPlayerId, // Usar la ID de MySQL como playerId en Mongo
      username: username,
      aciertos: 0,
      errores: 0,
      palabrasFrecuentes: [],
      palabrasFalladas: [],
      totalIntentos: 0,
    });

    // --- 3. Respuesta al Frontend ---
    res.status(201).json({
      message: "¡Usuario registrado con éxito!",
      playerId: simulatedPlayerId,
      username: username,
    });
  } catch (error) {
    console.error("Error SIMULADO en /register:", error);
    res.status(500).json({ message: "Error interno del servidor (simulado)." });
  }
});

// --- Login (SIMULADO) ---
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuario y contraseña son requeridos." });
  }

  try {
    // COMENTADO: Toda la lógica de SELECT, bcrypt.compare, etc. se ha quitado.

    // Simulación: Comprobar credenciales estáticas para prueba
    if (username === "test" && password === "1234") {
      // Genera la misma ID estática para que la app funcione
      const simulatedPlayerId = "u_ESTATICO_TEST";

      // Responde como si el login hubiera sido exitoso
      return res.status(200).json({
        message: "Login SIMULADO exitoso",
        playerId: simulatedPlayerId,
        username: username,
      });
    } else {
      // Falla si no son las credenciales estáticas
      return res
        .status(401)
        .json({ message: "Credenciales de prueba SIMULADAS incorrectas." });
    }
  } catch (error) {
    console.error("Error SIMULADO en /login:", error);
    res.status(500).json({ message: "Error interno del servidor (simulado)." });
  }
});

export default router;
