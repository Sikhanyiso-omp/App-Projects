import Link from "next/link";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import SupportForm from "./support-form";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const user = await getChatGPTUser();
  return <main className="legal-page"><header className="legal-header"><Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link><Link href={user ? "/dashboard" : "/"}>{user ? "Dashboard" : "Home"}</Link></header><article className="support-layout"><div><p className="eyebrow">Help & feedback</p><h1>Tell us where you&apos;re stuck.</h1><p>Questions about a lesson, access or payment? Send a short note. Your feedback also helps shape the next booster.</p><div className="support-note"><b>For payment help</b><span>Include the email you used to sign in and your Paystack reference if available. Never send your card details.</span></div></div><SupportForm signedIn={Boolean(user)} /></article></main>;
}
