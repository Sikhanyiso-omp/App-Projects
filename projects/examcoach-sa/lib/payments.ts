import { and, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { entitlements, paymentEvents, purchases } from "@/db/schema";

type PaystackData = { status?: string; reference?: string; amount?: number; fees?: number; customer?: { email?: string }; metadata?: { module_id?: number; user_email?: string } };

export function privateEnv(name: string) {
  return (env as unknown as Record<string, string | undefined>)[name]?.trim() || "";
}

export async function activatePurchase(reference: string, data?: PaystackData) {
  const db = getDb();
  const [purchase] = await db.select().from(purchases).where(eq(purchases.reference, reference)).limit(1);
  if (!purchase || (data?.amount && data.amount !== purchase.amountCents)) return false;
  await db.update(purchases).set({ status: "paid", paidAt: new Date().toISOString(), providerFeeCents: data?.fees ?? null }).where(eq(purchases.id, purchase.id));
  await db.insert(entitlements).values({ userEmail: purchase.userEmail, moduleId: purchase.moduleId, status: "active", source: "purchase" }).onConflictDoUpdate({ target: [entitlements.userEmail, entitlements.moduleId], set: { status: "active", source: "purchase" } });
  return true;
}

export async function verifyPaystackReference(reference: string, email?: string) {
  const secret = privateEnv("PAYSTACK_SECRET_KEY");
  if (!secret) return { ok: false, reason: "Payments are awaiting owner setup." };
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` } });
  const payload = await response.json() as { status?: boolean; data?: PaystackData };
  if (!response.ok || !payload.status || payload.data?.status !== "success") return { ok: false, reason: "Payment is not confirmed yet." };
  const db = getDb();
  const condition = email
    ? and(eq(purchases.reference, reference), eq(purchases.userEmail, email))
    : eq(purchases.reference, reference);
  const [purchase] = await db.select().from(purchases).where(condition).limit(1);
  if (!purchase) return { ok: false, reason: "Purchase reference not found." };
  const ok = await activatePurchase(reference, payload.data);
  return { ok, reason: ok ? "Access unlocked." : "Payment could not be matched." };
}

export async function recordPaymentEvent(eventKey: string, eventType: string, reference?: string) {
  const db = getDb();
  const inserted = await db.insert(paymentEvents).values({ providerEventKey: eventKey, eventType, reference: reference ?? null }).onConflictDoNothing().returning();
  return inserted.length > 0;
}
