import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://examcoach-sa.essential59.chatgpt.site"),
  title: "ExamCoach SA | Know what to study",
  description: "Method-aligned lessons, exam-style practice and a clear daily plan for South African university students.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "ExamCoach SA | Walk in ready",
    description: "Know what to study, practise the right method and prove you are ready.",
    type: "website",
    url: "https://examcoach-sa.essential59.chatgpt.site",
    siteName: "ExamCoach SA",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ExamCoach SA — Know what to study. Walk in ready." }],
  },
  twitter: { card: "summary_large_image", title: "ExamCoach SA | Walk in ready", description: "Know what to study, practise the right method and prove you are ready.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
