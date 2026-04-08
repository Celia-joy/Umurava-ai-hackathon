import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  geminiApiKey: process.env.GEMINI_API_KEY || ""
};

if (!env.mongoUri || !env.jwtSecret || !env.geminiApiKey) {
  console.warn("One or more environment variables are missing. Check GEMINI_API_KEY, MONGODB_URI, and JWT_SECRET.");
}
