"use client";

import { FormEvent, useEffect } from "react";
import { TextInput } from "@/components/forms";
import { Card, SectionHeading } from "@/components/ui";
import { fetchApplicantApplications, updateApplicantProfile } from "@/features/applications/applicationsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ApplicantDashboard() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchApplicantApplications());
  }, [dispatch]);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await dispatch(
      updateApplicantProfile({
        name: String(formData.get("name")),
        skills: String(formData.get("skills")).split(",").map((value) => value.trim()).filter(Boolean),
        experience: String(formData.get("experience")),
        education: String(formData.get("education"))
      })
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-8">
        <SectionHeading title="Talent Profile" subtitle="Keep your experience, skills, and education current before you apply." />
        <form onSubmit={submitProfile} className="grid gap-4">
          <TextInput name="name" placeholder="Full name" required />
          <TextInput name="skills" placeholder="Skills separated by commas" />
          <TextInput name="experience" placeholder="Experience summary" />
          <TextInput name="education" placeholder="Education background" />
          <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white" disabled={loading}>
            Save Profile
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </Card>

      <Card className="p-8">
        <SectionHeading title="My Applications" subtitle="Track the status of submitted jobs and see whether you have been shortlisted." />
        <div className="space-y-3">
          {items.map((application) => (
            <div key={application._id} className="rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{application.job.title}</p>
                  <p className="text-sm text-slate-500">{application.job.jobType}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {application.status}
                  </span>
                  {application.aiBreakdown && (
                    <p className="mt-2 text-xs text-slate-500">
                      Weighted score: {application.aiBreakdown.weightedScore}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
