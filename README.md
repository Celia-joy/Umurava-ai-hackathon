# Umurava RecruitAI

Production-ready AI recruitment platform for the Umurava AI Hackathon. The system has a recruiter-facing workflow that combines the official talent profile schema, CV parsing, deterministic scoring, Gemini reasoning, fairness messaging, and a polished light-blue dashboard experience.
## project live links 

1. Backend hosted on render 
```text
https://umuravaai-backend.onrender.com

```
2. Frontend hosted on vercel
```text 
https://umurava-ai-frontend.vercel.app

```


## Project Overview

- Recruiters create jobs with structured hiring signals: required skills, project keywords, certifications, education, experience, availability, eligibility, and job type.
- Applicants submit the official talent profile schema plus optional CV uploads for hybrid structured + unstructured ingestion.
- The backend normalizes talent data, parses PDFs, computes deterministic scores, and sends all candidates for a role to Gemini in one comparison request.
- Recruiters get ranked candidates, score breakdowns, missing-skill analysis, side-by-side comparisons, fairness notes, and pool-level insights.

## Architecture Diagram

```text
┌──────────────────────────────┐
│         Next.js UI           │
│------------------------------│
│ Recruiter dashboard          │
│ Applicant dashboard          │
│ Job board + application flow │
│ AI results + comparisons     │
└──────────────┬───────────────┘
               │ REST / JSON / multipart
┌──────────────▼───────────────┐
│         Express API          │
│------------------------------│
│ /auth                        │
│ /jobs                        │
│ /applications                │
│ /ai/analyze                  │
│ Zod validation               |
| Nodemailer email sending     │
│ Multer upload security       │
│ PDF parsing + normalization  │
└───────┬───────────────┬──────┘
        │               │
┌───────▼───────┐ ┌─────▼─────────────┐
│ MongoDB Atlas │ │ Gemini API        │
│---------------│ │-------------------│
│ Users         │ │ Multi-candidate   │
│ Jobs          │ │ ranking           │
│ Applications  │ │ strengths/gaps    │
│ Results       │ │ comparison insight│
└───────────────┘ └───────────────────┘
```

## Official Talent Profile Schema

The applicant profile and application snapshot use the same structure end to end:

```ts
{
  basicInfo: {
    firstName,
    lastName,
    email,
    headline,
    bio,
    location
  },
  skills: [{ name, level, yearsOfExperience }],
  languages: [{ name, proficiency }],
  experience: [{ company, role, startDate, endDate, description, technologies, isCurrent }],
  education: [{ institution, degree, fieldOfStudy, startYear, endYear }],
  certifications: [{ name, issuer, issueDate, expirationDate, credentialId }],
  projects: [{ name, description, technologies, role, url }],
  availability: { status, startDate, notes },
  socialLinks: [{ platform, url }]
}
```

## AI Decision Flow

1. Recruiter creates a job with role requirements.
2. Applicant submits structured profile data and optionally uploads a PDF/CSV CV.
3. Backend parses the CV, converts it into the talent profile structure, and normalizes labels like `Nodejs` to `Node.js`.
4. The deterministic scoring engine computes:
   - Skills match: 40%
   - Experience: 25%
   - Projects: 15%
   - Education: 10%
   - Certifications: 5%
   - Availability: 5%
5. Backend sends Gemini:
   - job requirements
   - all structured talent profiles
   - precomputed scores
6. Gemini returns strict JSON with:
   - rank
   - score
   - strengths
   - gaps
   - recommendation
   - comparison insight
7. Backend enriches and stores:
   - matched skills
   - missing skills
   - component scores
   - fairness messaging
   - skill gap suggestions
   - pool-wide recruiter insights

## Key Features

- Official talent profile schema stored in MongoDB and validated with Zod.
- Hybrid ingestion flow for forms plus PDF/CSV upload parsing.
- Multi-candidate Gemini analysis with strict JSON output.
- Explainable ranking with deterministic baseline plus AI comparison reasoning.
- Recruiter dashboard with score bars, fairness layer, skills distribution, and candidate comparison panel.
- Skill gap analysis for every ranked candidate.

## API Routes

- `POST /auth/register`
- `POST /auth/login`
- `PUT /auth/profile`
- `GET /jobs`
- `GET /jobs/mine`
- `GET /jobs/:jobId`
- `POST /jobs`
- `GET /applications/me`
- `GET /applications/job/:jobId`
- `PUT /applications/profile`
- `POST /applications`
- `POST /ai/analyze`
- `GET /ai/results/:jobId`

## Environment Variables

Create a root `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=/api/proxy
```

Optional:

```env
MONGO_URI=legacy_alias_for_mongodb_uri
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## Setup Instructions

1. Install backend dependencies.
   `cd backend && npm install`
2. Install frontend dependencies.
   `cd frontend && npm install`
3. Start the backend.
   `cd backend && npm run dev`
4. Start the frontend.
   `cd frontend && npm run dev`
5. Open `http://localhost:3000`.

## Deployment Validation

- Frontend is configured for Vercel in [frontend/vercel.json](/UmuravaAI/frontend/vercel.json).
- Backend includes Render config in [backend/render.yaml](/UmuravaAI/backend/render.yaml).
- MongoDB Atlas is the intended production database target through `MONGODB_URI`.
- currently both the backend and frontend are deployed live on vercel and render, our database is on mongo atlas 

## Testing Flow

Recommended demo script:

1. Recruiter registers and creates a job.
2. Applicant registers and completes the structured talent profile.
3. Applicant applies with profile data and optional CV upload.
4. Recruiter opens the dashboard and runs `/ai/analyze`.
5. Results page shows ranked shortlist, skill gaps, fairness notes, and candidate comparisons.

Verification completed in this repo:

- `cd backend && npm run lint`
- `cd backend && npm run build`
- `cd frontend && npm run build`

## Assumptions And Limitations

- PDF extraction is heuristic and works best when the CV has a readable text layer.
- CSV support remains available for structured imports, though the primary CV path is PDF.
- Fairness language reduces bias risk by constraining analysis to job-related evidence, but it is not a formal bias audit.
- Uploaded files are stored in `backend/uploads`; production should move this to object storage.( planning to place them on cloudinary)
- Live Vercel/Render/Atlas/cloudinary
## Supporting Docs

- [Architecture Notes](/UmuravaAI/docs/architecture.md)
- [AI Screening Flow](/UmuravaAI/docs/ai-screening-flow.md)
