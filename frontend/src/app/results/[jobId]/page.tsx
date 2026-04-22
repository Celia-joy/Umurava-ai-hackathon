"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, MetricCard, Pill, ScoreBar, SectionHeading } from "@/components/ui";
import { fetchResults } from "@/features/ai/aiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ResultsPage() {
  const params = useParams<{ jobId: string }>();
  const dispatch = useAppDispatch();
  const { result, loading, error } = useAppSelector((state) => state.ai);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [comparisonPair, setComparisonPair] = useState<[string, string] | null>(null);

  useEffect(() => {
    dispatch(fetchResults(params.jobId));
  }, [dispatch, params.jobId]);

  useEffect(() => {
    if (result?.rankedCandidates.length && !comparisonPair) {
      const [first, second] = result.rankedCandidates;
      if (first && second) {
        setComparisonPair([first.applicationId, second.applicationId]);
      }
    }
  }, [comparisonPair, result]);

  const comparisonCandidates = useMemo(() => {
    if (!result || !comparisonPair) {
      return [];
    }

    return result.rankedCandidates.filter((candidate) => comparisonPair.includes(candidate.applicationId));
  }, [comparisonPair, result]);

  return (
    <div className="grid gap-6">
      <SectionHeading
        eyebrow="Recruiter Insights"
        title="AI shortlist results"
        subtitle="Review ranked candidates, fairness notes, and side-by-side comparisons powered by the hybrid scoring pipeline."
      />
      {loading && <p className="mb-4 text-sm text-slate-500">Loading shortlist and AI reasoning...</p>}
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {result && (
        <>
          <div className="grid gap-4 lg:grid-cols-4">
            <MetricCard label="Applicants" value={result.insights.applicantCount} />
            <MetricCard label="Shortlisted" value={result.insights.shortlistedCount} />
            <MetricCard label="Avg AI Score" value={result.insights.averageScore} />
            <MetricCard label="Avg Baseline" value={result.insights.averageWeightedScore} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="anim-fade-up p-6">
              <SectionHeading
                title="Fairness Layer"
                subtitle={`Model used: ${result.aiModel}. Ranking explanations are anchored to job-related evidence only.`}
              />
              <p className="text-sm text-slate-700">{result.fairnessSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.insights.mostRequestedSkills.map((skill, index) => (
                  <Pill key={`requested-skill-${index}-${skill}`}>{skill}</Pill>
                ))}
              </div>
            </Card>

            <Card className="anim-fade-up anim-delay-1 p-6">
              <SectionHeading
                title="Top Skills Distribution"
                subtitle="See which skills appear most frequently in this applicant pool."
              />
              <div className="space-y-3">
                {result.insights.topSkillsDistribution.map((item) => (
                  <div key={item.skill}>
                    <ScoreBar value={Math.min(100, item.count * 20)} label={`${item.skill} • ${item.count} candidates`} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {comparisonCandidates.length === 2 && (
            <Card className="anim-fade-up anim-delay-1 p-6">
              <SectionHeading
                title="Candidate Comparison Panel"
                subtitle="Explain why one candidate edges another using structured and AI scoring signals."
              />
              <div className="grid gap-4 lg:grid-cols-2">
                {comparisonCandidates.map((candidate) => (
                  <div key={candidate.applicationId} className="rounded-[24px] border border-brand-100 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{candidate.name}</p>
                        <p className="text-sm text-slate-500">{candidate.headline || "No headline provided"}</p>
                      </div>
                      <Pill tone={candidate.rank === 1 ? "success" : "brand"}>Rank #{candidate.rank}</Pill>
                    </div>
                    <div className="mt-4 space-y-3">
                      <ScoreBar value={candidate.score} label="AI score" />
                      <ScoreBar value={candidate.weightedScore} label="Structured baseline" tone="neutral" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {candidate.matchedSkills.map((skill, index) => <Pill key={`${candidate.applicationId}-comparison-match-${index}-${skill}`} tone="success">{skill}</Pill>)}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {candidate.missingSkills.map((skill, index) => <Pill key={`${candidate.applicationId}-comparison-missing-${index}-${skill}`} tone="danger">{skill}</Pill>)}
                    </div>
                    <p className="mt-4 text-sm text-slate-700">{candidate.comparisonInsight}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <div className="grid gap-5">
        {result?.rankedCandidates.map((candidate) => (
          <Card key={candidate.applicationId} className="anim-fade-up p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone="brand">Rank #{candidate.rank}</Pill>
                  <Pill tone={candidate.rank <= result.topCount ? "success" : "neutral"}>
                    {candidate.rank <= result.topCount ? "Shortlisted" : "Reviewed"}
                  </Pill>
                  <h3 className="text-xl font-bold text-slate-900">{candidate.name}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-500">{candidate.headline || "No headline provided"}</p>
                <p className="mt-3 text-sm text-slate-600">{candidate.recommendation}</p>
              </div>
              <div className="rounded-3xl bg-brand-50 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-700">AI Score</p>
                <p className="text-3xl font-bold text-brand-900">{candidate.score}</p>
                <p className="mt-1 text-xs text-slate-500">Weighted baseline {candidate.weightedScore}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Skill Match Analysis</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.matchedSkills.map((skill, index) => (
                    <Pill key={`${candidate.applicationId}-${skill}-${index}`} tone="success">{skill}</Pill>
                  ))}
                </div>
                {!!candidate.missingSkills.length && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Missing</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {candidate.missingSkills.map((skill, index) => (
                        <Pill key={`${candidate.applicationId}-missing-${skill}-${index}`} tone="danger">{skill}</Pill>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Strengths</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {candidate.strengths.map((item, index) => (
                    <li key={`${candidate.applicationId}-strength-${index}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Gaps & Suggestions</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {[...candidate.gaps, ...candidate.skillGapSuggestions].slice(0, 6).map((item, index) => (
                    <li key={`${candidate.applicationId}-gap-${index}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <div className="space-y-4">
                  <ScoreBar value={candidate.componentScores.skillsMatch} label="Skills match" />
                  <ScoreBar value={candidate.componentScores.experience} label="Experience" tone="neutral" />
                  <ScoreBar value={candidate.componentScores.projects} label="Projects" tone="brand" />
                  <ScoreBar value={candidate.componentScores.education} label="Education" tone="neutral" />
                  <ScoreBar value={candidate.componentScores.certifications} label="Certifications" tone="neutral" />
                  <ScoreBar value={candidate.componentScores.availability} label="Availability" tone="neutral" />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-900 px-5 py-4 text-sm text-slate-100">
                Why Candidate A &gt; Candidate B: {candidate.whyBetterThanNext}
              </div>
            </div>

            <div className="mt-5">
              <button
                className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700"
                onClick={() => setExpandedCandidateId((current) => current === candidate.applicationId ? null : candidate.applicationId)}
              >
                {expandedCandidateId === candidate.applicationId ? "Hide AI reasoning" : "Show AI reasoning"}
              </button>
              {expandedCandidateId === candidate.applicationId && (
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl bg-brand-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Why selected</p>
                    <p className="mt-2">{candidate.whySelected}</p>
                  </div>
                  <div className="rounded-2xl bg-rose-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Main concerns</p>
                    <p className="mt-2">{candidate.whyNotSelected}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Fairness note</p>
                    <p className="mt-2">{candidate.fairnessNotes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setComparisonPair((current) => current && current[0] === candidate.applicationId
                  ? current
                  : current
                    ? [current[0], candidate.applicationId]
                    : [candidate.applicationId, candidate.applicationId])}
              >
                Add to comparison
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
