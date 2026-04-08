import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("Missing MongoDB connection string");
  }

  await mongoose.connect(env.mongoUri);
};
