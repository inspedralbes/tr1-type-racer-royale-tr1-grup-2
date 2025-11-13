// DEPENDENCIAS
import express from "express";
import jwt from "jsonwebtoken";
import { dbPool } from "../db/dbPool.js";

// --- Router ---
const router = express.Router();

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.JWT_SECRET || "default_secret", (err, authData) => {
      if (err) {
        return res.status(403).json({ message: "Token inválido." });
      }
      req.authData = authData;
      next();
    });
  } else {
    res.status(401).json({ message: "Acceso no autorizado." });
  }
};

// --- Actualizar Perfil ---
router.put("/profile", verifyToken, async (req, res) => {
  console.log("Request body en /api/profile:", req.body); // Log para ver qué llega
  const { newName, newAvatar } = req.body;
  const userId = req.authData.id;

  if (!newName) {
    return res.status(400).json({ message: "El nombre es requerido." });
  }

  try {
    const sql = "UPDATE users SET username = ?, imagen = ? WHERE id = ?";
    await dbPool.query(sql, [newName, newAvatar, userId]);
    res.status(200).json({ message: "Perfil actualizado con éxito." });
  } catch (error) {
    console.error("Error en /api/profile:", error); // Log del error específico
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

export default router;
