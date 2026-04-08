"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput } from "@/components/forms";
import { Card, SectionHeading } from "@/components/ui";
import { loginUser, registerUser } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"recruiter" | "applicant">("recruiter");

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

    const profile = role === "applicant"
      ? {
          name: String(formData.get("name") || ""),
          skills: String(formData.get("skills") || "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          experience: String(formData.get("experience") || ""),
          education: String(formData.get("education") || "")
        }
      : undefined;

    const result = await dispatch(registerUser({ email, password, role, profile }));
    if (registerUser.fulfilled.match(result)) {
      router.push(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/applicant");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-8">
        <SectionHeading title="Access The Platform" subtitle="Sign in as a recruiter or create an applicant-ready talent profile." />
        <div className="mb-6 flex gap-3">
          <button className={`rounded-full px-4 py-2 text-sm ${mode === "login" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`} onClick={() => setMode("login")}>
            Login
          </button>
          <button className={`rounded-full px-4 py-2 text-sm ${mode === "register" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`} onClick={() => setMode("register")}>
            Register
          </button>
        </div>
        <form onSubmit={submit} className="grid gap-4">
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
          {mode === "register" && role === "applicant" && <TextInput name="name" placeholder="Full name" required />}
          <TextInput name="email" type="email" placeholder="Email address" required />
          <TextInput name="password" type="password" placeholder="Password" required />
          {mode === "register" && role === "applicant" && (
            <>
              <TextInput name="skills" placeholder="Skills separated by commas" />
              <TextInput name="experience" placeholder="Experience summary" />
              <TextInput name="education" placeholder="Education background" />
            </>
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
