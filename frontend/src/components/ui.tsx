import { PropsWithChildren } from "react";
import clsx from "clsx";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx("glass-card rounded-[32px] border border-sky-100 shadow-panel", className)}>{children}</div>;
}

export function SectionHeading({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{eyebrow}</p>}
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}

export function ScoreBar({ value, label, tone = "brand" }: { value: number; label?: string; tone?: "brand" | "success" | "warning" | "neutral" }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const barClassName = {
    brand: "from-sky-400 via-cyan-500 to-blue-600",
    success: "from-emerald-400 via-teal-500 to-cyan-500",
    warning: "from-amber-300 via-orange-400 to-rose-500",
    neutral: "from-slate-300 via-slate-400 to-slate-500"
  }[tone];

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <span>{label}</span>
          <span>{safeValue}%</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={clsx("h-full rounded-full bg-gradient-to-r", barClassName)} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function MetricCard({ label, value, caption }: { label: string; value: string | number; caption?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {caption && <p className="mt-2 text-sm text-slate-500">{caption}</p>}
    </Card>
  );
}

export function Pill({ children, tone = "brand" }: PropsWithChildren<{ tone?: "brand" | "success" | "danger" | "neutral" }>) {
  const className = {
    brand: "bg-sky-100 text-sky-800",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700"
  }[tone];

  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", className)}>{children}</span>;
}
