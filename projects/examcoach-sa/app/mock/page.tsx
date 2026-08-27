import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import AppShell from "@/app/components/app-shell";
import { ensureProfile, getDashboardData, getMockQuestions } from "@/lib/data";
import MockRunner from "./mock-runner";

export const dynamic = "force-dynamic";

export default async function MockPage() {
  const user = await requireChatGPTUser("/mock");
  await ensureProfile(user.email, user.displayName);
  const data = await getDashboardData(user.email);
  if (!data.entitled) return <AppShell active="mock" user={user}><header className="product-topbar"><div><p>{data.module.code}</p><h1>Timed mock</h1></div></header><main className="dashboard-content"><section className="mock-locked"><div className="lock-orb">◷</div><p className="kicker">Your exam rehearsal</p><h2>Unlock the full timed mock.</h2><p>Ten test-style questions, instant marking, topic feedback and an updated readiness score.</p><div className="locked-price"><strong>R49</strong><span>once off · includes all lessons</span></div><Link className="button button-primary" href="/checkout">Unlock and start →</Link></section></main></AppShell>;
  const rows = await getMockQuestions();
  const questions = rows.map((row) => ({ id: row.id, topic: row.topic, prompt: row.prompt, code: row.code, options: JSON.parse(row.optionsJson) as string[], correctIndex: row.correctIndex, explanation: row.explanation, marks: row.marks }));
  return <AppShell active="mock" user={user}><header className="product-topbar"><div><p>{data.module.code} · {data.module.assessmentLabel}</p><h1>Timed mock</h1></div><span className="module-chip">30 minutes · {questions.length} questions</span></header><main className="dashboard-content"><MockRunner questions={questions} /></main></AppShell>;
}
