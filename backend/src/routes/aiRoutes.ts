import { Router } from "express";
import { analyzeCandidates, getScreeningResult } from "../controllers/aiController";
import { protect } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { analyzeCandidatesSchema } from "../validation/schemas";

const router = Router();

router.post("/analyze", protect(["recruiter"]), validateBody(analyzeCandidatesSchema), asyncHandler(analyzeCandidates));
router.get("/results/:jobId", protect(["recruiter"]), asyncHandler(getScreeningResult));

export default router;
