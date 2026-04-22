"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput } from "@/components/forms";
import { TalentProfileEditor } from "@/components/talent-profile-editor";
import { Card, SectionHeading } from "@/components/ui";
import { loginUser, registerUser } from "@/features/auth/authSlice";
import { createBlankProfile, normalizeProfileForSubmit } from "@/lib/talentProfile";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"recruiter" | "applicant">("recruiter");
  const [profile, setProfile] = useState(createBlankProfile());

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    if (mode === "login") {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        router.push(result.payload.user.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/applicant");
      }
      return;
    }

    const result = await dispatch(registerUser({
      email,
      password,
      role,
      profile: role === "applicant"
        ? normalizeProfileForSubmit({
            ...profile,
            basicInfo: {
              ...profile.basicInfo,
              email
            }
          })
        : undefined
    }));

    if (registerUser.fulfilled.match(result)) {
      router.push(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/applicant");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[0.44fr_0.56fr]">
        <Card className="hero-glow anim-fade-up p-7 md:p-8">
          <div className="relative z-10 space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-800">Umurava AI Access</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900">Welcome to a more thoughtful hiring workflow.</h1>
            <p className="text-sm text-slate-600">
              Recruiters get explainable ranking intelligence. Applicants get a clear, profile-first journey that represents their real strengths.
            </p>
            <div className="grid gap-3 text-sm text-slate-700">
              <p className="soft-panel rounded-2xl px-4 py-3">Switch instantly between recruiter and applicant workflows.</p>
              <p className="soft-panel rounded-2xl px-4 py-3">Structured profile fields improve fairness and model confidence.</p>
              <p className="soft-panel rounded-2xl px-4 py-3">Secure authentication with dashboard routing based on role.</p>
            </div>
          </div>
        </Card>

        <Card className="anim-fade-up anim-delay-1 p-7 md:p-9">
          <SectionHeading
            title={mode === "login" ? "Sign in" : "Create your account"}
            subtitle="Complete your details below. Applicant registration includes a compact profile starter for better AI screening quality."
          />
          <div className="mb-6 flex flex-wrap gap-3">
            <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-800"}`} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "register" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-800"}`} onClick={() => setMode("register")}>
              Register
            </button>
          </div>
          <form onSubmit={submit} className="grid gap-5">
            {mode === "register" && (
              <div className="flex flex-wrap gap-3">
                <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${role === "recruiter" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setRole("recruiter")}>
                  Recruiter
                </button>
                <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${role === "applicant" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setRole("applicant")}>
                  Applicant
                </button>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput name="email" type="email" placeholder="Email address" required />
              <TextInput name="password" type="password" placeholder="Password" required />
            </div>
            {mode === "register" && role === "applicant" && (
              <TalentProfileEditor profile={profile} setProfile={setProfile} compact />
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
