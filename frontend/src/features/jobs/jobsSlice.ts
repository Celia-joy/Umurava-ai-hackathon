"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import { Job } from "@/lib/types";

interface JobsState {
  items: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  items: [],
  loading: false,
  error: null
};

export const fetchJobs = createAsyncThunk("jobs/fetchAll", async () => apiFetch<Job[]>("/jobs"));

export const fetchRecruiterJobs = createAsyncThunk("jobs/fetchMine", async () => apiFetch<Job[]>("/jobs/mine"));

export const createJob = createAsyncThunk("jobs/create", async (payload: Omit<Job, "_id" | "createdAt">) =>
  apiFetch<Job>("/jobs", {
    method: "POST",
    body: JSON.stringify(payload)
  })
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecruiterJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(createJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRecruiterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addMatcher(
        (action): action is { type: string; error?: { message?: string } } =>
          action.type.startsWith("jobs/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "Job request failed";
        }
      );
  }
});

export default jobsSlice.reducer;
