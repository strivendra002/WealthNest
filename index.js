import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connection } from "./config/db.connection.js";
import { allRoutes } from "./global/allroutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  return res.status(200).json({ message: "Hello Trivendra!" });
});
app.use("/api",allRoutes);
const port = process.env.PORT || 4001;



app.listen(port, async () => {
  console.log(`server is running on port ${port}`);
  await connection;
  console.log("db connected");
});
