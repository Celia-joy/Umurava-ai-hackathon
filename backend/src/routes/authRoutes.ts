import { Router } from "express";
import { login, register, updateProfile } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.put("/profile", protect(), asyncHandler(updateProfile));

export default router;
