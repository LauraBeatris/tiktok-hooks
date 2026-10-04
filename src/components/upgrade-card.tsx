"use client";

import { useState } from "react";

export function UpgradeCard() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function upgrade() {
    setIsRedirecting(true);
    setFailed(false);

    const response = await fetch("/api/upgrade", { method: "POST" });
    if (!response.ok) {
      setIsRedirecting(false);
      setFailed(true);
      return;
    }

    const { url } = (await response.json()) as { url: string };
    window.location.href = url;
  }

  return (
    <section className="card-enter gradient-border rounded-2xl p-6">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-pink">
        Daily limit reached
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">
        You&apos;ve used today&apos;s 3 free hooks
      </h2>
      <p className="mt-1 text-sm text-muted">
        Go Pro for unlimited hooks. $5/month, cancel anytime.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={upgrade}
          disabled={isRedirecting}
          className="pressable h-10 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {isRedirecting ? "Opening checkout…" : "Upgrade to Pro"}
        </button>
        {failed && (
          <p className="text-sm text-muted">
            Couldn&apos;t start checkout. Try again.
          </p>
        )}
      </div>
    </section>
  );
}
