import { Router } from "express";
import { userRoutes } from "../routes/createUser.route.js";
import { transactionRoutes } from "../routes/transaction.route.js";

export const allRoutes = Router();

allRoutes.use("/users", userRoutes);
allRoutes.use("/transactions", transactionRoutes);
