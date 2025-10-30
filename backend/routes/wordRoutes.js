// routes/wordsRoutes.js
import express from "express";
import { generarPalabras, seleccionarRandom } from "../logic/wordLogic.js";

const router = express.Router();

router.get("/words", (req, res) => {
  try {
    const count = parseInt(req.query.count) || 50;
    const total = 600;

    const allWords = generarPalabras(total);
    const selected = seleccionarRandom(allWords, count);

    res.json({
        data: {
            playerID: 1,
            initialWords: selected,
            wordLimit: 60,
            roomId: "room_1"
        }
    });
  } catch (error) {
    console.error("❌ Error generando palabras:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

export default router;
