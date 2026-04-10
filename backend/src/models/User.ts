import mongoose, { Document, Schema } from "mongoose";
import { createEmptyTalentProfile, ITalentProfile, talentProfileSchema } from "./talentProfile";
import { UserRole } from "../types/express";

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  profile?: ITalentProfile;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["recruiter", "applicant"], required: true },
    profile: { type: talentProfileSchema, default: () => createEmptyTalentProfile() }
  },
  { timestamps: true }
);
 

export const User = mongoose.model<IUser>("User", userSchema);
