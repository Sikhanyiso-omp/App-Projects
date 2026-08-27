import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { verifyPaystackReference } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function PaymentCompletePage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const user = await requireChatGPTUser("/payment/complete");
  const { reference } = await searchParams;
  const result = reference ? await verifyPaystackReference(reference, user.email) : { ok: false, reason: "No payment reference was returned." };
  return <main className="payment-result"><Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link><section><div className={result.ok ? "paid-check" : "payment-pending"}>{result.ok ? "✓" : "…"}</div><p className="kicker">{result.ok ? "Payment confirmed" : "Confirmation pending"}</p><h1>{result.ok ? "Your booster is unlocked." : "We’re checking your payment."}</h1><p>{result.reason}</p><Link className="button button-primary" href={result.ok ? "/learn" : "/checkout"}>{result.ok ? "Start learning →" : "Return to checkout"}</Link></section></main>;
}
