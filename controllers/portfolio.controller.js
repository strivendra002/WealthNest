import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Transaction } from "../model/transaction.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadMockPrices() {
  const file = path.join(__dirname, "..", "data", "mockPrice.json");
  const json = fs.readFileSync(file, "utf8");
  return JSON.parse(json);
}

export const getPortfolio = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const txs = await Transaction.find({ userId }).sort({
      date: 1,
      createdAt: 1,
    });

    const positions = {}; 

    for (const tx of txs) {
      const symbol = tx.symbol;
      if (!positions[symbol]) positions[symbol] = { units: 0, avgCost: 0 };
      const pos = positions[symbol];

   
      const unitsNum = Number(tx.units ?? 0);
      const priceNum = Number(tx.price ?? 0);

      if (tx.type === "BUY") {
        const totalCostBefore = pos.avgCost * pos.units;
        const totalNewCost = totalCostBefore + priceNum * unitsNum;
        pos.units = +(pos.units + unitsNum);
        pos.avgCost = pos.units > 0 ? +(totalNewCost / pos.units) : 0;
      } else {
        pos.units = +(pos.units - unitsNum);
        if (pos.units < 0) pos.units = 0;
        if (pos.units === 0) pos.avgCost = 0;
      }
    }

    const prices = loadMockPrices();
    const holdings = [];
    let totalValue = 0;
    let totalGain = 0;

    for (const [symbol, p] of Object.entries(positions)) {
      if (!p || p.units <= 0) continue; 

      const current_price = prices[symbol] ?? null;
      const unrealized_pl =
        current_price != null ? +((current_price - p.avgCost) * p.units) : null;
      const value = current_price != null ? +(current_price * p.units) : null;

      if (value != null) totalValue += value;
      if (unrealized_pl != null) totalGain += unrealized_pl;

      holdings.push({
        symbol,
        units: p.units,
        avg_cost: +p.avgCost,
        current_price: current_price,
        unrealized_pl: unrealized_pl,
      });
    }

    res.json({
      user_id: userId,
      holdings,
      total_value: +totalValue,
      total_gain: +totalGain,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
};
