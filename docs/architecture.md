# Architecture Notes

## System Overview

The platform is a two-tier deployment:

- `frontend`
  - Next.js App Router
  - Redux Toolkit state management
  - Recruiter and applicant dashboards
- `backend`
  - Express REST API
  - MongoDB + Mongoose
  - Zod validation
  - Multer upload handling
  - PDF/CSV ingestion 
  - Gemini ranking service
  - Nodemailer for sending emails to applicants on updates

## Core Backend Domains

- `User`
  - recruiter or applicant
  - applicant profile stored in the official talent profile schema
- `Job`
  - recruiter-owned role definition
  - includes required skills, project keywords, certifications, and availability requirement
- `Application`
  - stores CV text, parsed profile, normalized profile, and deterministic score breakdown
- `ScreeningResult`
  - persisted AI ranking output, comparison insight, fairness summary, and recruiter insights

## Request Flow

1. `/auth` creates or authenticates users with JWTs.
2. `/jobs` stores recruiter job requirements.
3. `/applications` accepts multipart form data with `talentProfile` JSON and optional `cv`.
4. The backend parses CV text, converts it into the talent profile shape, and normalizes candidate data.
5. `/ai/analyze` computes deterministic scores for every applicant on the job.
6. Gemini compares all candidates in one pass and returns strict JSON rankings.
7. Results are saved and exposed through `/ai/results/:jobId`.

## Frontend State Model

- `auth`
  - token, user, loading, error
- `jobs`
  - open roles and recruiter-created jobs
- `applications`
  - applicant submissions, recruiter applicant lists, and profile updates
- `ai`
  - stored shortlist result, loading, error
