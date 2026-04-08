import { Response } from "express";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { User } from "../models/User";
import { parsePdfCv } from "../services/cvService";
import { AuthenticatedRequest } from "../types/express";

export const applyToJob = async (req: AuthenticatedRequest, res: Response) => {
  const applicantId = req.user?.id;
  const file = req.file;
  const { jobId } = req.body;

  if (!file) {
    return res.status(400).json({ message: "CV PDF is required" });
  }

  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const cvText = await parsePdfCv(file.path);
  const application = await Application.create({
    applicant: applicantId,
    job: jobId,
    cvFileName: file.filename,
    cvFileUrl: `/uploads/${file.filename}`,
    cvText
  });

  return res.status(201).json(application);
};

export const getApplicationsForJob = async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.recruiter.toString() !== req.user?.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate("applicant", "-password")
    .sort({ createdAt: -1 });

  return res.json(applications);
};

export const getApplicantApplications = async (req: AuthenticatedRequest, res: Response) => {
  const applications = await Application.find({ applicant: req.user?.id })
    .populate("job")
    .sort({ createdAt: -1 });

  return res.json(applications);
};

export const updateApplicantProfile = async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { $set: { profile: req.body } },
    { new: true }
  ).select("-password");

  return res.json(user);
};
