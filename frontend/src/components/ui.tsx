import { PropsWithChildren } from "react";
import clsx from "clsx";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx("glass-card rounded-3xl shadow-panel", className)}>{children}</div>;
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}
