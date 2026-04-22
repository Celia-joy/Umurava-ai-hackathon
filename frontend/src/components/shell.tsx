"use client";

import Link from "next/link";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { hydrateAuth, logout } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const navItems = [
  { href: "/jobs", label: "For Talents" },
  { href: "/dashboard/recruiter", label: "For Business" },
  { href: "/dashboard/applicant", label: "Join the Platform" },
  { href: "/", label: "About Us" }
] as const;

export function AppShell({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeRoleLabel = useMemo(() => {
    if (!user) return "Guest";
    return user.role === "recruiter" ? "Recruiter" : "Talent";
  }, [user]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white transition group-hover:scale-105">
              U
            </span>
            <span className="block text-base font-bold tracking-tight text-slate-900 md:text-lg">Competence by Umurava</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition",
                  pathname === item.href ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <button
                className="ml-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                onClick={() => dispatch(logout())}
              >
                Logout
              </button>
            ) : (
              <Link href="/auth" className="ml-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
                Get Started
              </Link>
            )}
          </nav>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 md:hidden"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label="Toggle navigation"
          >
            <span className="text-lg">{mobileMenuOpen ? "×" : "☰"}</span>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 px-4 py-4 md:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-lg px-4 py-3 text-sm font-semibold",
                    pathname === item.href ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{activeRoleLabel}</span>
              {user ? (
                <button className="rounded-md bg-brand-600 px-4 py-2 text-xs font-semibold text-white" onClick={() => dispatch(logout())}>
                  Logout
                </button>
              ) : (
                <Link href="/auth" className="rounded-md bg-brand-600 px-4 py-2 text-xs font-semibold text-white">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">{children}</main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Competence by Umurava</h3>
            <p className="mt-3 text-sm text-slate-600">Build work experience through real-world challenges, hackathons, and verified portfolio projects.</p>
            <p className="mt-4 text-sm text-slate-600">competence@umurava.africa</p>
            <p className="text-sm text-slate-600">+250 789 263 354</p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-900">Skills Challenges</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Hackathons</li>
              <li>Competitions</li>
              <li>Job-Role Assessments</li>
              <li>Practices</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-900">Solutions</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>For Talents</li>
              <li>For Education</li>
              <li>For Businesses</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-900">Newsletter</h4>
            <p className="mt-3 text-sm text-slate-600">Join our newsletter to keep up to date with us.</p>
            <Link href="/auth" className="mt-4 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
              Subscribe
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">Copyright © All Rights Reserved Umurava 2026.</div>
      </footer>
    </div>
  );
}
