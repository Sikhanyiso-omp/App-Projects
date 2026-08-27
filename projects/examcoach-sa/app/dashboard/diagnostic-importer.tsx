"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const STORAGE_KEY = "examcoach:pending-diagnostic";

export default function DiagnosticImporter() {
  const router = useRouter();
  const importing = useRef(false);

  useEffect(() => {
    if (importing.current) return;
    const pending = window.localStorage.getItem(STORAGE_KEY);
    if (!pending) return;
    importing.current = true;

    void (async () => {
      try {
        const result = JSON.parse(pending) as Record<string, unknown>;
        const response = await fetch("/api/attempts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(result),
        });
        if (!response.ok) throw new Error("Diagnostic import failed");
        window.localStorage.removeItem(STORAGE_KEY);
        router.refresh();
      } catch {
        importing.current = false;
      }
    })();
  }, [router]);

  return null;
}
