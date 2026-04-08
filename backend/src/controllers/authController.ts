import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../types/express";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { email, password, role, profile } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
    role,
    profile
  });

  return res.status(201).json({
    token: signToken(user),
    user
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    token: signToken(user),
    user
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { profile } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { $set: { profile } },
    { new: true }
  ).select("-password");

  return res.json(user);
};
