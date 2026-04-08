import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { CandidatePayload } from "../utils/scoreCandidates";

interface RankedResponse {
  rank: number;
  name: string;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

const modelName = "gemini-2.0-flash-latest";

const parseGeminiJson = (text: string): RankedResponse[] => {
  const sanitized = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(sanitized) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response was not a JSON array");
  }

  return parsed as RankedResponse[];
};

const getErrorStatus = (error: unknown) => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
};

export const analyzeCandidatesWithGemini = async (
  jobSummary: Record<string, unknown>,
  candidates: CandidatePayload[],
  topCount: number
) => {
  if (!env.geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const client = new GoogleGenerativeAI(env.geminiApiKey);
  const model = client.getGenerativeModel({ model: modelName });

  const prompt = `
You are an expert recruiter AI.

Job Description:
${JSON.stringify(jobSummary, null, 2)}

Candidates:
${JSON.stringify(candidates, null, 2)}

Instructions:
- Evaluate ALL candidates
- Use the provided computed scores as a baseline, but independently reason from the job and candidate content
- Score each candidate from 0 to 100
- Rank all candidates against each other
- Select the top ${topCount}
- For each candidate provide:
  - rank
  - name
  - score
  - strengths
  - gaps
  - recommendation
- Be objective and consistent
- Compare candidates against each other
- Return STRICT JSON only with no markdown

JSON format:
[
  {
    "rank": 1,
    "name": "Candidate Name",
    "score": 91,
    "strengths": ["..."],
    "gaps": ["..."],
    "recommendation": "..."
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return {
      model: modelName,
      ranked: parseGeminiJson(text)
    };
  } catch (error) {
    if (getErrorStatus(error) === 429) {
      throw new Error("Gemini API rate limit exceeded. Please try again later.");
    }

    console.error("Error analyzing candidates with Gemini:", error);
    throw new Error("Failed to analyze candidates with Gemini");
  }
};
