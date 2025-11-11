import mongoose from "mongoose";

const intentoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  word: String,
  correct: Boolean,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Try", intentoSchema);
