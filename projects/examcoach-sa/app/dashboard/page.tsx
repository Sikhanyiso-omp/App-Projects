import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import AppShell from "@/app/components/app-shell";
import { ensureProfile, getDashboardData } from "@/lib/data";
import DiagnosticImporter from "./diagnostic-importer";
import TaskList from "./task-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/dashboard");
  await ensureProfile(user.email, user.displayName);
  const data = await getDashboardData(user.email);
  const latest = data.attempts[0];
  const readiness = latest?.readiness ?? 34;
  const completedLessonIds = new Set(data.progress.filter((item) => item.completed).map((item) => item.lessonId));
  const completed = completedLessonIds.size;
  const firstAvailable = data.lessons.find((lesson) => lesson.isPreview || data.entitled);

  return (
    <AppShell active="dashboard" user={user}>
      <DiagnosticImporter />
      <header className="product-topbar">
        <div><p>Good to see you,</p><h1>{user.fullName?.split(" ")[0] ?? user.displayName.split("@")[0]}</h1></div>
        <div className="topbar-actions"><span className="module-chip">{data.module.code} · {data.module.assessmentLabel}</span><Link className="button button-small button-ink" href="/mock">Write a mock</Link></div>
      </header>
      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div className="readiness-panel">
            <div className="panel-heading"><div><span>Assessment readiness</span><small>Updated from your latest work</small></div><b>{readiness}%</b></div>
            <div className="large-progress"><i style={{ width: `${readiness}%` }} /></div>
            <div className="readiness-scale"><span>Building foundations</span><span>Exam ready</span></div>
            <div className="readiness-bottom">
              <div><strong>{completed}/{data.lessons.length}</strong><span>lessons complete</span></div>
              <div><strong>{data.attempts.length}</strong><span>assessments written</span></div>
              <div><strong>{data.tasks.filter((task) => task.status === "done").length}</strong><span>tasks done today</span></div>
            </div>
          </div>
          <div className="next-panel">
            <span className="mini-label">Recommended next</span>
            <div className="next-symbol">≋</div>
            <h2>{firstAvailable?.title ?? "Start your first lesson"}</h2>
            <p>{firstAvailable?.summary}</p>
            <Link className="button button-primary button-block" href={firstAvailable ? `/lesson/${firstAvailable.slug}` : "/learn"}>Continue learning →</Link>
          </div>
        </section>

        {!data.entitled && (
          <section className="unlock-banner">
            <div><span>Launch offer</span><h2>Unlock all 6 lessons, practice and the timed mock.</h2><p>Once-off access to the complete CSP26W2 Test Booster.</p></div>
            <div className="unlock-price"><strong>R49</strong><small>once off</small></div>
            <Link className="button button-light" href="/checkout">Unlock the pack →</Link>
          </section>
        )}

        <section className="dashboard-grid">
          <div className="dashboard-section">
            <div className="dash-section-head"><div><p className="mini-label">Your plan</p><h2>Today&apos;s focused work</h2></div><span>{data.tasks.reduce((sum, task) => task.status === "done" ? sum : sum + task.minutes, 0)} min remaining</span></div>
            <TaskList tasks={data.tasks} />
          </div>
          <aside className="dashboard-section weak-section">
            <div className="dash-section-head"><div><p className="mini-label">Priority</p><h2>Weak topics</h2></div></div>
            <div className="weak-topic"><div><span>Recurrence relations</span><b>28%</b></div><div className="bar"><i className="coral" style={{width:"28%"}} /></div><small>Review substitution method</small></div>
            <div className="weak-topic"><div><span>Algorithm analysis</span><b>42%</b></div><div className="bar"><i className="amber" style={{width:"42%"}} /></div><small>Practise logarithmic loops</small></div>
            <div className="weak-topic"><div><span>Stacks & queues</span><b>76%</b></div><div className="bar"><i className="green" style={{width:"76%"}} /></div><small>Maintain with short revision</small></div>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
