import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { IUser } from "../models/User";

export const signToken = (user: IUser) =>
  jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
