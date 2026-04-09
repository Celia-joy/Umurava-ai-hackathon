import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { Job } from "../models/Job";
import { AppError } from "../utils/errors";

export const createJob = async (req: AuthenticatedRequest, res: Response) => {
  const recruiterId = req.user?.id;
  const job = await Job.create({
    ...req.body,
    recruiter: recruiterId
  });

  return res.status(201).json(job);
};

export const getJobs = async (_req: AuthenticatedRequest, res: Response) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  return res.json(jobs);
};

export const getRecruiterJobs = async (req: AuthenticatedRequest, res: Response) => {
  const jobs = await Job.find({ recruiter: req.user?.id }).sort({ createdAt: -1 });
  return res.json(jobs);
};

export const getJobById = async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return res.json(job);
};
