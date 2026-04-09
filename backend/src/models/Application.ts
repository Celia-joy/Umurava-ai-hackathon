import mongoose, { Document, Schema } from "mongoose";
import { createEmptyTalentProfile, ITalentProfile, talentProfileSchema } from "./talentProfile";

export interface IAiBreakdown {
  weightedScore: number;
  skillsMatch: number;
  experience: number;
  projects: number;
  education: number;
  certifications: number;
  availability: number;
}

export interface IExtractedCandidateData {
  rawText: string;
  parseConfidence: number;
  parserVersion: string;
}

export interface IApplication extends Document {
  applicant: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  cvFileName: string;
  cvFileUrl: string;
  cvFileType: "pdf" | "csv";
  cvText: string;
  talentProfile: ITalentProfile;
  normalizedProfile: ITalentProfile;
  extractedData: IExtractedCandidateData;
  status: "submitted" | "screened" | "shortlisted" | "rejected";
  aiBreakdown?: IAiBreakdown;
}

const aiBreakdownSchema = new Schema<IAiBreakdown>(
  {
    weightedScore: { type: Number, default: 0 },
    skillsMatch: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    certifications: { type: Number, default: 0 },
    availability: { type: Number, default: 0 }
  },
  { _id: false }
);

const extractedCandidateDataSchema = new Schema<IExtractedCandidateData>(
  {
    rawText: { type: String, default: "" },
    parseConfidence: { type: Number, default: 0 },
    parserVersion: { type: String, default: "talent-profile-v2" }
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    cvFileName: { type: String, required: true, default: "" },
    cvFileUrl: { type: String, required: true, default: "" },
    cvFileType: { type: String, enum: ["pdf", "csv"], default: "pdf" },
    cvText: { type: String, default: "" },
    talentProfile: { type: talentProfileSchema, default: () => createEmptyTalentProfile() },
    normalizedProfile: { type: talentProfileSchema, default: () => createEmptyTalentProfile() },
    extractedData: { type: extractedCandidateDataSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["submitted", "screened", "shortlisted", "rejected"],
      default: "submitted"
    },
    aiBreakdown: { type: aiBreakdownSchema }
  },
  { timestamps: true }
);

applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>("Application", applicationSchema);
