import Link from "next/link";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";

export default function AppShell({
  children,
  active,
  user,
}: {
  children: React.ReactNode;
  active: "dashboard" | "learn" | "mock" | "admin";
  user: { displayName: string; email: string };
}) {
  const initial = user.displayName.trim().charAt(0).toUpperCase() || "S";
  return (
    <div className="product-shell">
      <aside className="product-sidebar">
        <Link className="brand" href="/"><span className="brand-mark">EC</span><span>ExamCoach <b>SA</b></span></Link>
        <nav aria-label="Student app">
          <Link className={active === "dashboard" ? "active" : ""} href="/dashboard"><span>⌂</span>Overview</Link>
          <Link className={active === "learn" ? "active" : ""} href="/learn"><span>▤</span>Lessons</Link>
          <Link className={active === "mock" ? "active" : ""} href="/mock"><span>◷</span>Mock test</Link>
        </nav>
        <div className="sidebar-foot">
          <Link href="/support"><span>?</span>Help & feedback</Link>
          <div className="user-chip">
            <i>{initial}</i>
            <div><b>{user.displayName}</b><span>{user.email}</span></div>
          </div>
          <a className="signout-link" href={chatGPTSignOutPath("/")}>Sign out</a>
        </div>
      </aside>
      <div className="product-main">{children}</div>
    </div>
  );
}
