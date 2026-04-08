"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { TextArea, TextInput } from "@/components/forms";
import { Card, SectionHeading } from "@/components/ui";
import { analyzeCandidates } from "@/features/ai/aiSlice";
import { fetchApplicantsForJob } from "@/features/applications/applicationsSlice";
import { createJob, fetchRecruiterJobs } from "@/features/jobs/jobsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function RecruiterDashboard() {
  const dispatch = useAppDispatch();
  const { items: jobs } = useAppSelector((state) => state.jobs);
  const { applicants } = useAppSelector((state) => state.applications);
  const aiState = useAppSelector((state) => state.ai);
  const [selectedJobId, setSelectedJobId] = useState("");

  useEffect(() => {
    dispatch(fetchRecruiterJobs());
  }, [dispatch]);

  useEffect(() => {
    if (selectedJobId) {
      dispatch(fetchApplicantsForJob(selectedJobId));
    }
  }, [dispatch, selectedJobId]);

  const submitJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      requiredSkills: String(formData.get("requiredSkills")).split(",").map((value) => value.trim()).filter(Boolean),
      experienceLevel: String(formData.get("experienceLevel")),
      education: String(formData.get("education")),
      eligibility: String(formData.get("eligibility")),
      jobType: String(formData.get("jobType"))
    };

    const result = await dispatch(createJob(payload));
    if (createJob.fulfilled.match(result)) {
      form.reset();
    }
  };

  const runAnalysis = async () => {
    if (!selectedJobId) {
      return;
    }

    await dispatch(analyzeCandidates({ jobId: selectedJobId, topCount: 10 }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-8">
        <SectionHeading title="Create Job" subtitle="Define hiring criteria that feed both recruiter review and Gemini-based screening." />
        <form onSubmit={submitJob} className="grid gap-4">
          <TextInput name="title" placeholder="Job title" required />
          <TextArea name="description" placeholder="Role description" required />
          <TextInput name="requiredSkills" placeholder="Required skills separated by commas" required />
          <TextInput name="experienceLevel" placeholder="Experience level" required />
          <TextInput name="education" placeholder="Education requirement" required />
          <TextInput name="eligibility" placeholder="Eligibility criteria" required />
          <TextInput name="jobType" placeholder="Job type e.g. Remote, Full-time" required />
          <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white">Publish Job</button>
        </form>
      </Card>

      <Card className="p-8">
        <SectionHeading title="Applicants & AI Screening" subtitle="Select a job, review applicants, and trigger a one-request shortlist analysis." />
        <select
          className="mb-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          value={selectedJobId}
          onChange={(event) => setSelectedJobId(event.target.value)}
        >
          <option value="">Select a job</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>
        <div className="space-y-3">
          {applicants.map((application) => (
            <div key={application._id} className="rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800">{application.applicant?.profile?.name || application.applicant?.email}</p>
                  <p className="text-sm text-slate-500">{application.applicant?.profile?.education}</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {application.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white" onClick={runAnalysis}>
            {aiState.loading ? "Analyzing..." : "Analyze Candidates"}
          </button>
          {selectedJobId && (
            <Link href={`/results/${selectedJobId}`} className="text-sm font-semibold text-brand-700">
              View results
            </Link>
          )}
        </div>
        {aiState.error && <p className="mt-4 text-sm text-red-500">{aiState.error}</p>}
      </Card>
    </div>
  );
}
