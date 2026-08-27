"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function checkout() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = await response.json() as { authorizationUrl?: string; error?: string };
      if (!response.ok || !data.authorizationUrl) throw new Error(data.error || "Checkout could not start.");
      window.location.href = data.authorizationUrl;
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Checkout could not start."); setLoading(false); }
  }
  return <><button className="button button-primary button-block" onClick={checkout} disabled={loading}>{loading ? "Opening secure checkout…" : "Pay R49 securely →"}</button>{error && <div className="checkout-error" role="alert">{error}</div>}</>;
}
