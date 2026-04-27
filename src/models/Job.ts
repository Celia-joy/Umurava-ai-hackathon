

import mongoose, { Schema, Document } from 'mongoose';
import { IJob } from '../types';

export interface IJobDocument extends Omit<IJob, '_id'>, Document {}

const JobSchema = new Schema<IJobDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], required: true },
    preferredSkills: { type: [String], default: [] },
    experienceYears: { type: Number, required: true, min: 0 },
    educationLevel: {
      type: String,
      enum: ['high_school', 'bachelor', 'master', 'phd', 'any'],
      default: 'any',
    },
    location: { type: String },
    remote: { type: Boolean, default: false },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },
  },
  { timestamps: true }
);

JobSchema.index({ status: 1, createdAt: -1 });

export const Job = mongoose.model<IJobDocument>('Job', JobSchema);