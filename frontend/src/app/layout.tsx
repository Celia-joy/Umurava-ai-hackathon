import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/shell";
import { StoreProvider } from "@/store/provider";

export const metadata: Metadata = {
  title: "Umurava RecruitAI",
  description: "AI-powered recruitment screening platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
