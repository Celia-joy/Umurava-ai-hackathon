"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { FieldGroup, TextInput } from "@/components/forms";
import { TalentProfileEditor } from "@/components/talent-profile-editor";
import { Card, SectionHeading } from "@/components/ui";
import { applyToJob } from "@/features/applications/applicationsSlice";
import { createBlankProfile, normalizeProfileForSubmit } from "@/lib/talentProfile";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ApplyPage() {
  const params = useParams<{ jobId: string }>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.applications);
  const authUser = useAppSelector((state) => state.auth.user);
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState(authUser?.profile || createBlankProfile());
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await dispatch(applyToJob({
      jobId: params.jobId,
      file,
      talentProfile: normalizeProfileForSubmit({
        ...profile,
        basicInfo: {
          ...profile.basicInfo,
          email: profile.basicInfo.email || authUser?.email || ""
        }
      })
    }));

    if (applyToJob.fulfilled.match(result)) {
      setSuccess("Application submitted successfully.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Card className="hero-glow anim-fade-up p-6 md:p-8">
        <SectionHeading
          eyebrow="Application Intake"
          title="Submit your profile and resume"
          subtitle="Use structured talent fields to give recruiters and AI a clearer picture of your experience, not just keywords."
        />
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup title="CV Upload" subtitle="PDF parsing is supported. Structured profile details below improve matching quality.">
            <TextInput type="file" accept=".pdf,.csv,text/csv,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <p className="text-xs text-slate-500">Supported formats: PDF and CSV. You can still apply with structured profile data only.</p>
          </FieldGroup>

          <TalentProfileEditor profile={profile} setProfile={setProfile} compact />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </Card>
    </div>
  );
}
