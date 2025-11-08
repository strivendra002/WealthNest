import { Transaction } from "../model/transaction.model.js";

export const getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User is required" });
    }
    const txs = await Transaction.find({ userId })
      .sort({
        date: 1,
        createdAt: 1,
      })
      .select("-userId");
    res.status(200).json({
      message: "Transactions found successfully",
      data: txs,
    });
  } catch (error) {
    console.log("Transactions not found", error);
    res.json({
      message: "Internal server error",
      status: 501,
    });
  }
};
