import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "",
  // for email service
  EMAIL_HOST: process.env.EMAIL_HOST || process.env.EMAIL_SERVICE || "",
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "",
  EMAIL_PORT: process.env.EMAIL_PORT || "",
  EMAIL_SECURE: process.env.EMAIL_SECURE,
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER || "",
};

if (!env.mongoUri || !env.jwtSecret || !env.geminiApiKey) {
  console.warn("One or more environment variables are missing. Check GEMINI_API_KEY, MONGODB_URI, and JWT_SECRET.");
}
