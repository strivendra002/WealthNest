import { Router } from "express";
import { addTransactions } from "../controllers/transactions.controlller.js";
import { getTransactions } from "../controllers/getTransaction.controller.js";
import { getPortfolio } from "../controllers/portfolio.controller.js";

export const transactionRoutes = Router();

transactionRoutes.post("/add-transaction", addTransactions);
transactionRoutes.get("/get-transacton",getTransactions);
transactionRoutes.get("/get-portfolio",getPortfolio)
