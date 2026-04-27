import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Applicant } from '../models/Applicant';
import { AppError } from '../middleware/errorHandler';
import { parseSpreadsheet, parsePdf } from '../services/fileParserService';

export const applicantsRouter = Router();


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, `Unsupported file type: ${file.mimetype}. Use CSV, Excel, or PDF.`));
    }
  },
});



const UmuravaApplicantSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).min(1, 'At least one skill required'),
  experienceYears: z.number().min(0),
  workHistory: z.array(z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })).default([]),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    graduationYear: z.number(),
  })).default([]),
  certifications: z.array(z.string()).optional(),
  portfolioUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  summary: z.string().optional(),
  umuravaId: z.string().optional(),
});


const BulkUmuravaSchema = z.array(UmuravaApplicantSchema);


applicantsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.query;
    if (!jobId) throw new AppError(400, 'jobId query param is required');
    const applicants = await Applicant.find({ jobId }).sort({ createdAt: -1 });
    res.json({ data: applicants, count: applicants.length });
  } catch (err) {
    next(err);
  }
});


applicantsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) throw new AppError(404, 'Applicant not found');
    res.json({ data: applicant });
  } catch (err) {
    next(err);
  }
});

applicantsRouter.post('/structured', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = Array.isArray(req.body) ? req.body : [req.body];
    const parsed = BulkUmuravaSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '));
    }

    const results = await Promise.allSettled(
      parsed.data.map(profile =>
        Applicant.findOneAndUpdate(
          { email: profile.email, jobId: profile.jobId },
          { ...profile, source: 'umurava' },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.status(201).json({
      message: `Ingested ${succeeded} applicant(s)${failed > 0 ? `, ${failed} failed (duplicates or validation errors)` : ''}`,
      succeeded,
      failed,
    });
  } catch (err) {
    next(err);
  }
});


applicantsRouter.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new AppError(400, 'No file uploaded. Send file as multipart/form-data with field name "file"');
      const { jobId } = req.body;
      if (!jobId) throw new AppError(400, 'jobId is required in form data');

      const { buffer, mimetype, originalname } = req.file;
      let applicantsData: Partial<any>[] = [];

      if (mimetype === 'application/pdf') {
        const parsed = await parsePdf(buffer, jobId, originalname);
        applicantsData = [parsed];
      } else {
        applicantsData = await parseSpreadsheet(buffer, mimetype, jobId);
      }

      if (applicantsData.length === 0) {
        throw new AppError(400, 'No valid applicant records found in the uploaded file. Check column headers.');
      }

     
      const results = await Promise.allSettled(
        applicantsData.map(a =>
          Applicant.findOneAndUpdate(
            { email: a.email, jobId },
            a,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          )
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      res.status(201).json({
        message: `Parsed and ingested ${succeeded} applicant(s) from ${originalname}${failed > 0 ? `, ${failed} skipped` : ''}`,
        succeeded,
        failed,
        source: mimetype === 'application/pdf' ? 'pdf' : 'csv',
      });
    } catch (err) {
      next(err);
    }
  }
);


applicantsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) throw new AppError(404, 'Applicant not found');
    res.json({ message: 'Applicant deleted successfully' });
  } catch (err) {
    next(err);
  }
});