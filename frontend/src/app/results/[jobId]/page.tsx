"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, SectionHeading } from "@/components/ui";
import { fetchResults } from "@/features/ai/aiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ResultsPage() {
  const params = useParams<{ jobId: string }>();
  const dispatch = useAppDispatch();
  const { result, loading, error } = useAppSelector((state) => state.ai);

  useEffect(() => {
    dispatch(fetchResults(params.jobId));
  }, [dispatch, params.jobId]);

  return (
    <div>
      <SectionHeading
        title="AI Shortlist Results"
        subtitle="Compare ranked candidates, understand the reasoning, and see where each applicant stands."
      />
      {loading && <p className="mb-4 text-sm text-slate-500">Loading shortlist...</p>}
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div className="grid gap-5">
        {result?.rankedCandidates.map((candidate) => (
          <Card key={candidate.applicationId} className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    Rank #{candidate.rank}
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900">{candidate.name}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-600">{candidate.recommendation}</p>
              </div>
              <div className="rounded-3xl bg-brand-50 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-700">AI Score</p>
                <p className="text-3xl font-semibold text-brand-800">{candidate.score}</p>
                <p className="mt-1 text-xs text-slate-500">Weighted baseline {candidate.weightedScore}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Top Skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.topSkills.map((skill, index) => (
                    <span key={`${candidate.applicationId}-${skill}-${index}`} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Strengths</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {candidate.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Gaps & Suggestions</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {[...candidate.gaps, ...candidate.skillGapSuggestions].slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-950 px-5 py-4 text-sm text-slate-100">
              Why Candidate A &gt; Candidate B: {candidate.whyBetterThanNext}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
