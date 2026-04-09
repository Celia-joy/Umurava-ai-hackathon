import { Response } from "express";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { User } from "../models/User";
import { parseCvDocument } from "../services/cvService";
import { AuthenticatedRequest } from "../types/express";
import { AppError } from "../utils/errors";
import { applyToJobSchema } from "../validation/schemas";

export const applyToJob = async (req: AuthenticatedRequest, res: Response) => {
  const applicantId = req.user?.id;
  const file = req.file;
  const { jobId } = applyToJobSchema.parse(req.body);

  if (!file) {
    throw new AppError("A PDF or CSV CV is required", 400);
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const existingApplication = await Application.findOne({ applicant: applicantId, job: jobId });
  if (existingApplication) {
    throw new AppError("You have already applied to this job", 409);
  }

  const parsedDocument = await parseCvDocument(file.path, file.originalname);
  const application = await Application.create({
    applicant: applicantId,
    job: jobId,
    cvFileName: file.filename,
    cvFileUrl: `/uploads/${file.filename}`,
    cvFileType: parsedDocument.cvFileType,
    cvText: parsedDocument.cvText,
    extractedData: parsedDocument.extractedData
  });

  return res.status(201).json(await Application.findById(application._id).populate("job"));
};

export const getApplicationsForJob = async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.recruiter.toString() !== req.user?.id) {
    throw new AppError("Forbidden", 403);
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
