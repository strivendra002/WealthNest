import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: { type: String, required: true },
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    units: { type: Number, required: true },
    price: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);
export const Transaction = mongoose.model("Transaction", transactionSchema);
