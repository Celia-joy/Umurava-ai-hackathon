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
  whySelected?: string;
  whyNotSelected?: string;
}

const modelName = "gemini-2.0-flash";

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const stripCodeFences = (text: string) =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const parseGeminiJson = (text: string): RankedResponse[] => {
  const sanitized = stripCodeFences(text);
  const parsed = JSON.parse(sanitized) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response was not a JSON array");
  }

  return parsed.map((item, index) => {
    const candidate = item as Partial<RankedResponse>;

    return {
      rank: typeof candidate.rank === "number" ? candidate.rank : index + 1,
      name: typeof candidate.name === "string" ? normalizeWhitespace(candidate.name) : `Candidate ${index + 1}`,
      score: typeof candidate.score === "number" ? candidate.score : 0,
      strengths: Array.isArray(candidate.strengths) ? candidate.strengths.filter((value): value is string => typeof value === "string") : [],
      gaps: Array.isArray(candidate.gaps) ? candidate.gaps.filter((value): value is string => typeof value === "string") : [],
      recommendation: typeof candidate.recommendation === "string" ? candidate.recommendation.trim() : "",
      whySelected: typeof candidate.whySelected === "string" ? candidate.whySelected.trim() : "",
      whyNotSelected: typeof candidate.whyNotSelected === "string" ? candidate.whyNotSelected.trim() : ""
    };
  });
};

const getErrorStatus = (error: unknown) => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
};

const buildFallbackRanking = (candidates: CandidatePayload[], topCount: number): RankedResponse[] =>
  [...candidates]
    .sort((a, b) => b.computed.weightedScore - a.computed.weightedScore)
    .map((candidate, index) => ({
      rank: index + 1,
      name: candidate.name,
      score: candidate.computed.weightedScore,
      strengths: [
        `Weighted baseline score of ${candidate.computed.weightedScore} supported by structured evaluation`,
        candidate.skills.length ? `Relevant skills include ${candidate.skills.slice(0, 4).join(", ")}` : "Profile information was normalized from uploaded materials"
      ],
      gaps: candidate.skills.length ? [] : ["Limited structured skill data was available in the submitted profile"],
      recommendation: "Fallback shortlist generated from weighted scoring because Gemini analysis was temporarily unavailable.",
      whySelected: "Selected based on the strongest weighted alignment across skills, experience, education, and role relevance.",
      whyNotSelected: index < topCount
        ? "Still has some gaps, but the overall baseline score placed this candidate inside the shortlist."
        : "Not selected because the weighted baseline score was lower than the shortlist threshold."
    }));

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
- Return the FULL ranked list for all candidates, not only the shortlisted subset
- For each candidate provide:
  - rank
  - name
  - score
  - strengths
  - gaps
  - recommendation
  - whySelected
  - whyNotSelected
- Be objective and consistent
- Avoid demographic, gender, age, ethnicity, or other protected-attribute assumptions
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
    "recommendation": "...",
    "whySelected": "...",
    "whyNotSelected": "..."
  }
]
`;

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: attempt === 0 ? 0.2 : 0.1
          }
        });
        const text = result.response.text().trim();

        return {
          model: modelName,
          ranked: parseGeminiJson(text)
        };
      } catch (error) {
        if (attempt === 1) {
          throw error;
        }
      }
    }

    throw new Error("Gemini retries exhausted");
  } catch (error) {
    console.error("Error analyzing candidates with Gemini:", error);
    const fallbackModelName = getErrorStatus(error) === 429 ? `${modelName}-rate-limited-fallback` : `${modelName}-fallback`;

    return {
      model: fallbackModelName,
      ranked: buildFallbackRanking(candidates, topCount)
    };
  }
};
