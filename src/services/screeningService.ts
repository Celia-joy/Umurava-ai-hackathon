import { Job } from '../models/Job';
import { Applicant } from '../models/Applicant';
import { ScreeningResult } from '../models/ScreeningResult';
import { evaluateCandidates, GEMINI_MODEL, PROMPT_VERSION } from './geminiService';
import { AppError } from '../middleware/errorHandler';
import { IScreeningResult } from '../types';


export async function runScreening(
  jobId: string,
  shortlistSize: 10 | 20 = 10
): Promise<IScreeningResult> {
  
  const job = await Job.findById(jobId).lean();
  if (!job) throw new AppError(404, `Job ${jobId} not found`);
  if (job.status === 'closed') throw new AppError(400, 'Cannot screen a closed job');

 
  const applicants = await Applicant.find({ jobId }).lean();
  if (applicants.length === 0) {
    throw new AppError(400, 'No applicants found for this job. Add applicants before screening.');
  }

  const effectiveShortlistSize = Math.min(shortlistSize, applicants.length);


  const screeningRecord = await ScreeningResult.create({
    jobId,
    triggeredAt: new Date(),
    status: 'running',
    totalApplicants: applicants.length,
    shortlistSize: effectiveShortlistSize,
    shortlist: [],
    geminiModel: GEMINI_MODEL,
    promptVersion: PROMPT_VERSION,
  });

 
  try {

    const applicantsForGemini = applicants.map(a => ({
      ...a,
      _id: String(a._id),
    })) as any[];

    const shortlist = await evaluateCandidates(
      { ...job, _id: String(job._id) },
      applicantsForGemini,
      effectiveShortlistSize
    );

    const completed = await ScreeningResult.findByIdAndUpdate(
      screeningRecord._id,
      {
        status: 'completed',
        completedAt: new Date(),
        shortlist,
      },
      { new: true }
    );

    return completed!.toObject();
  } catch (err) {
   
    await ScreeningResult.findByIdAndUpdate(screeningRecord._id, {
      status: 'failed',
      error: (err as Error).message,
    });
    throw err;
  }
}


export async function getScreeningResults(jobId: string): Promise<IScreeningResult[]> {
  const results = await ScreeningResult.find({ jobId })
    .sort({ triggeredAt: -1 })
    .lean();
  return results as unknown as IScreeningResult[];
}


export async function getScreeningResultById(resultId: string): Promise<IScreeningResult> {
  const result = await ScreeningResult.findById(resultId).lean();
  if (!result) throw new AppError(404, 'Screening result not found');
  return result as unknown as IScreeningResult;
}