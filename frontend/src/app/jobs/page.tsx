"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card, SectionHeading } from "@/components/ui";
import { fetchJobs } from "@/features/jobs/jobsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  return (
    <div>
      <SectionHeading title="Open Roles" subtitle="Applicants can browse opportunities and move directly into the application flow." />
      {loading && <p className="mb-4 text-sm text-slate-500">Loading jobs...</p>}
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((job) => (
          <Card key={job._id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{job.description}</p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {job.jobType}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <span key={`${job._id}-${skill}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
            <Link href={`/apply/${job._id}`} className="mt-6 inline-flex rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
              Apply Now
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
