import Link from "next/link";
import { getChatGPTUser, chatGPTSignInPath } from "./chatgpt-auth";

const topics = [
  { name: "Algorithm analysis", score: 42, tone: "amber" },
  { name: "Recurrence relations", score: 28, tone: "coral" },
  { name: "Stacks", score: 76, tone: "green" },
];

export default async function Home() {
  const user = await getChatGPTUser();
  const dashboardHref = user ? "/dashboard" : chatGPTSignInPath("/dashboard");

  return (
    <main>
      <header className="site-header shell">
        <Link className="brand" href="/" aria-label="ExamCoach SA home">
          <span className="brand-mark">EC</span>
          <span>ExamCoach <b>SA</b></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#how">How it works</a>
          <a href="#pack">The first pack</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <Link className="button button-small button-ink" href={dashboardHref}>
          {user ? "Open dashboard" : "Sign in"}
        </Link>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> Built for WSU students</p>
          <h1>Know what to study. Practise the right method. <em>Walk in ready.</em></h1>
          <p className="hero-lede">
            ExamCoach turns a difficult module into a clear daily plan, method-aligned lessons,
            exam-style practice and an honest readiness score.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/diagnostic">
              Start the free diagnostic <span aria-hidden="true">→</span>
            </Link>
            <a className="text-link" href="#pack">See what is inside</a>
          </div>
          <div className="trust-row" aria-label="Product highlights">
            <span>✓ No subscription</span>
            <span>✓ Low-data</span>
            <span>✓ Original practice</span>
          </div>
        </div>

        <div className="readiness-card" aria-label="Example readiness dashboard">
          <div className="readiness-topline">
            <span className="mini-label">CSP26W2 · Test 1</span>
            <span className="days-pill">12 days left</span>
          </div>
          <div className="score-row">
            <div>
              <p>Your readiness</p>
              <strong>58%</strong>
            </div>
            <div className="score-ring" aria-hidden="true"><span>58</span></div>
          </div>
          <div className="topic-list">
            {topics.map((topic) => (
              <div className="topic" key={topic.name}>
                <div><span>{topic.name}</span><b>{topic.score}%</b></div>
                <div className="bar"><i className={topic.tone} style={{ width: `${topic.score}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="today-card">
            <div className="today-icon">01</div>
            <div>
              <span>Start here today</span>
              <strong>Recurrence substitution method</strong>
              <small>12 min lesson · 3 practice questions</small>
            </div>
            <span className="round-arrow" aria-hidden="true">↗</span>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="shell proof-inner">
          <p>Not another pile of summaries.</p>
          <div>
            <span>EXPLAIN</span><i />
            <span>PRACTISE</span><i />
            <span>MARK</span><i />
            <span>REVISE</span>
          </div>
        </div>
      </section>

      <section className="section shell" id="how">
        <div className="section-heading">
          <p className="kicker">A simpler way to prepare</p>
          <h2>From confused to exam-ready, one step at a time.</h2>
          <p>You always know what to do next—and why it matters.</p>
        </div>
        <div className="steps-grid">
          <article className="step-card step-lilac">
            <span className="step-number">01</span>
            <div className="step-icon">◎</div>
            <h3>Find your real gaps</h3>
            <p>Take a short diagnostic mapped to the exact topics in your assessment scope.</p>
          </article>
          <article className="step-card step-lime">
            <span className="step-number">02</span>
            <div className="step-icon">≋</div>
            <h3>Learn the method</h3>
            <p>See each solution line explained, then practise without being given the answer too early.</p>
          </article>
          <article className="step-card step-peach">
            <span className="step-number">03</span>
            <div className="step-icon">↗</div>
            <h3>Prove you are ready</h3>
            <p>Write timed mocks, get marked by topic and follow a plan that adapts to your mistakes.</p>
          </article>
        </div>
      </section>

      <section className="section pack-section" id="pack">
        <div className="shell pack-layout">
          <div className="pack-copy">
            <p className="kicker">Launching first</p>
            <h2>CSP26W2 Data Structures: Test Booster</h2>
            <p className="pack-lede">A focused preparation pack for the topics students repeatedly struggle to compute and explain.</p>
            <ul className="feature-list">
              <li><b>Topic-by-topic lessons</b><span>Plain explanations before formal steps</span></li>
              <li><b>Method-aligned examples</b><span>Every line explained, no mysterious jumps</span></li>
              <li><b>Immediate marking</b><span>See the first wrong step and how to correct it</span></li>
              <li><b>Timed mock test</b><span>Real marks, time pressure and a readiness update</span></li>
            </ul>
            <Link className="button button-ink" href="/diagnostic">Try the diagnostic</Link>
          </div>
          <div className="lesson-preview">
            <div className="lesson-window-top"><i /><i /><i /><span>Lesson 03 of 08</span></div>
            <div className="lesson-window-body">
              <p className="mini-label">Recurrence relations</p>
              <h3>Substitution method</h3>
              <p className="lesson-question">Solve: <b>T(n) = T(n/2) + n</b></p>
              <ol>
                <li><span>1</span><div><b>Expand once</b><code>T(n) = [T(n/4) + n/2] + n</code></div></li>
                <li className="active"><span>2</span><div><b>Expand again</b><code>T(n) = T(n/8) + n/4 + n/2 + n</code></div></li>
                <li><span>3</span><div><b>Identify the pattern</b><code>n + n/2 + n/4 + ...</code></div></li>
              </ol>
              <div className="coach-note"><b>Coach note</b><span>The subproblem halves, but each level still contributes work.</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" id="pricing">
        <div className="price-panel">
          <div>
            <p className="kicker">One clear price</p>
            <h2>Prepare properly for less than one tutoring session.</h2>
            <p>Start free. Pay once only when you want the complete Test Booster.</p>
          </div>
          <div className="price-card">
            <span>Test Booster</span>
            <div className="price"><small>R</small>49</div>
            <p>Once-off access for this assessment</p>
            <ul><li>All lessons</li><li>Full practice bank</li><li>Timed mock</li><li>Daily plan</li></ul>
            <Link className="button button-primary button-block" href="/diagnostic">Start free first</Link>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell final-inner">
          <div><p className="kicker">Your next test starts here</p><h2>Stop guessing what to study.</h2></div>
          <Link className="button button-light" href="/diagnostic">Check your readiness →</Link>
        </div>
      </section>

      <footer className="site-footer shell">
        <Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link>
        <p>Independent study support. Not affiliated with or endorsed by Walter Sisulu University.</p>
        <div><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
      </footer>
    </main>
  );
}
