

import mongoose, { Schema, Document } from 'mongoose';
import { IApplicant } from '../types';

export interface IApplicantDocument extends Omit<IApplicant, '_id'>, Document {}

const WorkHistorySchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  description: { type: String },
}, { _id: false });

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  graduationYear: { type: Number, required: true },
}, { _id: false });

const ApplicantSchema = new Schema<IApplicantDocument>(
  {
    jobId: { type: String, required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String },
    location: { type: String },
    skills: { type: [String], required: true, default: [] },
    experienceYears: { type: Number, required: true, min: 0 },
    workHistory: { type: [WorkHistorySchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    certifications: { type: [String], default: [] },
    portfolioUrl: { type: String },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    summary: { type: String },
    source: {
      type: String,
      enum: ['umurava', 'csv', 'pdf', 'manual'],
      required: true,
    },
    rawFileRef: { type: String },
  },
  { timestamps: true }
);


ApplicantSchema.index({ email: 1, jobId: 1 }, { unique: true });

export const Applicant = mongoose.model<IApplicantDocument>('Applicant', ApplicantSchema);