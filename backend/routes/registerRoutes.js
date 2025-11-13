// DEPENDENCIAS
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbPool } from "../db/dbPool.js"; // Importamos el pool de conexión

// --- Router ---
const router = express.Router();

// --- Registro ---
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuario y contraseña son requeridos." });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    await dbPool.query(sql, [username, hashedPassword]);
    res.status(201).json({ message: "¡Usuario registrado con éxito!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Error: El nombre de usuario ya existe." });
    }
    console.error("Error en /api/register:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// --- Login ---
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuario y contraseña son requeridos." });
  }
  try {
    const sql = "SELECT * FROM users WHERE username = ?";
    const [rows] = await dbPool.query(sql, [username]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Generar token JWT
    const payload = {
      id: user.id,
      username: user.username,
      avatar: user.avatar_url,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login exitoso",
      token,
      id: user.id,
      username: user.username,
      avatar: user.avatar_url,
    });
  } catch (error) {
    console.error("Error en /api/login:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// --- Get User Data from Token ---
router.post("/user", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    
    // Opcional: Verificar si el usuario todavía existe en la BD
    const sql = "SELECT id, username, avatar_url FROM users WHERE id = ?";
    const [rows] = await dbPool.query(sql, [decoded.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario del token no encontrado." });
    }
    const user = rows[0];

    res.status(200).json({
      id: user.id,
      username: user.username,
      avatar: user.avatar_url,
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token inválido." });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expirado." });
    }
    console.error("Error en /api/user:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

export default router;
