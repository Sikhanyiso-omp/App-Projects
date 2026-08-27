import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ensureProfile, getDashboardData } from "@/lib/data";
import CheckoutButton from "./checkout-button";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireChatGPTUser("/checkout");
  await ensureProfile(user.email, user.displayName);
  const data = await getDashboardData(user.email);
  return <main className="checkout-page"><header className="checkout-header shell"><Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link><span>Secure checkout</span><Link href="/dashboard">Back to dashboard</Link></header><section className="checkout-layout shell"><div className="checkout-copy"><p className="eyebrow">CSP26W2 · Test 1</p><h1>Turn the notes into a plan you can execute.</h1><p>Get the complete Data Structures Test Booster with focused lessons, exam-style practice and a timed mock.</p><ul><li><span>01</span><div><b>Six focused lessons</b><small>Built around the methods you must reproduce</small></div></li><li><span>02</span><div><b>Instant checks and feedback</b><small>Know why an answer is right</small></div></li><li><span>03</span><div><b>Timed mock and readiness</b><small>See what to revise before test day</small></div></li></ul></div><aside className="checkout-card">{data.entitled ? <><div className="paid-check">✓</div><h2>You already have access.</h2><p>Your full booster is unlocked.</p><Link className="button button-primary button-block" href="/learn">Continue learning →</Link></> : <><span className="mini-label">Once-off purchase</span><h2>{data.module.title}</h2><div className="checkout-total"><span>Total</span><strong>R49</strong></div><CheckoutButton /><p className="checkout-fineprint">Secure card, instant EFT and supported methods are handled by Paystack. No subscription.</p></>}</aside></section></main>;
}
