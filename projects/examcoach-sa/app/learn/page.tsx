import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import AppShell from "@/app/components/app-shell";
import { ensureProfile, getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const user = await requireChatGPTUser("/learn");
  await ensureProfile(user.email, user.displayName);
  const data = await getDashboardData(user.email);
  const completed = new Map(data.progress.map((row) => [row.lessonId, row]));

  return (
    <AppShell active="learn" user={user}>
      <header className="product-topbar">
        <div><p>{data.module.code} · {data.module.assessmentLabel}</p><h1>Your lessons</h1></div>
        <div className="topbar-actions"><span className="module-chip">{completed.size}/{data.lessons.length} complete</span><Link className="button button-small button-ink" href="/mock">Write a mock</Link></div>
      </header>
      <main className="dashboard-content">
        <section className="course-intro">
          <div><p className="kicker">A method you can repeat</p><h2>Learn the idea. Follow the method. Prove it.</h2><p>{data.module.description}</p></div>
          <div className="course-stat"><strong>{data.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0)}</strong><span>focused minutes</span></div>
        </section>
        <section className="lesson-list" aria-label="Course lessons">
          {data.lessons.map((lesson, index) => {
            const itemProgress = completed.get(lesson.id);
            const unlocked = data.entitled || lesson.isPreview;
            return (
              <article className={`lesson-row ${!unlocked ? "locked" : ""}`} key={lesson.id}>
                <div className="lesson-position">{itemProgress?.completed ? "✓" : String(index + 1).padStart(2, "0")}</div>
                <div className="lesson-copy"><div><span>{lesson.topic}</span>{lesson.isPreview && <b>Free preview</b>}</div><h2>{lesson.title}</h2><p>{lesson.summary}</p></div>
                <div className="lesson-meta"><span>{lesson.minutes} min</span>{itemProgress?.completed && <small>{itemProgress.mastery}% mastery</small>}</div>
                <Link className="lesson-action" href={unlocked ? `/lesson/${lesson.slug}` : "/checkout"} aria-label={`${unlocked ? "Open" : "Unlock"} ${lesson.title}`}>{unlocked ? "→" : "🔒"}</Link>
              </article>
            );
          })}
        </section>
        {!data.entitled && <section className="inline-unlock"><div><span className="mini-label">One clear price</span><h2>Unlock the full booster for R49.</h2><p>Five more lessons, the full practice bank and the timed mock.</p></div><Link className="button button-primary" href="/checkout">Unlock all access →</Link></section>}
      </main>
    </AppShell>
  );
}
