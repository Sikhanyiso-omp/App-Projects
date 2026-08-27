import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { purchases } from "@/db/schema";
import { ensureSeedData } from "@/lib/data";
import { privateEnv } from "@/lib/payments";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const secret = privateEnv("PAYSTACK_SECRET_KEY");
  if (!secret) return NextResponse.json({ error: "Payments are being connected. Please try again shortly." }, { status: 503 });
  const moduleRow = await ensureSeedData();
  const reference = `EC-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const callbackUrl = `${new URL(request.url).origin}/payment/complete?reference=${encodeURIComponent(reference)}`;
  const response = await fetch("https://api.paystack.co/transaction/initialize", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email, amount: moduleRow.priceCents, currency: "ZAR", reference, callback_url: callbackUrl, metadata: { module_id: moduleRow.id, module_code: moduleRow.code, user_email: user.email, product: moduleRow.title } }) });
  const payload = await response.json() as { status?: boolean; message?: string; data?: { authorization_url?: string } };
  if (!response.ok || !payload.status || !payload.data?.authorization_url) return NextResponse.json({ error: payload.message || "Payment provider is unavailable." }, { status: 502 });
  await getDb().insert(purchases).values({ reference, userEmail: user.email, moduleId: moduleRow.id, amountCents: moduleRow.priceCents, status: "pending" });
  return NextResponse.json({ authorizationUrl: payload.data.authorization_url });
}
