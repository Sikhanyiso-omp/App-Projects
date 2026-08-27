"use client";

import { useState } from "react";

type Task = { id: number; title: string; topic: string; minutes: number; status: string };

export default function TaskList({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  async function toggle(task: Task) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    setTasks((items) => items.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
    const response = await fetch("/api/tasks", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ taskId: task.id, status: nextStatus }) });
    if (!response.ok) setTasks((items) => items.map((item) => item.id === task.id ? task : item));
  }
  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <button className={`task-row ${task.status === "done" ? "done" : ""}`} onClick={() => toggle(task)} key={task.id}>
          <span className="task-check">{task.status === "done" ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span className="task-copy"><b>{task.title}</b><small>{task.topic}</small></span>
          <span className="task-time">{task.minutes} min</span>
        </button>
      ))}
    </div>
  );
}
