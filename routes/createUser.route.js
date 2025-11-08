import { Router } from "express";
import { createUser } from "../controllers/createUser.controller.js";

export const userRoutes = Router()

userRoutes.post("/create-user",createUser)