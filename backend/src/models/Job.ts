import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  recruiter: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  education: string;
  eligibility: string;
  jobType: string;
}

const jobSchema = new Schema<IJob>(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    experienceLevel: { type: String, required: true },
    education: { type: String, required: true },
    eligibility: { type: String, required: true },
    jobType: { type: String, required: true }
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>("Job", jobSchema);
