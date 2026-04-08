import { Router } from "express";
import { createJob, getJobById, getJobs, getRecruiterJobs } from "../controllers/jobController";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getJobs));
router.get("/mine", protect(["recruiter"]), asyncHandler(getRecruiterJobs));
router.get("/:jobId", asyncHandler(getJobById));
router.post("/", protect(["recruiter"]), asyncHandler(createJob));

export default router;
