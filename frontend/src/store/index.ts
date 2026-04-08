"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import jobsReducer from "@/features/jobs/jobsSlice";
import applicationsReducer from "@/features/applications/applicationsSlice";
import aiReducer from "@/features/ai/aiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
    ai: aiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
