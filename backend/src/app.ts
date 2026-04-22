import cors from "cors";
import express from "express";
import path from "path";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware";
import aiRoutes from "./routes/aiRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import rateLimit from "express-rate-limit";
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

app.use(
  cors({
    origin: env.corsOrigin ? env.corsOrigin.split(",").map((item) => item.trim()) : true,
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/ai", aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
