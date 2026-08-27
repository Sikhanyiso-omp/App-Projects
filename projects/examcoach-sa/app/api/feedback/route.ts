import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { feedback } from "@/db/schema";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  const body = await request.json() as { category?: string; message?: string };
  const allowed = new Set(["learning", "payment", "idea", "bug"]);
  const message = String(body.message || "").trim();
  if (!allowed.has(String(body.category)) || message.length < 10 || message.length > 1200) return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  await getDb().insert(feedback).values({ userEmail: user?.email ?? null, category: String(body.category), message });
  return NextResponse.json({ ok: true });
}
