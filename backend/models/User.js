import mongoose from "mongoose";

// Define el esquema para el usuario y sus estadísticas
const usuarioSchema = new mongoose.Schema({
  // Identificador único y obligatorio del jugador, usado por el frontend (ej. "u1", "u2")
  playerId: {
    type: String,
    required: true,
    unique: true,
  },

  // Contadores de estadísticas globales
  totalIntentos: {
    type: Number,
    default: 0,
  },
  aciertos: {
    type: Number,
    default: 0,
  },
  errores: {
    type: Number,
    default: 0,
  },

  // Arrays para guardar las palabras únicas acertadas y falladas
  // Se usa [String] para indicar un array de cadenas de texto
  palabrasFrecuentes: {
    type: [String],
    default: [],
  },
  palabrasFalladas: {
    type: [String],
    default: [],
  },
});

// Exporta el modelo, llamándolo "Usuario" en la base de datos
export default mongoose.model("Usuario", usuarioSchema);
