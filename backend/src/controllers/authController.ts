import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../types/express";
import { normalizeTalentProfile } from "../utils/normalizeCandidateData";
import { AppError } from "../utils/errors";
import { signToken } from "../utils/jwt";
import * as emailService from "../services/emailService";


export const register = async (req: Request, res: Response) => {
  try {
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
    // let us send a welcome email to the user after registration
    try {
      await emailService.sendRegistrationEmail(email, profile?.name || "User");
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
    return res.status(201).json({
      token: signToken(user),
      user: await User.findById(user._id).select("-password")
    });
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to register user", 500);
  }

};

export const login = async (req: Request, res: Response) => {
  try {
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

  } catch (err) {
    console.error(err);
    throw new AppError("Failed to login", 500);
  }

};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    return res.json(user);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to update profile", 500);
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.user?.id);
    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to delete account", 500);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return res.json(user);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to fetch profile", 500);
  }
};
