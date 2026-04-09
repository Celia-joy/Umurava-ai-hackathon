import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { CandidatePayload } from "../utils/scoreCandidates";

interface RankedResponse {
  applicationId?: string;
  rank: number;
  name: string;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  comparisonInsight: string;
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
  const parsed = JSON.parse(stripCodeFences(text)) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response was not a JSON array");
  }

  return parsed.map((item, index) => {
    const candidate = item as Partial<RankedResponse>;

    return {
      applicationId: typeof candidate.applicationId === "string" ? candidate.applicationId : undefined,
      rank: typeof candidate.rank === "number" ? candidate.rank : index + 1,
      name: typeof candidate.name === "string" ? normalizeWhitespace(candidate.name) : `Candidate ${index + 1}`,
      score: typeof candidate.score === "number" ? Math.max(0, Math.min(100, candidate.score)) : 0,
      strengths: Array.isArray(candidate.strengths) ? candidate.strengths.filter((value): value is string => typeof value === "string") : [],
      gaps: Array.isArray(candidate.gaps) ? candidate.gaps.filter((value): value is string => typeof value === "string") : [],
      recommendation: typeof candidate.recommendation === "string" ? candidate.recommendation.trim() : "",
      comparisonInsight: typeof candidate.comparisonInsight === "string" ? candidate.comparisonInsight.trim() : ""
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

const buildFallbackRanking = (candidates: CandidatePayload[]): RankedResponse[] =>
  [...candidates]
    .sort((a, b) => b.computed.weightedScore - a.computed.weightedScore)
    .map((candidate, index, array) => ({
      applicationId: candidate.applicationId,
      rank: index + 1,
      name: candidate.name,
      score: candidate.computed.weightedScore,
      strengths: [
        `${candidate.matchedSkills.length} required skills matched`,
        candidate.headline || "Strong structured profile coverage"
      ],
      gaps: candidate.missingSkills.length ? candidate.missingSkills.slice(0, 4) : ["No major requirement gaps detected"],
      recommendation: candidate.computed.weightedScore >= 75
        ? "Strong shortlist candidate based on deterministic scoring."
        : "Consider for further review if role priorities are flexible.",
      comparisonInsight: array[index + 1]
        ? `${candidate.name} edges the next candidate with a stronger weighted profile against the stated role criteria.`
        : `${candidate.name} leads this shortlist on weighted fit.`
    }));

export const analyzeCandidatesWithGemini = async (
  jobSummary: Record<string, unknown>,
  candidates: CandidatePayload[]
) => {
  if (!env.geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const client = new GoogleGenerativeAI(env.geminiApiKey);
  const model = client.getGenerativeModel({ model: modelName });
  const profiles = candidates.map((candidate) => ({
    applicationId: candidate.applicationId,
    applicantId: candidate.applicantId,
    name: candidate.name,
    headline: candidate.headline,
    talentProfile: candidate.talentProfile
  }));
  const scores = candidates.map((candidate) => ({
    applicationId: candidate.applicationId,
    name: candidate.name,
    weightedScore: candidate.computed.weightedScore,
    components: candidate.computed,
    matchedSkills: candidate.matchedSkills,
    missingSkills: candidate.missingSkills
  }));

  const prompt = `
You are an expert recruiter AI.

Job Requirements:
${JSON.stringify(jobSummary, null, 2)}

Talent Profiles (Structured JSON):
${JSON.stringify(profiles, null, 2)}

Precomputed Scores:
${JSON.stringify(scores, null, 2)}

Instructions:

* Evaluate ALL candidates fairly and consistently
* Compare candidates against each other
* Respect the weighted scoring provided
* Adjust scores slightly if justified
* Rank candidates from best to worst

For each candidate return:

* applicationId
* rank
* name
* score (0–100)
* strengths (based on schema fields)
* gaps (missing skills, experience, etc.)
* recommendation
* comparisonInsight (why this candidate ranks above the next one)

Ensure fairness and avoid bias.

Return STRICT JSON only.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    return {
      model: modelName,
      ranked: parseGeminiJson(result.response.text().trim())
    };
  } catch (error) {
    console.error("Error analyzing candidates with Gemini:", error);
    const fallbackModelName = getErrorStatus(error) === 429 ? `${modelName}-rate-limited-fallback` : `${modelName}-fallback`;

    return {
      model: fallbackModelName,
      ranked: buildFallbackRanking(candidates)
    };
  }
};
