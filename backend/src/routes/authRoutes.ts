import { Router } from "express";
import { login, register, updateProfile } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, registerSchema, updateProfileSchema } from "../validation/schemas";

const router = Router();

router.post("/register", validateBody(registerSchema), asyncHandler(register));
router.post("/login", validateBody(loginSchema), asyncHandler(login));
router.put("/profile", protect(), validateBody(updateProfileSchema), asyncHandler(updateProfile));

export default router;
