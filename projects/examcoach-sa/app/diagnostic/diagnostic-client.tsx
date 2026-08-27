"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const questions = [
  {
    topic: "Algorithm analysis",
    prompt: "What is the time complexity of a loop where i doubles after every iteration?",
    code: "for (int i = 1; i < n; i = i * 2)",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 1,
    explanation: "The values are 1, 2, 4, 8 … so only log₂(n) doublings are needed.",
  },
  {
    topic: "Stacks",
    prompt: "A stack currently contains A, B, C, with C on top. What does pop() return?",
    options: ["A", "B", "C", "All three"],
    answer: 2,
    explanation: "A stack is LIFO: the last item inserted, C, is the first item removed.",
  },
  {
    topic: "Recurrence relations",
    prompt: "Which order describes T(n) = T(n/2) + n?",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    answer: 1,
    explanation: "The work forms n + n/2 + n/4 + …, a geometric series bounded by 2n.",
  },
  {
    topic: "Queues",
    prompt: "Which principle correctly describes an ordinary queue?",
    options: ["LIFO", "FIFO", "Smallest first", "Random access"],
    answer: 1,
    explanation: "A queue is FIFO: the first item inserted is the first item removed.",
  },
  {
    topic: "Algorithm analysis",
    prompt: "Which statement best describes worst-case complexity?",
    options: [
      "The fastest possible run",
      "The average of every input",
      "An upper bound on work for inputs of size n",
      "The memory used by one variable",
    ],
    answer: 2,
    explanation: "Worst-case analysis gives an upper bound on the operations required for an input size.",
  },
];

export default function DiagnosticClient() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const finished = index >= questions.length;
  const score = useMemo(() => answers.filter((answer, i) => answer === questions[i].answer).length, [answers]);

  if (finished) {
    const percent = score * 20;
    const readiness = Math.max(18, Math.min(82, percent - 4));
    return (
      <section className="diagnostic-results shell">
        <div className="result-summary">
          <p className="eyebrow"><span className="status-dot" /> Diagnostic complete</p>
          <h1>You are <em>{readiness}% ready</em> for this scope.</h1>
          <p>You answered {score} of {questions.length} correctly. This is a starting point—not a prediction of your final mark.</p>
          <div className="result-actions">
            <Link className="button button-primary" href="/signin-with-chatgpt?return_to=%2Fdashboard">Save my plan →</Link>
            <button className="button button-ghost" onClick={() => { setIndex(0); setAnswers([]); setSelected(null); setRevealed(false); }}>Try again</button>
          </div>
        </div>
        <div className="result-card">
          <div className="result-score"><span>Readiness</span><strong>{readiness}%</strong></div>
          <div className="result-topic"><div><span>Stacks & queues</span><b>{answers[1] === 2 && answers[3] === 1 ? "Strong" : "Review"}</b></div><div className="bar"><i className="green" style={{width: answers[1] === 2 && answers[3] === 1 ? "82%" : "48%"}} /></div></div>
          <div className="result-topic"><div><span>Algorithm analysis</span><b>{answers[0] === 1 && answers[4] === 2 ? "Developing" : "Priority"}</b></div><div className="bar"><i className="amber" style={{width: answers[0] === 1 && answers[4] === 2 ? "68%" : "34%"}} /></div></div>
          <div className="result-topic"><div><span>Recurrence relations</span><b>{answers[2] === 1 ? "Developing" : "Priority"}</b></div><div className="bar"><i className="coral" style={{width: answers[2] === 1 ? "62%" : "24%"}} /></div></div>
          <div className="next-step"><span>Recommended first lesson</span><strong>Recurrence substitution method</strong><small>12 minutes · 3 guided examples</small></div>
        </div>
      </section>
    );
  }

  const question = questions[index];
  const choose = (option: number) => {
    if (revealed) return;
    setSelected(option);
  };
  const check = () => {
    if (selected === null) return;
    setRevealed(true);
  };
  const next = () => {
    if (selected === null) return;
    setAnswers([...answers, selected]);
    setIndex(index + 1);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <section className="diagnostic-shell shell">
      <div className="diagnostic-meta">
        <span>Question {index + 1} of {questions.length}</span>
        <div className="diagnostic-progress"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
        <span>{question.topic}</span>
      </div>
      <div className="question-card">
        <div className="question-copy">
          <p className="mini-label">{question.topic}</p>
          <h1>{question.prompt}</h1>
          {question.code && <pre><code>{question.code}</code></pre>}
        </div>
        <div className="options-list" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, optionIndex) => {
            const isSelected = selected === optionIndex;
            const isCorrect = revealed && optionIndex === question.answer;
            const isWrong = revealed && isSelected && optionIndex !== question.answer;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`option-button ${isSelected ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                onClick={() => choose(optionIndex)}
                key={option}
              >
                <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
              </button>
            );
          })}
        </div>
        {revealed && <div className={`answer-feedback ${selected === question.answer ? "good" : "needs-work"}`}><b>{selected === question.answer ? "Correct." : "Not quite."}</b><span>{question.explanation}</span></div>}
        <div className="question-actions">
          {!revealed ? (
            <button className="button button-ink" disabled={selected === null} onClick={check}>Check answer</button>
          ) : (
            <button className="button button-primary" onClick={next}>{index === questions.length - 1 ? "See my readiness" : "Next question"} →</button>
          )}
        </div>
      </div>
      <p className="diagnostic-note">Your answers are not saved until you choose to sign in.</p>
    </section>
  );
}
