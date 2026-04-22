import { PropsWithChildren } from "react";
import clsx from "clsx";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx("glass-card rounded-[22px] p-0 transition duration-200 hover:-translate-y-0.5", className)}>{children}</div>;
}

export function SectionHeading({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow?: string }) {
  return (
    <div className="mb-6 anim-fade-up">
      {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-700">{eyebrow}</p>}
      <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">{subtitle}</p>
    </div>
  );
}

export function ScoreBar({ value, label, tone = "brand" }: { value: number; label?: string; tone?: "brand" | "success" | "warning" | "neutral" }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const barClassName = {
    brand: "from-brand-300 via-brand-400 to-brand-600",
    success: "from-emerald-300 via-emerald-400 to-emerald-600",
    warning: "from-sky-200 via-blue-400 to-indigo-500",
    neutral: "from-slate-300 via-slate-400 to-slate-500"
  }[tone];

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
          <span>{label}</span>
          <span>{safeValue}%</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={clsx("h-full rounded-full bg-gradient-to-r transition-all duration-500", barClassName)} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function MetricCard({ label, value, caption }: { label: string; value: string | number; caption?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {caption && <p className="mt-2 text-sm text-slate-500">{caption}</p>}
    </Card>
  );
}

export function Pill({ children, tone = "brand" }: PropsWithChildren<{ tone?: "brand" | "success" | "danger" | "neutral" }>) {
  const className = {
    brand: "bg-brand-100 text-brand-800",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700"
  }[tone];

  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", className)}>{children}</span>;
}
