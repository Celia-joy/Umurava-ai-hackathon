"use client";

import { FormEvent, useEffect, useState } from "react";
import { TalentProfileEditor } from "@/components/talent-profile-editor";
import { Card, Pill, SectionHeading } from "@/components/ui";
import { fetchApplicantApplications, updateApplicantProfile } from "@/features/applications/applicationsSlice";
import { createBlankProfile, normalizeProfileForSubmit } from "@/lib/talentProfile";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ApplicantDashboard() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.applications);
  const authUser = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(authUser?.profile || createBlankProfile());

  useEffect(() => {
    dispatch(fetchApplicantApplications());
  }, [dispatch]);

  useEffect(() => {
    if (authUser?.profile) {
      setProfile(authUser.profile);
    }
  }, [authUser]);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(updateApplicantProfile(normalizeProfileForSubmit({
      ...profile,
      basicInfo: {
        ...profile.basicInfo,
        email: profile.basicInfo.email || authUser?.email || ""
      }
    })));
  };

  const getJobDetails = (application: (typeof items)[number]) => {
    if (application.job && typeof application.job === "object") {
      return {
        title: application.job.title,
        jobType: application.job.jobType
      };
    }

    return {
      title: "Job unavailable",
      jobType: "This listing may have been removed"
    };
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="p-8">
        <SectionHeading
          eyebrow="Applicant Workspace"
          title="Official Talent Profile"
          subtitle="Keep your structured profile current so the recruiter AI can score your fit fairly across skills, projects, education, and availability."
        />
        <form onSubmit={submitProfile} className="grid gap-5">
          <TalentProfileEditor profile={profile} setProfile={setProfile} />
          <div className="flex items-center justify-between gap-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white" disabled={loading}>
              Save Talent Profile
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-8">
        <SectionHeading
          eyebrow="Application Tracking"
          title="My Applications"
          subtitle="Track your submissions and see how your structured profile translated into ranking-ready signals."
        />
        <div className="space-y-4">
          {items.map((application) => {
            const jobDetails = getJobDetails(application);
            const skillPreview = application.normalizedProfile.skills.slice(0, 6);

            return (
              <div key={application._id} className="rounded-[28px] border border-sky-100 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{jobDetails.title}</p>
                    <p className="text-sm text-slate-500">{jobDetails.jobType}</p>
                    {application.normalizedProfile.basicInfo.headline && (
                      <p className="mt-2 text-sm text-slate-600">{application.normalizedProfile.basicInfo.headline}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Pill tone={application.status === "shortlisted" ? "success" : "brand"}>{application.status}</Pill>
                    {application.aiBreakdown && (
                      <p className="mt-2 text-xs text-slate-500">
                        Weighted score: {application.aiBreakdown.weightedScore}
                      </p>
                    )}
                  </div>
                </div>
                {!!skillPreview.length && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skillPreview.map((skill) => (
                      <Pill key={`${application._id}-${skill.name}`}>{skill.name}</Pill>
                    ))}
                  </div>
                )}
                {application.extractedData && (
                  <p className="mt-4 text-xs text-slate-400">
                    CV parsed with {application.extractedData.parserVersion} at {application.extractedData.parseConfidence}% confidence.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
