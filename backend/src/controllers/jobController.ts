import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { Job } from "../models/Job";
import { AppError } from "../utils/errors";

export const createJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const recruiterId = req.user?.id;
    const job = await Job.create({
      ...req.body,
      recruiter: recruiterId
    });

    return res.status(201).json(job);

  } catch (err) {
    console.error(err);
    throw new AppError("Failed to create job", 500);
  }

};

export const getJobs = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to fetch jobs", 500);
  }
};

export const getRecruiterJobs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobs = await Job.find({ recruiter: req.user?.id }).sort({ createdAt: -1 });
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to fetch recruiter jobs", 500);
  }
};

export const getJobById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }
    return res.json(job);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to fetch job", 500);
  }
};

export const updateJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }
    if (job.recruiter.toString() !== req.user?.id) {
      throw new AppError("Unauthorized", 403);
    }

    Object.assign(job, req.body);
    await job.save();

    return res.json(job);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to update job", 500);
  }
};

export const deleteJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }
    if (job.recruiter.toString() !== req.user?.id) {
      throw new AppError("Unauthorized",  403);
    }

    await job.deleteOne();
    return res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to delete job", 500);
  }
};