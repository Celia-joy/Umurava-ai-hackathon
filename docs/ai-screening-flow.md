# AI Screening Flow

## Prompt Strategy

The backend builds a single Gemini request per analysis event with:

- The complete job description and structured requirements
- Every candidate profile for the job
- Parsed CV text
- A weighted baseline score for each candidate

## Weighted Baseline

- Skills: 40%
- Experience: 30%
- Education: 20%
- Relevance: 10%

This baseline does not replace model reasoning. It gives Gemini a consistent quantitative anchor before it compares candidates against one another.

## Gemini Request Contract

The prompt asks Gemini to:

- Evaluate all candidates
- Score each candidate from 0 to 100
- Rank all candidates
- Select the top N candidates
- Return strict JSON only

## Explainability Layer

After Gemini responds, the backend enriches each shortlisted candidate with:

- `whyBetterThanNext`
- `skillGapSuggestions`
- `topSkills`
- `weightedScore`

These fields are used by the frontend to explain shortlist decisions more clearly to recruiters.
