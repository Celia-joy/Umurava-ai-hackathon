import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Job } from '../models/Job';
import { AppError } from '../middleware/errorHandler';

export const jobsRouter = Router();



const JobSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill'),
  preferredSkills: z.array(z.string()).optional(),
  experienceYears: z.number().min(0),
  educationLevel: z.enum(['high_school', 'bachelor', 'master', 'phd', 'any']),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }).optional(),
  status: z.enum(['open', 'closed', 'draft']).optional(),
});

const UpdateJobSchema = JobSchema.partial();


jobsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json({ data: jobs, count: jobs.length });
  } catch (err) {
    next(err);
  }
});


jobsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError(404, 'Job not found');
    res.json({ data: job });
  } catch (err) {
    next(err);
  }
});


jobsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = JobSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors.map(e => e.message).join(', '));
    }
    const job = await Job.create(parsed.data);
    res.status(201).json({ data: job, message: 'Job created successfully' });
  } catch (err) {
    next(err);
  }
});


jobsRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = UpdateJobSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors.map(e => e.message).join(', '));
    }
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      parsed.data,
      { new: true, runValidators: true }
    );
    if (!job) throw new AppError(404, 'Job not found');
    res.json({ data: job, message: 'Job updated successfully' });
  } catch (err) {
    next(err);
  }
});


jobsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) throw new AppError(404, 'Job not found');
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
});