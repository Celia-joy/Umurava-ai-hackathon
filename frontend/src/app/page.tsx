import Link from "next/link";
import { Card, SectionHeading } from "@/components/ui";

const recruiterFeatures = [
  "Post structured jobs with eligibility, education, and experience requirements",
  "Review applicants, trigger one-shot Gemini analysis, and see ranked shortlists",
  "Get explainable decisions with strengths, gaps, and candidate comparisons"
];

const applicantFeatures = [
  "Create a detailed talent profile with skills, experience, and education",
  "Upload a PDF CV and apply to opportunities from a central jobs board",
  "Understand skill gaps and how your profile maps to recruiter expectations"
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden bg-hero p-10">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              AI Recruitment Screening
            </span>
            <h1 className="text-5xl font-semibold leading-tight text-slate-900">
              Screen every applicant in one Gemini-powered pass.
            </h1>
            <p className="text-lg text-slate-600">
              Built for fast-moving hiring teams that want consistent ranking, explainable AI decisions, and clean collaboration between recruiters and talent.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth" className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white">
                Get Started
              </Link>
              <Link href="/jobs" className="rounded-full border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700">
                Explore Jobs
              </Link>
            </div>
          </div>
        </Card>
        <Card className="p-8">
          <SectionHeading
            title="AI Decision Flow"
            subtitle="Weighted scoring anchors every review before Gemini compares candidates against one another."
          />
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-2xl bg-brand-50 p-4">Skills 40%</div>
            <div className="rounded-2xl bg-brand-50 p-4">Experience 30%</div>
            <div className="rounded-2xl bg-brand-50 p-4">Education 20%</div>
            <div className="rounded-2xl bg-brand-50 p-4">Relevance 10%</div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="p-8">
          <SectionHeading title="For Recruiters" subtitle="A structured dashboard for job creation, review, and explainable shortlisting." />
          <div className="space-y-3 text-sm text-slate-700">
            {recruiterFeatures.map((feature) => (
              <p key={feature} className="rounded-2xl bg-white px-4 py-3">
                {feature}
              </p>
            ))}
          </div>
        </Card>
        <Card className="p-8">
          <SectionHeading title="For Applicants" subtitle="A polished application journey with profile-driven hiring signals." />
          <div className="space-y-3 text-sm text-slate-700">
            {applicantFeatures.map((feature) => (
              <p key={feature} className="rounded-2xl bg-white px-4 py-3">
                {feature}
              </p>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
