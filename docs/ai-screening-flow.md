# AI Screening Flow

## Prompt Strategy

The backend sends one Gemini request per job analysis containing:

- structured job requirements
- every candidate talent profile as structured JSON
- deterministic weighted scores and matched/missing skills

## Deterministic Scoring

- Skills match: 40%
- Experience: 25%
- Projects: 15%
- Education: 10%
- Certifications: 5%
- Availability: 5%

This baseline is the fairness anchor. Gemini can adjust slightly, but the scoring model is made explicit in the prompt.

## Gemini Contract

Gemini receives the following instruction set:

- evaluate all candidates fairly and consistently
- compare candidates against each other
- respect the weighted scoring provided
- adjust scores slightly if justified
- rank candidates best to worst
- return strict JSON only

Each candidate response includes:

- `rank`
- `score`
- `strengths`
- `gaps`
- `recommendation`
- `comparisonInsight`

## Explainability Layer

After Gemini responds, the backend enriches each candidate with:

- `matchedSkills`
- `missingSkills`
- `skillGapSuggestions`
- `componentScores`
- `fairnessNotes`
- `whyBetterThanNext`

## Recruiter Insights

The stored screening result also includes:

- applicant count
- shortlisted count
- average AI score
- average weighted score
- top skills distribution
