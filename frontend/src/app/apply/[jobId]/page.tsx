"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { TextInput } from "@/components/forms";
import { Card, SectionHeading } from "@/components/ui";
import { applyToJob } from "@/features/applications/applicationsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ApplyPage() {
  const params = useParams<{ jobId: string }>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.applications);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      return;
    }

    const result = await dispatch(applyToJob({ jobId: params.jobId, file }));
    if (applyToJob.fulfilled.match(result)) {
      setSuccess("Application submitted successfully.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8">
        <SectionHeading title="Application Form" subtitle="Upload a PDF CV and send your profile into the recruiter screening pipeline." />
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </Card>
    </div>
  );
}
