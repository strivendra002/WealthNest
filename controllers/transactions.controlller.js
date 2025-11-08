import mongoose from "mongoose";
import { Transaction } from "../model/transaction.model.js";

async function netUnitsFor(userId, symbol) {
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const res = await Transaction.aggregate([
    { $match: { userId: objectUserId, symbol: symbol } },
    {
      $group: {
        _id: null,
        bought: { $sum: { $cond: [{ $eq: ["$type", "BUY"] }, "$units", 0] } },
        sold: { $sum: { $cond: [{ $eq: ["$type", "SELL"] }, "$units", 0] } },
      },
    },
  ]);
  if (!res || res.length === 0) return 0;
  return (res[0].bought || 0) - (res[0].sold || 0);
}

export const addTransactions = async (req, res) => {
  try {
    const { userId, symbol, type, units, price, date } = req.body;

    if (userId == null || !symbol || !type || units == null || price == null || !date) {
      return res
        .status(400)
        .json({ error: "userId, symbol, type, units, price, date required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "invalid userId" });
    }

    const unitsNum = Number(units);
    const priceNum = Number(price);
    if (Number.isNaN(unitsNum) || unitsNum <= 0) {
      return res.status(400).json({ error: "units must be a positive number" });
    }
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: "price must be a positive number" });
    }

    if (!["BUY", "SELL"].includes(type))
      return res.status(400).json({ error: "type must be BUY or SELL" });

    if (type === "SELL") {
      const netUnits = await netUnitsFor(userId, symbol);
      if (unitsNum > netUnits) {
        return res.status(400).json({
          error: `cannot sell ${unitsNum} units — only ${netUnits} available`,
        });
      }
    }

    const tx = new Transaction({
      userId: new mongoose.Types.ObjectId(userId),
      symbol,
      type,
      units: unitsNum,
      price: priceNum,
      date: new Date(date),
    });
    await tx.save();
    res
      .status(201)
      .json({ message: "transaction added successfully", data: tx });
  } catch (error) {
    console.log("Error Adding Transaction", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
