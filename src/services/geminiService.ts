// src/services/geminiService.ts - updated imports for new SDK
import { GoogleGenAI } from '@google/genai';
import { IJob, IApplicant, ICandidateScore } from '../types';

export const PROMPT_VERSION = 'v1.0.0';
export const GEMINI_MODEL = 'gemini-2.5-flash';

let genAI: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}


function buildSystemInstruction(): string {
  return `You are a senior technical recruiter and talent evaluation expert with 15+ years of experience in tech hiring. 
Your role is to evaluate job applicants objectively and return structured JSON assessments.

CRITICAL RULES:
1. You MUST return ONLY valid JSON — no markdown, no backticks, no explanation text before or after.
2. Scores must be integers between 0 and 100.
3. Rank 1 = best fit. Rankings must be unique with no ties.
4. Base all assessments strictly on the data provided — do not invent or assume information.
5. Be calibrated: reserve scores above 85 for genuinely exceptional matches.`;
}



function buildEvaluationPrompt(
  job: IJob,
  applicants: IApplicant[],
  shortlistSize: number
): string {
 
  const jobContext = `
JOB POSTING:
- Title: ${job.title}
- Description: ${job.description}
- Required Skills: ${job.requiredSkills.join(', ')}
- Preferred Skills: ${(job.preferredSkills || []).join(', ') || 'None specified'}
- Minimum Experience: ${job.experienceYears} year(s)
- Education Level Required: ${job.educationLevel}
- Location: ${job.location || 'Not specified'} | Remote: ${job.remote ? 'Yes' : 'No'}
`.trim();

  
  const applicantsContext = applicants.map((a, idx) => `
CANDIDATE ${idx + 1}:
- ID: ${a._id}
- Name: ${a.fullName}
- Email: ${a.email}
- Location: ${a.location || 'Not specified'}
- Total Experience: ${a.experienceYears} year(s)
- Skills: ${a.skills.join(', ')}
- Summary: ${a.summary || 'Not provided'}
- Work History: ${
    a.workHistory.length > 0
      ? a.workHistory.map(w =>
          `${w.role} at ${w.company} (${w.startDate} – ${w.endDate || 'present'}): ${w.description || 'No description'}`
        ).join(' | ')
      : 'Not provided'
  }
- Education: ${
    a.education.length > 0
      ? a.education.map(e => `${e.degree} in ${e.field} from ${e.institution} (${e.graduationYear})`).join(' | ')
      : 'Not provided'
  }
- Certifications: ${(a.certifications || []).join(', ') || 'None'}
- Portfolio: ${a.portfolioUrl || 'N/A'}
- LinkedIn: ${a.linkedinUrl || 'N/A'}
- GitHub: ${a.githubUrl || 'N/A'}
`.trim()
  ).join('\n\n');

  return `
${jobContext}

TOTAL CANDIDATES TO EVALUATE: ${applicants.length}
YOU MUST RETURN THE TOP ${shortlistSize} CANDIDATES ONLY.

SCORING RUBRIC (apply these weights strictly):
- Skills Match (40%): How well do the candidate's skills match required and preferred skills?
- Experience Relevance (30%): Does their work history demonstrate relevant experience for this role?
- Education Fit (20%): Does their education background meet or exceed the job's requirements?
- Overall Relevance (10%): General profile-to-job-description fit, including summary and portfolio.

CANDIDATES:
${applicantsContext}

TASK:
1. Evaluate all ${applicants.length} candidates against the job requirements.
2. Score each candidate on all four rubric dimensions (0–100 each).
3. Compute a weighted matchScore: (skills*0.40) + (experience*0.30) + (education*0.20) + (relevance*0.10)
4. Select and rank the top ${shortlistSize} candidates by matchScore (rank 1 = highest score).
5. For each top candidate, identify 2–4 specific strengths and 2–4 specific gaps.
6. Assign a recommendation: "strong_yes" (score≥85), "yes" (70–84), "maybe" (50–69), "no" (<50).

RETURN ONLY THIS JSON STRUCTURE — NO OTHER TEXT:
{
  "shortlist": [
    {
      "applicantId": "<exact candidate ID from input>",
      "fullName": "<candidate name>",
      "email": "<candidate email>",
      "rank": 1,
      "matchScore": 87,
      "scoreBreakdown": {
        "skills": 90,
        "experience": 85,
        "education": 80,
        "relevance": 88
      },
      "strengths": ["Specific strength 1", "Specific strength 2"],
      "gaps": ["Specific gap 1", "Specific gap 2"],
      "recommendation": "strong_yes",
      "reasoning": "2-3 sentence narrative explaining the overall assessment."
    }
  ]
}
`.trim();
}


export async function evaluateCandidates(
  job: IJob,
  applicants: IApplicant[],
  shortlistSize: number = 10
): Promise<ICandidateScore[]> {
  const client = getClient();
  const prompt = buildEvaluationPrompt(job, applicants, shortlistSize);
  const systemInstruction = buildSystemInstruction();

  let rawText: string;
  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    });
    rawText = response.text ?? '';
  } catch (apiErr) {
    throw new Error(`Gemini API call failed: ${(apiErr as Error).message}`);
  }

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: { shortlist: ICandidateScore[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('Gemini raw response (unparseable):', rawText);
    throw new Error('Gemini returned invalid JSON. Raw response logged above.');
  }

  if (!parsed.shortlist || !Array.isArray(parsed.shortlist)) {
    throw new Error('Gemini response missing "shortlist" array');
  }

  const validIds = new Set(applicants.map(a => String(a._id)));
  const validated = parsed.shortlist.filter(candidate => {
    if (!validIds.has(candidate.applicantId)) {
      console.warn(`Gemini returned unknown applicantId: ${candidate.applicantId} — skipping`);
      return false;
    }
    return true;
  });

  return validated
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));
}
