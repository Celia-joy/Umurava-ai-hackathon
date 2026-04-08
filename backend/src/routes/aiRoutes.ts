import { Router } from "express";
import { analyzeCandidates, getScreeningResult } from "../controllers/aiController";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/analyze", protect(["recruiter"]), asyncHandler(analyzeCandidates));
router.get("/results/:jobId", protect(["recruiter"]), asyncHandler(getScreeningResult));

export default router;
