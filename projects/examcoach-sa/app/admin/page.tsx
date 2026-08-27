import Link from "next/link";
import { env } from "cloudflare:workers";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import AppShell from "@/app/components/app-shell";
import { getAdminData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const ownerEmail = ((env as unknown as Record<string, string | undefined>).OWNER_EMAIL || "").toLowerCase();
  if (!ownerEmail || ownerEmail !== user.email.toLowerCase()) return <main className="owner-gate"><Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link><section><div className="lock-orb">◇</div><p className="kicker">Owner console</p><h1>{ownerEmail ? "This area belongs to the app owner." : "Owner access is ready to link."}</h1><p>{ownerEmail ? "You’re signed in, but this ChatGPT email is not the configured owner." : "Set the owner email, then sign in with that same ChatGPT account to manage sales and content."}</p><Link className="button button-ink" href="/dashboard">Go to student dashboard</Link></section></main>;
  const data = await getAdminData();
  return <AppShell active="admin" user={user}><header className="product-topbar"><div><p>Owner console</p><h1>ExamCoach operations</h1></div><span className="module-chip">{data.module.code} · Published</span></header><main className="dashboard-content"><section className="admin-stats"><article><span>Students</span><strong>{data.students}</strong><small>signed-in profiles</small></article><article><span>Paid access</span><strong>{data.paid}</strong><small>successful purchases</small></article><article><span>Revenue</span><strong>R{(data.revenueCents / 100).toFixed(0)}</strong><small>gross collected</small></article><article><span>Attempts</span><strong>{data.attempts}</strong><small>learning signals</small></article></section><section className="admin-grid"><div className="admin-panel"><div className="dash-section-head"><div><p className="mini-label">Content</p><h2>Published booster</h2></div><span>{data.questions} questions</span></div>{data.lessons.map((lesson) => <div className="admin-content-row" key={lesson.id}><span>{String(lesson.position).padStart(2, "0")}</span><div><b>{lesson.title}</b><small>{lesson.topic} · {lesson.minutes} min</small></div><i>{lesson.isPreview ? "Preview" : "Paid"}</i></div>)}</div><aside className="admin-panel"><div className="dash-section-head"><div><p className="mini-label">Latest</p><h2>Payments</h2></div></div>{data.recentPurchases.length ? data.recentPurchases.map((purchase) => <div className="payment-row" key={purchase.id}><div><b>{purchase.userEmail}</b><small>{purchase.reference}</small></div><span className={`status-${purchase.status}`}>{purchase.status}</span><strong>R{(purchase.amountCents / 100).toFixed(0)}</strong></div>) : <div className="empty-state">Your first purchase will appear here.</div>}</aside></section></main></AppShell>;
}
