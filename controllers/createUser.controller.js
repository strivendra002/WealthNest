import { WealthNestUser } from "../model/user.model.js";

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "name and email required" });
    const user = new WealthNestUser({
      name,
      email,
    });
    await user.save();
    res.status(201).json({ message: "user created successfully", data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
