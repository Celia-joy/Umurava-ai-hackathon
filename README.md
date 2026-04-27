# 🧠 Umurava RecruitAI

<div align="center">

![Umurava AI Hackathon](https://img.shields.io/badge/Umurava-AI%20Hackathon%202026-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**Production-ready AI-powered talent screening platform built for the Umurava AI Hackathon 2026.**

*"An Innovation Challenge to Build AI Products for the Human Resources Industry"*

[🌐 Live Demo](https://umurava-ai-frontend.vercel.app) · [⚙️ API](https://umuravaai-backend.onrender.com) · [📖 API Docs](#-api-reference) · [🐛 Report Bug](https://github.com/Bolice1/UmuravaAI/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Links](#-live-links)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Official Talent Profile Schema](#-official-talent-profile-schema)
- [AI Decision Flow](#-ai-decision-flow)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Docker Setup](#-docker-setup)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Assumptions & Limitations](#-assumptions--limitations)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## 📖 Overview

Recruiters face two critical problems: **high application volumes** that slow hiring, and **difficulty objectively comparing candidates** across diverse backgrounds and formats.

**Umurava RecruitAI** solves this by combining a deterministic scoring engine with Google Gemini's language reasoning to deliver transparent, explainable, and fair candidate rankings.

- Recruiters create jobs with structured hiring signals: required skills, project keywords, certifications, education, experience, availability, and job type.
- Applicants submit the official Umurava talent profile schema plus optional CV uploads for hybrid structured + unstructured ingestion.
- The backend normalizes talent data, parses PDFs, computes deterministic scores, and sends all candidates to Gemini in a single comparison request.
- Recruiters receive ranked candidates, score breakdowns, missing-skill analysis, side-by-side comparisons, fairness notes, and pool-level insights.

> ⚠️ **Human-in-the-loop by design.** AI output is advisory only. Final hiring decisions always remain with the recruiter.

---

## 🌐 Live Links

| Service     | URL                                          |
|-------------|----------------------------------------------|
| 🖥 Frontend  | https://umurava-ai-frontend.vercel.app       |
| ⚙️ Backend   | https://umuravaai-backend.onrender.com       |
| 🗄 Database  | MongoDB Atlas (private)                      |

---

## ✨ Features

- ✅ **Official Umurava Talent Profile Schema** — stored in MongoDB and validated end-to-end with Zod
- ✅ **Hybrid Ingestion** — structured form submission + PDF/CSV resume upload parsing
- ✅ **Deterministic Scoring Engine** — transparent weighted baseline before AI reasoning
- ✅ **Multi-Candidate Gemini Analysis** — all candidates evaluated in a single prompt for fair comparison
- ✅ **Explainable Rankings** — rank, score, strengths, gaps, and recommendation per candidate
- ✅ **Skill Gap Analysis** — identifies missing skills and suggests improvements for every candidate
- ✅ **Fairness Layer** — constrains AI reasoning to job-relevant evidence only, with fairness messaging
- ✅ **Candidate Comparison Panel** — side-by-side comparison view for recruiters
- ✅ **Pool-Level Insights** — skills distribution and hiring pool analytics
- ✅ **JWT Authentication** — secure auth for both recruiters and applicants
- ✅ **Email Notifications** — Nodemailer integration for application updates
- ✅ **Docker Ready** — multi-stage Docker build with Compose for full local stack
- ✅ **Fully Deployed** — Vercel + Render + MongoDB Atlas

---

## 🛠 Tech Stack

### Frontend

| Technology     | Purpose                        | Version |
|----------------|--------------------------------|---------|
| Next.js        | React framework + SSR/SSG      | 14+     |
| TypeScript     | Type safety                    | 5+      |
| Redux Toolkit  | Global state management        | Latest  |
| Tailwind CSS   | Utility-first styling          | 3+      |
| Axios          | HTTP client for API calls      | Latest  |

### Backend

| Technology     | Purpose                               | Version |
|----------------|---------------------------------------|---------|
| Node.js        | JavaScript runtime                    | 18+     |
| Express.js     | REST API framework                    | 4+      |
| TypeScript     | Type safety                           | 5+      |
| Mongoose       | MongoDB ODM + schema modeling         | 7+      |
| Zod            | Request validation & schema parsing   | Latest  |
| Multer         | File upload handling & security       | Latest  |
| pdf-parse      | PDF text extraction                   | Latest  |
| csv-parser     | CSV/Excel applicant ingestion         | Latest  |
| Nodemailer     | Email notifications                   | Latest  |
| jsonwebtoken   | JWT generation & verification         | Latest  |
| bcryptjs       | Password hashing                      | Latest  |

### AI / LLM

| Technology          | Purpose                                            |
|---------------------|----------------------------------------------------|
| Google Gemini API   | Multi-candidate ranking & natural-language reasoning *(mandatory)* |

### Database

| Technology      | Purpose                          |
|-----------------|----------------------------------|
| MongoDB Atlas   | Cloud-hosted NoSQL database      |
| Mongoose        | Schema modeling & ODM            |

### DevOps & Deployment

| Technology      | Purpose                          |
|-----------------|----------------------------------|
| Docker          | Containerization (multi-stage)   |
| Docker Compose  | Local full-stack orchestration   |
| Vercel          | Frontend hosting                 |
| Render          | Backend hosting                  |
| MongoDB Atlas   | Production database              |

---

## 🏗 Architecture

```text
┌──────────────────────────────────────────┐
│            Next.js Frontend              │
│   TypeScript · Redux Toolkit · Tailwind  │
│------------------------------------------│
│  Recruiter Dashboard                     │
│  Applicant Dashboard                     │
│  Job Board + Application Flow            │
│  AI Results + Candidate Comparisons      │
└──────────────────┬───────────────────────┘
                   │ REST / JSON / multipart
┌──────────────────▼───────────────────────┐
│           Express.js Backend             │
│           Node.js + TypeScript           │
│------------------------------------------│
│  /auth         → JWT authentication      │
│  /jobs         → Job CRUD                │
│  /applications → Applicant flow          │
│  /ai/analyze   → Gemini orchestration    │
│                                          │
│  Zod validation                          │
│  Multer upload + file security           │
│  PDF/CSV parsing + label normalization   │
│  Nodemailer email sending                │
└──────────┬───────────────────────┬───────┘
           │                       │
┌──────────▼──────────┐  ┌─────────▼─────────────┐
│    MongoDB Atlas    │  │   Google Gemini API    │
│---------------------│  │-----------------------│
│  Users              │  │  Multi-candidate       │
│  Jobs               │  │  ranking               │
│  Applications       │  │  Strengths / Gaps      │
│  Results            │  │  Comparison insight    │
└─────────────────────┘  └────────────────────────┘
```

---

## 📐 Official Talent Profile Schema

The applicant profile and application snapshot share the same structure end to end, matching the official Umurava talent schema:

```ts
{
  basicInfo: {
    firstName: string
    lastName: string
    email: string
    headline: string
    bio: string
    location: string
  }
  skills: [
    { name: string, level: string, yearsOfExperience: number }
  ]
  languages: [
    { name: string, proficiency: string }
  ]
  experience: [
    {
      company: string
      role: string
      startDate: string
      endDate: string
      description: string
      technologies: string[]
      isCurrent: boolean
    }
  ]
  education: [
    {
      institution: string
      degree: string
      fieldOfStudy: string
      startYear: number
      endYear: number
    }
  ]
  certifications: [
    {
      name: string
      issuer: string
      issueDate: string
      expirationDate: string
      credentialId: string
    }
  ]
  projects: [
    {
      name: string
      description: string
      technologies: string[]
      role: string
      url: string
    }
  ]
  availability: {
    status: string
    startDate: string
    notes: string
  }
  socialLinks: [
    { platform: string, url: string }
  ]
}
```

---

## 🤖 AI Decision Flow

```text
Step 1 — Recruiter creates a Job
         (role, required skills, experience, certifications, job type)
                │
Step 2 — Applicant submits structured profile + optional PDF/CSV upload
                │
Step 3 — Backend parses & normalizes data
         (e.g. "Nodejs" → "Node.js", heuristic PDF text extraction)
                │
Step 4 — Deterministic Scoring Engine computes baseline scores
         ┌────────────────────────────────┐
         │  Skills match      →   40%     │
         │  Experience        →   25%     │
         │  Projects          →   15%     │
         │  Education         →   10%     │
         │  Certifications    →    5%     │
         │  Availability      →    5%     │
         └────────────────────────────────┘
                │
Step 5 — Backend sends Gemini a single batched prompt:
         - Job requirements
         - All structured talent profiles
         - Precomputed deterministic scores
                │
Step 6 — Gemini returns strict JSON per candidate:
         {
           rank, score, strengths[],
           gaps[], recommendation,
           comparisonInsight
         }
                │
Step 7 — Backend enriches and stores results:
         matched skills · missing skills · component scores
         fairness messaging · skill gap suggestions
         pool-wide recruiter insights
                │
Step 8 — Recruiter views ranked shortlist (Top 10 or Top 20)
         with score bars, AI reasoning, and comparison panel
```

> 📁 All Gemini prompt templates live in `backend/src/ai/prompts/` with inline comments documenting design decisions, weighting rationale, and output format contracts.

---

## 📁 Folder Structure

```
UmuravaAI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                    # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.ts                  # Recruiter & applicant schema
│   │   │   ├── Job.ts                   # Job posting schema
│   │   │   ├── Application.ts           # Application + talent profile snapshot
│   │   │   └── Result.ts                # AI screening results schema
│   │   ├── routes/
│   │   │   ├── auth.ts                  # Register, login, profile
│   │   │   ├── jobs.ts                  # Job CRUD
│   │   │   ├── applications.ts          # Apply, profile, list
│   │   │   └── ai.ts                    # Analyze + results
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── jobController.ts
│   │   │   ├── applicationController.ts
│   │   │   └── aiController.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── jobService.ts
│   │   │   ├── applicationService.ts
│   │   │   ├── fileParserService.ts     # PDF + CSV parsing & normalization
│   │   │   ├── scoringService.ts        # Deterministic scoring engine
│   │   │   └── aiService.ts             # Gemini orchestration logic
│   │   ├── ai/
│   │   │   ├── geminiClient.ts          # Gemini API client
│   │   │   └── prompts/
│   │   │       └── screeningPrompt.ts   # Prompt templates + docs
│   │   ├── middleware/
│   │   │   ├── auth.ts                  # JWT verification
│   │   │   ├── errorHandler.ts          # Global error handler
│   │   │   ├── validate.ts              # Zod validation middleware
│   │   │   └── upload.ts                # Multer file config
│   │   ├── types/
│   │   │   └── index.ts                 # Shared TypeScript interfaces
│   │   └── app.ts                       # Express app entry point
│   ├── uploads/                         # Temp file storage (gitignored)
│   ├── Dockerfile                       # Multi-stage backend Docker build
│   ├── render.yaml                      # Render deployment config
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                         # Next.js app router pages
│   │   ├── components/                  # Reusable UI components
│   │   ├── store/                       # Redux store + slices
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── lib/                         # API client & utilities
│   │   └── types/                       # Shared TypeScript types
│   ├── public/
│   ├── Dockerfile                       # Next.js standalone Docker build
│   ├── vercel.json                      # Vercel deployment config
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
├── docs/
│   ├── architecture.md
│   └── ai-screening-flow.md
│
├── docker-compose.yml                   # Full-stack local orchestration
├── .env.docker.example                  # Docker env template
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement      | Version | Link                                                          |
|------------------|---------|---------------------------------------------------------------|
| Node.js          | 18+     | https://nodejs.org                                            |
| npm              | 9+      | Included with Node.js                                         |
| MongoDB Atlas    | —       | https://www.mongodb.com/atlas                                 |
| Gemini API Key   | —       | https://aistudio.google.com/app/apikey                        |
| Docker (optional)| Latest  | https://www.docker.com                                        |

### Installation (Without Docker)

```bash
# 1. Clone the repository
git clone https://github.com/Bolice1/UmuravaAI.git
cd UmuravaAI

# 2. Setup the backend
cd backend
cp .env.example .env
# → Fill in your environment variables
npm install
npm run dev

# 3. Open a new terminal — setup the frontend
cd ../frontend
cp .env.example .env.local
# → Fill in NEXT_PUBLIC_API_URL
npm install
npm run dev
```

```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

### Available Scripts

#### Backend (`/backend`)

```bash
npm run dev      # Start dev server with hot reload (ts-node-dev)
npm run build    # Compile TypeScript → JavaScript
npm start        # Start production server
npm run lint     # Run ESLint
```

#### Frontend (`/frontend`)

```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/umuravaai
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/umuravaai

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional — Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional — URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=/api/proxy
```

> ⚠️ Never commit `.env` files. They are already in `.gitignore`.

---

## 📡 API Reference

**Production Base URL:** `https://umuravaai-backend.onrender.com`
**Local Base URL:** `http://localhost:5000`

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔑 Auth Routes

| Method | Endpoint         | Auth     | Description                 |
|--------|------------------|----------|-----------------------------|
| POST   | `/auth/register` | None     | Register a new user         |
| POST   | `/auth/login`    | None     | Login and receive JWT token |
| PUT    | `/auth/profile`  | Required | Update user profile         |

**POST `/auth/register`**
```json
// Request
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "recruiter"
}

// Response 201
{
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Jane Doe", "role": "recruiter" }
}
```

---

### 💼 Job Routes

| Method | Endpoint        | Auth     | Description               |
|--------|-----------------|----------|---------------------------|
| GET    | `/jobs`         | None     | List all jobs             |
| GET    | `/jobs/mine`    | Required | List recruiter's own jobs |
| GET    | `/jobs/:jobId`  | None     | Get a single job          |
| POST   | `/jobs`         | Required | Create a new job          |

**POST `/jobs`**
```json
{
  "title": "Senior Full Stack Engineer",
  "description": "We are looking for...",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB"],
  "experienceYears": 3,
  "educationLevel": "Bachelor's",
  "jobType": "full-time",
  "location": "Remote",
  "certifications": ["AWS Certified"],
  "projectKeywords": ["API", "microservices"]
}
```

---

### 👤 Application Routes

| Method | Endpoint                   | Auth     | Description                          |
|--------|----------------------------|----------|--------------------------------------|
| GET    | `/applications/me`         | Required | Get current applicant's applications |
| GET    | `/applications/job/:jobId` | Required | List all applications for a job      |
| PUT    | `/applications/profile`    | Required | Update applicant talent profile      |
| POST   | `/applications`            | Required | Submit application + optional CV     |

**POST `/applications`** — `multipart/form-data`
```
jobId          string   (required)
profileData    string   (JSON — follows Talent Profile Schema)
cv             file     (optional — PDF or CSV)
```

---

### 🤖 AI Screening Routes

| Method | Endpoint               | Auth     | Description                        |
|--------|------------------------|----------|------------------------------------|
| POST   | `/ai/analyze`          | Required | Trigger Gemini screening for a job |
| GET    | `/ai/results/:jobId`   | Required | Get ranked shortlist + reasoning   |

**POST `/ai/analyze`**
```json
{ "jobId": "abc123" }
```

**GET `/ai/results/:jobId`** — Example Response
```json
{
  "jobId": "abc123",
  "jobTitle": "Senior Full Stack Engineer",
  "totalApplicants": 24,
  "shortlist": [
    {
      "rank": 1,
      "candidateId": "xyz789",
      "name": "Jane Doe",
      "matchScore": 91,
      "componentScores": {
        "skills": 38,
        "experience": 23,
        "projects": 14,
        "education": 9,
        "certifications": 4,
        "availability": 5
      },
      "matchedSkills": ["Node.js", "TypeScript", "MongoDB"],
      "missingSkills": ["AWS"],
      "strengths": [
        "5 years of relevant full-stack experience",
        "Strong TypeScript background matching role requirements"
      ],
      "gaps": ["No AWS certification — required by job posting"],
      "recommendation": "Strongly recommend for interview",
      "comparisonInsight": "Outperforms 92% of the pool on technical skills",
      "fairnessNote": "Analysis based solely on job-relevant qualifications"
    }
  ],
  "poolInsights": {
    "topSkillsInPool": ["JavaScript", "React", "Node.js"],
    "averageMatchScore": 63,
    "skillGapDistribution": { "AWS": 18, "TypeScript": 7 }
  },
  "generatedAt": "2026-04-24T10:30:00Z"
}
```

---

## 🐳 Docker Setup

### Run the Full Stack with Docker Compose

```bash
# 1. Copy the Docker env template
cp .env.docker.example .env.docker

# 2. Fill in your real credentials
#    Required: GEMINI_API_KEY, JWT_SECRET, MONGODB_URI

# 3. Build and start all services
docker compose up --build -d

# 4. Access the app
#    Frontend: http://localhost:3000
#    Backend:  http://localhost:5000
#    MongoDB:  mongodb://localhost:27017/umuravaai
```

### Docker Services

| Service   | Technology                    | Port  | Description            |
|-----------|-------------------------------|-------|------------------------|
| frontend  | Next.js standalone            | 3000  | Recruiter dashboard UI |
| backend   | Node.js multi-stage build     | 5000  | Express REST API       |
| mongo     | mongo:7                       | 27017 | Local MongoDB instance |

### Docker Volumes

| Volume            | Purpose                      |
|-------------------|------------------------------|
| `backend_uploads` | Uploaded CV/resume files     |
| `mongo_data`      | Persistent MongoDB data      |

> **Note:** Backend accepts both `MONGO_URI` and `MONGODB_URI`.

---

## 🚢 Deployment

### Frontend — Vercel

Configured via `frontend/vercel.json`.

```bash
cd frontend
npx vercel --prod
```

### Backend — Render

Configured via `backend/render.yaml`.

```yaml
services:
  - type: web
    name: umuravaai-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

### Database — MongoDB Atlas

1. Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist your deployment IP
3. Set `MONGODB_URI` in your environment variables

### File Storage — Cloudinary *(Planned)*

Uploaded files currently stored in `backend/uploads/`. Migration to Cloudinary planned for production scalability.

---

## 🧪 Testing

### Recommended Demo Flow

1. Register as a **Recruiter** → create a job with required skills
2. Register as an **Applicant** → complete the structured talent profile
3. Apply to the job → optionally upload a PDF CV
4. Switch to the **Recruiter Dashboard** → click **Run AI Screening**
5. View ranked shortlist with score bars, skill gaps, fairness notes, and the comparison panel

### Build Verification

```bash
# Backend
cd backend
npm run lint
npm run build

# Frontend
cd frontend
npm run build
```

---

## ⚠️ Assumptions & Limitations

| Area               | Detail                                                                                               |
|--------------------|------------------------------------------------------------------------------------------------------|
| PDF Parsing        | Heuristic text extraction. Works best with readable text-layer PDFs; scanned image PDFs may fail.    |
| CSV Support        | Available for structured imports, though the primary CV path is PDF upload.                          |
| Gemini Token Limit | Very large candidate pools (100+) may require batching across multiple Gemini requests.              |
| Fairness Layer     | Constrains AI to job-relevant evidence only. This is not a formal bias audit.                        |
| File Storage       | Uploads stored in `backend/uploads/`. Production should use Cloudinary or S3.                       |
| Auth Scope         | JWT auth for recruiter and applicant sessions. No admin panel in this prototype.                     |
| Dummy Data         | All test profiles follow the official Umurava Talent Profile Schema. No real PII was used.           |

---

## 🤝 Contributing

This project was built for the Umurava AI Hackathon. Post-hackathon contributions are welcome:

```bash
# 1. Fork the repository on GitHub

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit with a clear message
git commit -m "feat: describe what you added"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

**Code standards:** TypeScript strict mode, Zod validation on all inputs, proper error handling on all routes.

---

## 👥 Team

| Role                      | Responsibilities                                               |
|---------------------------|----------------------------------------------------------------|
| **Back-End Engineer**     | API design, MongoDB modeling, AI orchestration, file parsing   |
| **Front-End Engineer**    | Recruiter dashboard, shortlist UI, application flow, upload UX |
| **AI Software Engineer**  | Gemini prompt engineering, scoring engine, explainability      |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 📚 Supporting Docs

- [Architecture Notes](./docs/architecture.md)
- [AI Screening Flow](./docs/ai-screening-flow.md)

---

<div align="center">

Built with ❤️ for the **Umurava AI Hackathon 2026**

⭐ If you found this useful, give the repo a star!

</div>