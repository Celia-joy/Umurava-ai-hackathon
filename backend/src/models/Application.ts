import mongoose, { Document, Schema } from "mongoose";

export interface IAiBreakdown {
  weightedScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  relevanceScore: number;
}

export interface IExtractedCandidateData {
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}

export interface IApplication extends Document {
  applicant: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  cvFileName: string;
  cvFileUrl: string;
  cvFileType: "pdf" | "csv";
  cvText: string;
  extractedData: IExtractedCandidateData;
  status: "submitted" | "screened" | "shortlisted" | "rejected";
  aiBreakdown?: IAiBreakdown;
}

const aiBreakdownSchema = new Schema<IAiBreakdown>(
  {
    weightedScore: { type: Number, default: 0 },
    skillScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    educationScore: { type: Number, default: 0 },
    relevanceScore: { type: Number, default: 0 }
  },
  { _id: false }
);

const extractedCandidateDataSchema = new Schema<IExtractedCandidateData>(
  {
    skills: { type: [String], default: [] },
    experience: { type: String, default: "" },
    education: { type: String, default: "" },
    summary: { type: String, default: "" }
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    cvFileName: { type: String, required: true },
    cvFileUrl: { type: String, required: true },
    cvFileType: { type: String, enum: ["pdf", "csv"], required: true },
    cvText: { type: String, default: "" },
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
