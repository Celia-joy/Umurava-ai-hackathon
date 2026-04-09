import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../types/express";
import { normalizeTalentProfile } from "../utils/normalizeCandidateData";
import { AppError } from "../utils/errors";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { email, password, role, profile } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
    role,
    profile: profile ? normalizeTalentProfile(profile) : undefined
  });

  return res.status(201).json({
    token: signToken(user),
    user: await User.findById(user._id).select("-password")
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  return res.json({
    token: signToken(user),
    user: await User.findById(user._id).select("-password")
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { profile } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { $set: { profile: normalizeTalentProfile(profile) } },
    { new: true }
  ).select("-password");

  return res.json(user);
};
