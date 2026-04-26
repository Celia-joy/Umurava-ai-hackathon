import Link from "next/link";
import { Card, SectionHeading } from "@/components/ui";

const challengeHighlights = [
  "Get ranked with transparent, skill-based scoring and portfolio-ready outcomes.",
  "Connect with recruiters and employers using verified evidence of competence."
];

const platformPillars = [
  {
    title: "For Talents",
    description: "Develop practical skills, earn visibility, and turn challenge performance into career opportunities."
  },
  {
    title: "For Businesses",
    description: "Source candidates from validated challenge results and structured capability signals."
  },
  {
    title: "For Recruiters",
    description: "Run explainable shortlist analysis with AI support and fair evidence-based ranking."
  }
];

export default function Home() {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="hero-glow anim-fade-up overflow-hidden bg-hero p-7 md:p-10">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex rounded-md bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-800">
              Build Work Experience
            </span>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
              Unlock your potential with the Umurava AI 
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              Experience AI-assisted hiring insights in one unified platform.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link href="/auth" className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
                Get Started
              </Link>
              <Link href="/jobs" className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Explore Opportunities
              </Link>
            </div>
          </div>
        </Card>

        <Card className="anim-fade-up anim-delay-1 p-7 md:p-8">
          <SectionHeading
            eyebrow="Challenge Outcomes"
            title="How Umurava AI Works"
            subtitle="A production-ready hiring workflow built for measurable outcomes."
          />
          <div className="space-y-3">
            {challengeHighlights.map((item) => (
              <div key={item} className="soft-panel rounded-lg px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {platformPillars.map((pillar, index) => (
          <Card key={pillar.title} className={`anim-fade-up p-6 ${index === 1 ? "anim-delay-1" : index === 2 ? "anim-delay-2" : ""}`}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">{pillar.title}</p>
            <h3 className="mt-3 text-xl font-bold text-slate-900">{pillar.title} Solution</h3>
            <p className="mt-3 text-sm text-slate-600">{pillar.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
