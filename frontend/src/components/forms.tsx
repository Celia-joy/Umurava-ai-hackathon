"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const controlBase = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-brand-100 transition placeholder:text-slate-400 focus:border-brand-300 focus:ring";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(controlBase, className)} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx("min-h-28", controlBase, className)} />;
}

export function SelectInput({ className, children, ...props }: PropsWithChildren<SelectHTMLAttributes<HTMLSelectElement>>) {
  return (
    <select {...props} className={clsx(controlBase, className)}>
      {children}
    </select>
  );
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <label className="text-xs font-bold uppercase tracking-[0.14em] text-brand-900">{children}</label>;
}

export function FieldGroup({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div className="soft-panel rounded-[18px] p-5 md:p-6">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

export function SecondaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
        className
      )}
    />
  );
}
