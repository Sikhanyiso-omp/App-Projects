import Link from "next/link";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ensureProfile, getLesson } from "@/lib/data";
import type { LessonContent } from "@/lib/examcoach-content";
import LessonCheck from "./lesson-check";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireChatGPTUser(`/lesson/${slug}`);
  await ensureProfile(user.email, user.displayName);
  const data = await getLesson(user.email, slug);
  if (!data) notFound();
  if (!data.entitled && !data.lesson.isPreview) {
    return <main className="locked-page"><Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link><section><div className="lock-orb">🔒</div><p className="kicker">Full booster lesson</p><h1>This lesson is ready when you are.</h1><p>{data.lesson.summary}</p><div className="locked-price"><strong>R49</strong><span>once-off access to all six lessons and the timed mock</span></div><Link className="button button-primary" href="/checkout">Unlock the Test Booster →</Link><Link className="text-link" href="/learn">Back to lessons</Link></section></main>;
  }
  const content = JSON.parse(data.lesson.contentJson) as LessonContent;
  return (
    <main className="lesson-page">
      <header className="lesson-header shell"><Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link><span>{data.module.code} · Lesson {data.lesson.position} of 6</span><Link href="/learn" className="close-link" aria-label="Close lesson">×</Link></header>
      <div className="lesson-progress-track"><i style={{width: `${Math.round(data.lesson.position / 6 * 100)}%`}} /></div>
      <article className="lesson-article shell">
        <header><p className="eyebrow">{data.lesson.topic} · {data.lesson.minutes} min</p><h1>{data.lesson.title}</h1><p>{content.outcome}</p></header>
        <section className="concept-card"><span className="section-number">01</span><div><p className="kicker">Make it click</p><h2>What this means</h2>{content.meaning.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>
        <section className="method-section"><span className="section-number">02</span><div><p className="kicker">Use this in the test</p><h2>The repeatable method</h2><ol>{content.method.map((step, index) => <li key={step.title}><b>{index + 1}</b><div><strong>{step.title}</strong><p>{step.detail}</p>{step.code && <code>{step.code}</code>}</div></li>)}</ol></div></section>
        <section className="worked-example"><span className="section-number">03</span><div><p className="kicker">Worked example</p><h2>{content.example.prompt}</h2><ol>{content.example.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol><strong className="example-answer">{content.example.answer}</strong></div></section>
        <aside className="mistake-card"><span>Watch this mistake</span><p>{content.mistake}</p></aside>
        <LessonCheck lessonId={data.lesson.id} check={content.check} alreadyCompleted={Boolean(data.progress?.completed)} />
      </article>
    </main>
  );
}
