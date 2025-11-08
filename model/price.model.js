import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});
export const Price = mongoose.model("Price", priceSchema);
