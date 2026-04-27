import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { runScreening, getScreeningResults, getScreeningResultById } from '../services/screeningService';

export const screeningRouter = Router();

const TriggerSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
  shortlistSize: z.union([z.literal(10), z.literal(20)]).default(10),
});


screeningRouter.post('/trigger', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = TriggerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors.map(e => e.message).join(', '));
    }
    const { jobId, shortlistSize } = parsed.data;
    const result = await runScreening(jobId, shortlistSize);
    res.status(201).json({
      message: `Screening complete. Top ${result.shortlist.length} candidates ranked.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});


screeningRouter.get('/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await getScreeningResults(req.params.jobId);
    res.json({ data: results, count: results.length });
  } catch (err) {
    next(err);
  }
});


screeningRouter.get('/result/:resultId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getScreeningResultById(req.params.resultId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});