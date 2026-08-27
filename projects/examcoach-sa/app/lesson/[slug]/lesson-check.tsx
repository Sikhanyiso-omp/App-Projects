"use client";

import Link from "next/link";
import { useState } from "react";
import type { LessonContent } from "@/lib/examcoach-content";

export default function LessonCheck({ lessonId, check, alreadyCompleted }: { lessonId: number; check: LessonContent["check"]; alreadyCompleted: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(alreadyCompleted);
  const correct = selected === check.answer;
  async function mark() {
    if (selected === null) return;
    setSubmitted(true);
    const response = await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonId, mastery: selected === check.answer ? 100 : 55 }) });
    if (response.ok) setSaved(true);
  }
  return <section className="lesson-check"><p className="kicker">Quick mastery check</p><h2>{check.prompt}</h2><div className="options-list">{check.options.map((option, index) => <button key={option} type="button" disabled={submitted} onClick={() => setSelected(index)} className={`option-button ${selected === index ? "selected" : ""} ${submitted && index === check.answer ? "correct" : ""} ${submitted && selected === index && !correct ? "wrong" : ""}`}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{submitted && <div className={`answer-feedback ${correct ? "" : "needs-work"}`}><strong>{correct ? "That’s it." : "Review this idea once more."}</strong><span>{check.explanation}</span></div>}<div className="lesson-check-actions">{!submitted ? <button className="button button-ink" type="button" disabled={selected === null} onClick={mark}>Check my answer</button> : <><span>{saved ? "Progress saved" : "Saving…"}</span><Link className="button button-primary" href="/learn">Choose next lesson →</Link></>}</div></section>;
}
