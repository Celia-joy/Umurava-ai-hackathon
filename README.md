# Umurava RecruitAI

Umurava RecruitAI is a production-oriented recruitment screening platform with a Next.js frontend, Express API, MongoDB persistence, and Gemini-powered candidate analysis. Recruiters can publish structured jobs, review applicants, trigger one-request AI screening, and inspect explainable shortlist decisions. Applicants can maintain profiles, upload PDF CVs, and apply to roles through a clean dashboard experience.

## Project Structure

```text
/frontend   Next.js App Router + TypeScript + Tailwind + Redux Toolkit
/backend    Express + TypeScript + MongoDB + Gemini integration
/docs       Architecture and AI-flow documentation
README.md
```

## Architecture

- Frontend:
  - Next.js App Router for landing, auth, dashboards, jobs, applications, and results pages
  - Redux Toolkit for auth, jobs, applications, and AI screening state
  - Tailwind CSS for the light blue and white Umurava-inspired UI system
- Backend:
  - Express REST API with route groups for `/auth`, `/jobs`, `/applications`, and `/ai`
  - JWT authentication with recruiter and applicant role-based access control
  - Multer-based PDF uploads and `pdf-parse` CV extraction
  - Gemini analysis pipeline that evaluates all applicants for a job in one request
- Database:
  - MongoDB Atlas or local MongoDB through Mongoose models for users, jobs, applications, and screening results

## Features

- Recruiter features:
  - Register and login with JWT
  - Create detailed jobs with structured hiring criteria
  - View applicants per job
  - Trigger AI analysis for all candidates at once
  - Review ranked shortlist results with strengths, gaps, recommendations, and comparison notes
- Applicant features:
  - Register and login
  - Create and update profile details
  - Upload PDF CVs
  - Apply to jobs
  - Track application status and weighted screening score

## AI Decision Flow

1. Recruiter selects a job and clicks `Analyze Candidates`.
2. Backend fetches the job and all related applications in one batch.
3. Candidate profiles and parsed CV text are converted into a weighted baseline score:
   - Skills: 40%
   - Experience: 30%
   - Education: 20%
   - Relevance: 10%
4. Backend sends one Gemini request containing:
   - Structured job data
   - Every candidate payload
   - Computed weighted scores
   - Instructions to return strict JSON only
5. Gemini returns ranked candidates with score, strengths, gaps, and recommendations.
6. Backend enriches results with:
   - `Why Candidate A > Candidate B`
   - Skill gap suggestions
   - Highlighted top skills
7. Results are stored in MongoDB and rendered on the recruiter results page.

## Environment Variables

Create a root `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=/api/proxy
```

Note: the backend also accepts `MONGO_URI` for compatibility with the current local env file.

## Local Setup

1. Install backend dependencies:
   - `cd backend`
   - `npm install`
2. Install frontend dependencies:
   - `cd ../frontend`
   - `npm install`
3. Run backend:
   - `npm run dev`
4. Run frontend in another terminal:
   - `cd frontend`
   - `npm run dev`
5. Open `http://localhost:3000`

## Deployment

- Frontend:
  - Deploy `frontend` to Vercel
  - Set `NEXT_PUBLIC_API_URL` to the deployed backend URL
- Backend:
  - Deploy `backend` to Render using the included [`render.yaml`](/home/bolice/Projects/UmuravaAI/backend/render.yaml)
  - Set `GEMINI_API_KEY`, `MONGODB_URI`, and `JWT_SECRET`
- Database:
  - Use MongoDB Atlas for production

## Assumptions And Limitations

- CV uploads are limited to PDF files up to 5MB.
- Gemini output is expected to follow strict JSON; malformed model responses should be retried or validated more defensively in future hardening.
- Weighted scores are heuristic and intended as a baseline for explainable AI, not a substitute for human hiring decisions.
- The current implementation stores uploads locally; production systems may prefer object storage such as S3 or Cloudinary.
- The frontend is wired for direct REST communication and assumes a reachable backend URL.

## API Overview

- `POST /auth/register`
- `POST /auth/login`
- `PUT /auth/profile`
- `GET /jobs`
- `GET /jobs/mine`
- `POST /jobs`
- `POST /applications`
- `GET /applications/me`
- `GET /applications/job/:jobId`
- `PUT /applications/profile`
- `POST /ai/analyze`
- `GET /ai/results/:jobId`

## Documentation

- Architecture notes: [`docs/architecture.md`](/home/bolice/Projects/UmuravaAI/docs/architecture.md)
- AI prompt and flow details: [`docs/ai-screening-flow.md`](/home/bolice/Projects/UmuravaAI/docs/ai-screening-flow.md)
