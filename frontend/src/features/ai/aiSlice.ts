"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import { ScreeningResult } from "@/lib/types";

interface AiState {
  result: ScreeningResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: AiState = {
  result: null,
  loading: false,
  error: null
};

export const analyzeCandidates = createAsyncThunk(
  "ai/analyze",
  async (payload: { jobId: string; topCount: number }) =>
    apiFetch<ScreeningResult>("/ai/analyze", {
      method: "POST",
      body: JSON.stringify(payload)
    })
);

export const fetchResults = createAsyncThunk("ai/results", async (jobId: string) =>
  apiFetch<ScreeningResult>(`/ai/results/${jobId}`)
);

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(analyzeCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith("ai/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is { type: string; error?: { message?: string } } =>
          action.type.startsWith("ai/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "AI request failed";
        }
      );
  }
});

export default aiSlice.reducer;
