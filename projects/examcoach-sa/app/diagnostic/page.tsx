import type { Metadata } from "next";
import Link from "next/link";
import DiagnosticClient from "./diagnostic-client";

export const metadata: Metadata = {
  title: "Free CSP26W2 diagnostic | ExamCoach SA",
  description: "Find your strongest and weakest Data Structures topics in five questions.",
};

export default function DiagnosticPage() {
  return (
    <main className="app-page diagnostic-page">
      <header className="app-topbar shell">
        <Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link>
        <span className="progress-label">Free diagnostic · CSP26W2</span>
        <Link className="close-link" href="/" aria-label="Close diagnostic">×</Link>
      </header>
      <DiagnosticClient />
    </main>
  );
}
