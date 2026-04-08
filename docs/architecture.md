# Architecture Notes

## System Overview

The platform is split into a separately deployable frontend and backend:

- `frontend`
  - Next.js App Router application
  - Redux Toolkit state management
  - Tailwind-based presentation layer
- `backend`
  - Express REST API
  - Mongoose domain models
  - Gemini integration and CV parsing services

## Core Backend Domains

- `User`
  - Recruiter or applicant role
  - Optional applicant profile with name, skills, experience, and education
- `Job`
  - Recruiter-owned role definition and requirements
- `Application`
  - Job application with parsed CV text and weighted AI baseline scores
- `ScreeningResult`
  - Persisted shortlist output from Gemini analysis

## Request Flow

1. Auth routes issue JWTs after login or registration.
2. Recruiters create jobs through `/jobs`.
3. Applicants upload a CV through `/applications`.
4. The backend parses the PDF and stores extracted text with the application.
5. Recruiters analyze a job through `/ai/analyze`.
6. Screening results are persisted and later fetched via `/ai/results/:jobId`.

## Frontend State Model

- `auth`
  - User identity, token, auth loading/error state
- `jobs`
  - Job list and recruiter-owned job management
- `applications`
  - Applicant submissions, recruiter applicant lists, and profile state
- `ai`
  - Screening result payload and AI loading/error state
