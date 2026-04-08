import mongoose, { Document, Schema } from "mongoose";
import { UserRole } from "../types/express";

export interface IUserProfile {
  name: string;
  skills: string[];
  experience: string;
  education: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  profile?: IUserProfile;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    name: { type: String, trim: true, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: String, default: "" },
    education: { type: String, default: "" }
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["recruiter", "applicant"], required: true },
    profile: { type: userProfileSchema }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
