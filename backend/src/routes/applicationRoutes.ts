import { Router } from "express";
import {
  applyToJob,
  getApplicantApplications,
  getApplicationsForJob,
  updateApplicantProfile
} from "../controllers/applicationController";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/me", protect(["applicant"]), asyncHandler(getApplicantApplications));
router.get("/job/:jobId", protect(["recruiter"]), asyncHandler(getApplicationsForJob));
router.put("/profile", protect(["applicant"]), asyncHandler(updateApplicantProfile));
router.post("/", protect(["applicant"]), upload.single("cv"), asyncHandler(applyToJob));

export default router;
