import { Router } from "express";
import { createJob, getJobById, getJobs, getRecruiterJobs } from "../controllers/jobController";
import { protect } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { createJobSchema } from "../validation/schemas";

const router = Router();

router.get("/", asyncHandler(getJobs));
router.get("/mine", protect(["recruiter"]), asyncHandler(getRecruiterJobs));
router.get("/:jobId", asyncHandler(getJobById));
router.post("/", protect(["recruiter"]), validateBody(createJobSchema), asyncHandler(createJob));

export default router;
