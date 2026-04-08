"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import { Application, User } from "@/lib/types";

interface ApplicationsState {
  items: Application[];
  applicants: Application[];
  profile: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  items: [],
  applicants: [],
  profile: null,
  loading: false,
  error: null
};

export const fetchApplicantApplications = createAsyncThunk("applications/fetchMine", async () =>
  apiFetch<Application[]>("/applications/me")
);

export const fetchApplicantsForJob = createAsyncThunk("applications/fetchForJob", async (jobId: string) =>
  apiFetch<Application[]>(`/applications/job/${jobId}`)
);

export const updateApplicantProfile = createAsyncThunk(
  "applications/updateProfile",
  async (payload: { name: string; skills: string[]; experience: string; education: string }) =>
    apiFetch<User>("/applications/profile", {
      method: "PUT",
      body: JSON.stringify(payload)
    })
);

export const applyToJob = createAsyncThunk(
  "applications/apply",
  async (payload: { jobId: string; file: File }) => {
    const formData = new FormData();
    formData.append("jobId", payload.jobId);
    formData.append("cv", payload.file);
    return apiFetch<Application>("/applications", {
      method: "POST",
      body: formData
    });
  }
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicantApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchApplicantsForJob.fulfilled, (state, action) => {
        state.loading = false;
        state.applicants = action.payload;
      })
      .addCase(updateApplicantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith("applications/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is { type: string; error?: { message?: string } } =>
          action.type.startsWith("applications/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "Application request failed";
        }
      );
  }
});

export default applicationsSlice.reducer;
