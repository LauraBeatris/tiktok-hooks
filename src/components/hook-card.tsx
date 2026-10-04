"use client";

import { useEffect, useState } from "react";

const COPIED_RESET_MS = 1400;

export function HookCard({
  index,
  hook,
  isStreaming,
}: {
  index: number;
  hook: string;
  isStreaming: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    await navigator.clipboard.writeText(hook);
    setCopied(true);
  }

  return (
    <li className="hook-enter group flex items-start gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
      <span className="pt-0.5 font-mono text-xs tabular-nums text-subtle">
        {String(index + 1).padStart(2, "0")}
      </span>
      <p
        className={`flex-1 text-[15px] leading-relaxed text-pretty ${isStreaming ? "caret" : ""}`}
      >
        {hook}
      </p>
      {!isStreaming && (
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy hook"}
          className="pressable reveal-on-hover -my-1 -mr-2 shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-border hover:text-foreground"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </li>
  );
}

export function HookSkeleton() {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-[18px]">
      <span className="h-3 w-4 rounded skeleton" />
      <span className="h-3 flex-1 rounded skeleton" />
    </li>
  );
}
