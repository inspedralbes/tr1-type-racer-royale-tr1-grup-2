import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: String,
  totalIntentos: { type: Number, default: 0 },
  aciertos: { type: Number, default: 0 },
  errores: { type: Number, default: 0 },
  palabrasFrecuentes: [String],
  palabrasFalladas: [String],
});

export default mongoose.model("Usuario", usuarioSchema);
