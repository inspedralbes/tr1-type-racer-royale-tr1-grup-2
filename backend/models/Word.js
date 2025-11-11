import mongoose from "mongoose";

const palabraSchema = new mongoose.Schema({
  word: String,
  roomId: String,
  playerId: String,
});

export default mongoose.model("Palabra", palabraSchema);
