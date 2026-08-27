"use client";

import { FormEvent, useState } from "react";

export default function SupportForm({ signedIn }: { signedIn: boolean }) {
  const [sent, setSent] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ category: form.get("category"), message: form.get("message") }) }); if (response.ok) setSent(true); else setError("Your message could not be sent. Please try again."); }
  if (sent) return <section className="support-form success"><div className="paid-check">✓</div><h2>Message received.</h2><p>Thank you—your note is now in the owner console.</p></section>;
  return <form className="support-form" onSubmit={submit}><label>What is this about?<select name="category" required><option value="learning">A lesson or question</option><option value="payment">Payment or access</option><option value="idea">A product idea</option><option value="bug">Something is not working</option></select></label><label>Your message<textarea name="message" required minLength={10} maxLength={1200} placeholder="Describe what happened and what you expected…" /></label>{!signedIn && <p>We will save this as anonymous feedback. Sign in first if you need help with your account.</p>}{error && <div className="checkout-error">{error}</div>}<button className="button button-ink" type="submit">Send feedback →</button></form>;
}
