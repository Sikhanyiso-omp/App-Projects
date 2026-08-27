import { NextResponse } from "next/server";
import { activatePurchase, privateEnv, recordPaymentEvent } from "@/lib/payments";

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const secret = privateEnv("PAYSTACK_SECRET_KEY");
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const raw = await request.text();
  const expected = await hmacHex(secret, raw);
  const actual = request.headers.get("x-paystack-signature") || "";
  if (actual.length !== expected.length || actual !== expected) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  const event = JSON.parse(raw) as { event?: string; data?: { id?: number; reference?: string; status?: string; amount?: number; fees?: number } };
  const reference = event.data?.reference;
  const eventKey = `${event.event || "unknown"}:${event.data?.id || reference || crypto.randomUUID()}`;
  if (event.event === "charge.success" && reference && event.data?.status === "success") {
    // Activation is idempotent. Record the event only after both the purchase
    // and entitlement updates succeed so a transient failure remains retryable.
    const activated = await activatePurchase(reference, event.data);
    if (!activated) return NextResponse.json({ error: "Purchase activation failed" }, { status: 409 });
  }
  await recordPaymentEvent(eventKey, event.event || "unknown", reference);
  return NextResponse.json({ received: true });
}
