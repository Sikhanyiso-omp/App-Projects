import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { saveLessonProgress } from "@/lib/data";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json() as { lessonId?: number; mastery?: number };
  if (!Number.isInteger(body.lessonId) || !Number.isFinite(body.mastery)) return NextResponse.json({ error: "Invalid progress" }, { status: 400 });
  const row = await saveLessonProgress(user.email, Number(body.lessonId), Math.max(0, Math.min(100, Number(body.mastery))));
  return NextResponse.json({ ok: true, progress: row });
}
