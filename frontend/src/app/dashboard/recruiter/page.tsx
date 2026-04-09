"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { TextArea, TextInput } from "@/components/forms";
import { Card, Pill, ScoreBar, SectionHeading } from "@/components/ui";
import { analyzeCandidates } from "@/features/ai/aiSlice";
import { fetchApplicantsForJob } from "@/features/applications/applicationsSlice";
import { createJob, fetchRecruiterJobs } from "@/features/jobs/jobsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const splitCsv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

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

  const selectedJob = useMemo(() => jobs.find((job) => job._id === selectedJobId), [jobs, selectedJobId]);

  const submitJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      requiredSkills: splitCsv(String(formData.get("requiredSkills"))),
      preferredCertifications: splitCsv(String(formData.get("preferredCertifications"))),
      projectKeywords: splitCsv(String(formData.get("projectKeywords"))),
      availabilityRequirement: String(formData.get("availabilityRequirement")),
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
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="p-8">
        <SectionHeading
          eyebrow="Recruiter Setup"
          title="Create a job with ranking-ready criteria"
          subtitle="The deterministic scoring engine uses skills, experience, projects, education, certifications, and availability before Gemini adds explainable reasoning."
        />
        <form onSubmit={submitJob} className="grid gap-4">
          <TextInput name="title" placeholder="Job title" required />
          <TextArea name="description" placeholder="Role description" required />
          <TextInput name="requiredSkills" placeholder="Required skills separated by commas" required />
          <TextInput name="projectKeywords" placeholder="Project keywords separated by commas" />
          <TextInput name="preferredCertifications" placeholder="Preferred certifications separated by commas" />
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput name="experienceLevel" placeholder="Experience level e.g. 3+ years" required />
            <TextInput name="availabilityRequirement" placeholder="Availability requirement e.g. Immediate or within 2 weeks" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <TextInput name="education" placeholder="Education requirement" required />
            <TextInput name="eligibility" placeholder="Eligibility criteria" required />
            <TextInput name="jobType" placeholder="Job type e.g. Remote, Full-time" required />
          </div>
          <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white">Publish Job</button>
        </form>
      </Card>

      <Card className="p-8">
        <SectionHeading
          eyebrow="AI Screening"
          title="Applicants, structured profiles, and analysis"
          subtitle="Select a job, inspect incoming candidate data, and launch multi-candidate evaluation through the weighted scoring plus Gemini reasoning pipeline."
        />
        <select
          className="mb-4 w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm"
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

        {selectedJob && (
          <div className="mb-5 rounded-[28px] border border-sky-100 bg-sky-50/70 p-5">
            <p className="text-lg font-semibold text-slate-900">{selectedJob.title}</p>
            <p className="mt-2 text-sm text-slate-600">{selectedJob.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedJob.requiredSkills.map((skill, index) => <Pill key={`selected-job-skill-${index}-${skill}`}>{skill}</Pill>)}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {applicants.map((application) => {
            const profile = application.normalizedProfile;
            const name = `${profile.basicInfo.firstName} ${profile.basicInfo.lastName}`.trim() || application.applicant?.email;
            const matchedSkills = profile.skills.slice(0, 5);

            return (
              <div key={application._id} className="rounded-[28px] border border-sky-100 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{name}</p>
                    <p className="text-sm text-slate-500">{profile.basicInfo.headline || profile.basicInfo.location}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {matchedSkills.map((skill) => (
                        <Pill key={`${application._id}-${skill.name}`}>{skill.name}</Pill>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-28 text-right">
                    <Pill tone={application.status === "shortlisted" ? "success" : "brand"}>
                      {application.status}
                    </Pill>
                    {application.aiBreakdown && (
                      <div className="mt-3">
                        <ScoreBar value={application.aiBreakdown.weightedScore} label="Weighted fit" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-sky-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Projects</p>
                    <p className="mt-1">{profile.projects.length} structured project entries</p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Availability</p>
                    <p className="mt-1">{profile.availability.status || "Not specified"}</p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">CV Parse</p>
                    <p className="mt-1">{application.extractedData?.parseConfidence ?? 0}% confidence</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white" onClick={runAnalysis}>
            {aiState.loading ? "Analyzing candidates..." : "Analyze Candidates"}
          </button>
          {selectedJobId && (
            <Link href={`/results/${selectedJobId}`} className="text-sm font-semibold text-brand-700">
              View results dashboard
            </Link>
          )}
        </div>
        {aiState.loading && (
          <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm text-sky-800">
            Gemini is comparing all applicants, validating the weighted baseline, and generating explainable shortlist reasoning.
          </div>
        )}
        {aiState.error && <p className="mt-4 text-sm text-red-500">{aiState.error}</p>}
      </Card>
    </div>
  );
}
