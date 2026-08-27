import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { saveAttempt } from "@/lib/data";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json() as { assessmentType?: string; score?: number; total?: number; readiness?: number; answers?: number[] };
  if (!Number.isFinite(body.score) || !Number.isFinite(body.total) || !Array.isArray(body.answers)) return NextResponse.json({ error: "Invalid result" }, { status: 400 });
  const attempt = await saveAttempt({ email: user.email, assessmentType: body.assessmentType === "mock" ? "mock" : "practice", score: Number(body.score), total: Number(body.total), readiness: Math.max(0, Math.min(100, Number(body.readiness) || 0)), answers: body.answers.map(Number) });
  return NextResponse.json({ ok: true, attempt });
}
