"use client";

import Link from "next/link";
import { PropsWithChildren, useEffect } from "react";
import { hydrateAuth, logout } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AppShell({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-brand-800">
            Umurava RecruitAI
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <Link href="/jobs">Jobs</Link>
            <Link href="/dashboard/recruiter">Recruiter</Link>
            <Link href="/dashboard/applicant">Applicant</Link>
            {user ? (
              <button
                className="rounded-full bg-brand-600 px-4 py-2 text-white"
                onClick={() => dispatch(logout())}
              >
                Logout
              </button>
            ) : (
              <Link href="/auth" className="rounded-full bg-brand-600 px-4 py-2 text-white">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
