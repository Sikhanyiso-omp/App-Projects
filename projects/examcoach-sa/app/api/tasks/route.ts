import { getChatGPTUser } from "@/app/chatgpt-auth";
import { setTaskStatus } from "@/lib/data";

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json() as { taskId?: number; status?: "todo" | "done" };
  if (!Number.isInteger(body.taskId) || !body.status || !["todo", "done"].includes(body.status)) {
    return Response.json({ error: "Invalid task update" }, { status: 400 });
  }
  const task = await setTaskStatus(user.email, body.taskId!, body.status);
  if (!task) return Response.json({ error: "Task not found" }, { status: 404 });
  return Response.json({ task });
}
