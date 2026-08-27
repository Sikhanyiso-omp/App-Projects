"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MockQuestion = { id: number; topic: string; prompt: string; code: string | null; options: string[]; correctIndex: number; explanation: string; marks: number };

export default function MockRunner({ questions }: { questions: MockQuestion[] }) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [seconds, setSeconds] = useState(30 * 60);
  const [saved, setSaved] = useState(false);
  const totalMarks = useMemo(() => questions.reduce((sum, item) => sum + item.marks, 0), [questions]);
  const score = questions.reduce((sum, item, index) => sum + (answers[index] === item.correctIndex ? item.marks : 0), 0);
  const readiness = totalMarks ? Math.round(score / totalMarks * 100) : 0;
  useEffect(() => { if (!started || finished) return; const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { window.clearInterval(timer); void finish(); return 0; } return value - 1; }), 1000); return () => window.clearInterval(timer); }, [started, finished]);
  async function finish() { setFinished(true); const response = await fetch("/api/attempts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ assessmentType: "mock", score, total: totalMarks, readiness, answers }) }); if (response.ok) setSaved(true); }
  if (!started) return <section className="mock-intro"><div><p className="kicker">Before you begin</p><h2>Rehearse the pressure, then fix the gaps.</h2><p>This mock covers algorithm analysis, recurrence relations, stacks and queues. You can move between questions before submitting.</p><ul><li><b>30 minutes</b><span>Keep your pace realistic</span></li><li><b>{totalMarks} marks</b><span>Auto-marked immediately</span></li><li><b>No penalty</b><span>Use this to learn</span></li></ul><button className="button button-primary" onClick={() => setStarted(true)}>Start timed mock →</button></div><aside><span>Mock test</span><strong>{questions.length}</strong><p>questions selected from the Test Booster bank</p></aside></section>;
  if (finished) return <section className="mock-results"><div><p className="eyebrow">Mock complete · {saved ? "result saved" : "saving result"}</p><h2>Your current readiness is <em>{readiness}%</em>.</h2><p>You scored {score} out of {totalMarks} marks. Review every explanation below, then repeat your weakest lesson before trying again.</p><div className="result-actions"><Link className="button button-primary" href="/learn">Review lessons →</Link><button className="button button-ghost" onClick={() => { setAnswers(questions.map(() => -1)); setCurrent(0); setSeconds(1800); setFinished(false); }}>Try again</button></div></div><div className="review-list">{questions.map((item, index) => <article className={answers[index] === item.correctIndex ? "review-correct" : "review-wrong"} key={item.id}><span>{answers[index] === item.correctIndex ? "✓" : "×"}</span><div><b>{item.topic}</b><p>{item.prompt}</p><small>{item.explanation}</small></div></article>)}</div></section>;
  const question = questions[current];
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0"); const secs = String(seconds % 60).padStart(2, "0");
  return <section className="mock-runner"><header><div><span>Question {current + 1} of {questions.length}</span><div className="diagnostic-progress"><i style={{ width: `${(current + 1) / questions.length * 100}%` }} /></div></div><strong className={seconds < 300 ? "urgent" : ""}>◷ {minutes}:{secs}</strong></header><article className="mock-question"><p className="kicker">{question.topic} · {question.marks} marks</p><h2>{question.prompt}</h2>{question.code && <pre>{question.code}</pre>}<div className="options-list">{question.options.map((option, index) => <button key={option} className={`option-button ${answers[current] === index ? "selected" : ""}`} onClick={() => setAnswers((old) => old.map((value, answerIndex) => answerIndex === current ? index : value))}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div></article><footer><button className="button button-ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)}>← Previous</button>{current < questions.length - 1 ? <button className="button button-ink" onClick={() => setCurrent(current + 1)}>Next question →</button> : <button className="button button-primary" onClick={() => void finish()}>Submit mock →</button>}</footer></section>;
}
