"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card, Pill, SectionHeading } from "@/components/ui";
import { fetchJobs } from "@/features/jobs/jobsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  return (
    <div>
      <SectionHeading
        eyebrow="Open Roles"
        title="Find your next role with transparent hiring criteria"
        subtitle="Every role below is structured for fair AI ranking, making requirements and skill priorities clearer for applicants."
      />
      {loading && <p className="mb-4 text-sm text-slate-500">Loading jobs...</p>}
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((job, index) => (
          <Card key={job._id} className={`p-6 anim-fade-up ${index % 2 === 0 ? "anim-delay-1" : "anim-delay-2"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{job.description}</p>
              </div>
              <Pill>{job.jobType}</Pill>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, skillIndex) => (
                <Pill key={`${job._id}-${skill}-${skillIndex}`}>{skill}</Pill>
              ))}
            </div>
            {!!job.projectKeywords.length && (
              <p className="mt-4 text-sm text-slate-500">Project focus: {job.projectKeywords.join(", ")}</p>
            )}
            <Link href={`/apply/${job._id}`} className="mt-6 inline-flex rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
              Apply Now
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
