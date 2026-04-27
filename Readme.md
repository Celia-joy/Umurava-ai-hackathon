# 🧠 Umurava AI — Talent Screening API

> AI-powered talent profile screening tool built for the **Umurava AI Hackathon 2026**
> Theme: *"An Innovation Challenge to Build AI Products for the Human Resources Industry"*

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [AI Decision Flow](#-ai-decision-flow)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Assumptions & Limitations](#-assumptions--limitations)
- [Team](#-team)

---

## 📖 Project Overview

Recruiters face two major challenges: **high application volumes** and **difficulty objectively comparing candidates**. This system solves that by using Google's Gemini AI to:

- Analyze job requirements and candidate profiles
- Score and rank applicants (Top 10 or Top 20)
- Generate transparent, explainable reasoning per candidate

The tool supports two input modes:
1. **Structured profiles** from the Umurava talent platform
2. **Unstructured data** from external job boards (CSV/Excel uploads + PDF resumes)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│         Recruiter Dashboard · Job Forms · Shortlist  │
└────────────────────────┬────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────┐
│                  Backend (Node.js + TS)              │
│                                                      │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│   │  Jobs API   │  │ Applicants   │  │ Screening │  │
│   │  CRUD       │  │ Ingestion    │  │ Trigger   │  │
│   └─────────────┘  └──────────────┘  └─────┬─────┘  │
│                                            │         │
│                          ┌─────────────────▼──────┐  │
│                          │   AI Orchestration     │  │
│                          │   (Gemini API Layer)   │  │
│                          └────────────────────────┘  │
└────────────────────────────────┬────────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │            MongoDB Atlas             │
              │   jobs · applicants · screenings     │
              └─────────────────────────────────────┘
```

---

## 🤖 AI Decision Flow

```
1. Recruiter creates a Job (role, skills, experience, requirements)
         │
2. Applicants are ingested (structured profiles OR parsed CSV/PDF)
         │
3. Recruiter triggers screening for a Job
         │
4. Backend builds a single Gemini prompt containing:
   - Job description & requirements
   - All candidate profiles (batched)
   - Scoring weights: skills (35%), experience (30%),
                      education (20%), role relevance (15%)
         │
5. Gemini returns structured JSON:
   [
     {
       "rank": 1,
       "candidateId": "...",
       "matchScore": 87,
       "strengths": ["..."],
       "gaps": ["..."],
       "recommendation": "Strongly recommend for interview"
     },
     ...
   ]
         │
6. Results are stored in MongoDB and returned to the frontend
         │
7. Recruiter views ranked shortlist with full AI reasoning per candidate
```

> **Prompt Engineering Note:** All Gemini prompts are stored in `/src/ai/prompts/` and documented with comments explaining the design decisions, weighting rationale, and output format contract.

---

## 🛠 Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Language     | TypeScript                        |
| Runtime      | Node.js                           |
| Framework    | Express.js                        |
| Database     | MongoDB + Mongoose                |
| AI / LLM     | Google Gemini API *(mandatory)*   |
| File Parsing | Multer + csv-parser + pdf-parse   |
| Validation   | Zod                               |
| Auth         | JWT (Bearer tokens)               |
| Deployment   | Railway / Render                  |

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts               # MongoDB connection
│   ├── models/
│   │   ├── Job.ts              # Job schema
│   │   ├── Applicant.ts        # Applicant/profile schema
│   │   └── Screening.ts        # Screening results schema
│   ├── routes/
│   │   ├── jobs.ts             # Job CRUD routes
│   │   ├── applicants.ts       # Applicant ingestion routes
│   │   └── screening.ts        # AI screening trigger + results
│   ├── controllers/
│   │   ├── jobController.ts
│   │   ├── applicantController.ts
│   │   └── screeningController.ts
│   ├── services/
│   │   ├── jobService.ts
│   │   ├── applicantService.ts
│   │   ├── fileParserService.ts  # CSV / PDF parsing logic
│   │   └── screeningService.ts   # AI orchestration logic
│   ├── ai/
│   │   ├── geminiClient.ts       # Gemini API client setup
│   │   └── prompts/
│   │       └── screeningPrompt.ts # Prompt templates + docs
│   ├── middleware/
│   │   ├── auth.ts               # JWT middleware
│   │   ├── errorHandler.ts       # Global error handler
│   │   └── validate.ts           # Zod request validation
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types
│   └── app.ts                    # Express app setup
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Bolice1/UmuravaAI.git
cd UmuravaAI/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Run in development mode
npm run dev

# 5. Build for production
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` root based on `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/umurava-ai

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 📡 API Reference

### Jobs

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| POST   | `/api/jobs`      | Create a new job     |
| GET    | `/api/jobs`      | List all jobs        |
| GET    | `/api/jobs/:id`  | Get a single job     |
| PUT    | `/api/jobs/:id`  | Update a job         |
| DELETE | `/api/jobs/:id`  | Delete a job         |

### Applicants

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| POST   | `/api/applicants/profile`         | Add structured Umurava profile     |
| POST   | `/api/applicants/upload/csv`      | Upload CSV/Excel applicant sheet   |
| POST   | `/api/applicants/upload/resume`   | Upload PDF resume                  |
| GET    | `/api/applicants?jobId=:id`       | List applicants for a job          |

### Screening

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| POST   | `/api/screening/:jobId/run`       | Trigger AI screening for a job     |
| GET    | `/api/screening/:jobId/results`   | Get ranked shortlist with reasoning|

### Example Screening Result

```json
{
  "jobId": "abc123",
  "shortlist": [
    {
      "rank": 1,
      "candidateId": "xyz789",
      "name": "Jane Doe",
      "matchScore": 91,
      "strengths": [
        "5 years of relevant React experience",
        "Strong TypeScript background matching role requirements"
      ],
      "gaps": [
        "No prior experience with MongoDB"
      ],
      "recommendation": "Strongly recommend for interview"
    }
  ],
  "generatedAt": "2026-04-15T10:30:00Z"
}
```

---

## ⚠️ Assumptions & Limitations

- **Gemini token limits:** Very large applicant pools (100+) are batched into multiple Gemini calls and results merged before final ranking.
- **PDF parsing accuracy:** Complex or image-based PDFs may not parse with full fidelity. Plain-text PDFs are recommended.
- **Dummy data:** All test data follows the Talent Profile Schema provided by Umurava. No real personal data is used.
- **Human-in-the-loop:** AI output is advisory only. Final hiring decisions remain with the recruiter. The system never auto-rejects candidates.
- **Auth scope:** JWT auth is implemented for recruiter sessions. Candidate-facing auth is out of scope for this prototype.

---

## 👥 Team

| Role                    | Responsibility                                      |
|-------------------------|-----------------------------------------------------|
| Back-End Engineer       | API design, DB modeling, AI orchestration           |
| Front-End Engineer      | Recruiter dashboard, shortlist UI, file upload UX   |
| AI Software Engineer    | Gemini prompt engineering, scoring logic, explainability |

---

> Built with 🔥 for the Umurava AI Hackathon · Submission: 24th April 2026