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
    <div className="mx-auto max-w-5xl">
      <Card className="p-8 md:p-10">
        <SectionHeading
          eyebrow="Umurava AI Access"
          title="Recruit, apply, and analyze with structured talent profiles"
          subtitle="Create an account, capture the official talent schema, and feed the scoring pipeline with clean applicant data."
        />
        <div className="mb-6 flex flex-wrap gap-3">
          <button type="button" className={`rounded-full px-4 py-2 text-sm ${mode === "login" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={`rounded-full px-4 py-2 text-sm ${mode === "register" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`} onClick={() => setMode("register")}>
            Register
          </button>
        </div>
        <form onSubmit={submit} className="grid gap-5">
          {mode === "register" && (
            <div className="flex gap-3">
              <button type="button" className={`rounded-full px-4 py-2 text-sm ${role === "recruiter" ? "bg-slate-900 text-white" : "bg-slate-100"}`} onClick={() => setRole("recruiter")}>
                Recruiter
              </button>
              <button type="button" className={`rounded-full px-4 py-2 text-sm ${role === "applicant" ? "bg-slate-900 text-white" : "bg-slate-100"}`} onClick={() => setRole("applicant")}>
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
          <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </Card>
    </div>
  );
}
