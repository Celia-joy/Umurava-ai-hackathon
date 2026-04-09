import { Router } from "express";
import {
  applyToJob,
  getApplicantApplications,
  getApplicationsForJob,
  updateApplicantProfile
} from "../controllers/applicationController";
import { protect } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import { upload } from "../middleware/uploadMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { applicantProfileSchema } from "../validation/schemas";

const router = Router();

router.get("/me", protect(["applicant"]), asyncHandler(getApplicantApplications));
router.get("/job/:jobId", protect(["recruiter"]), asyncHandler(getApplicationsForJob));
router.put("/profile", protect(["applicant"]), validateBody(applicantProfileSchema), asyncHandler(updateApplicantProfile));
router.post("/", protect(["applicant"]), upload.single("cv"), asyncHandler(applyToJob));

export default router;
