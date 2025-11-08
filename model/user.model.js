import { timeStamp } from "console";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
userSchema.index({ name: 1, email: 1 }, { unique: true });
export const WealthNestUser = mongoose.model("WealthNestUser", userSchema);
