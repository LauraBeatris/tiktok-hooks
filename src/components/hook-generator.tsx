"use client";

import { useObject } from "@ai-sdk/react";
import { useState } from "react";
import { HookCard, HookSkeleton } from "@/components/hook-card";
import { UpgradeCard } from "@/components/upgrade-card";
import { hooksSchema } from "@/lib/hooks-schema";

const HOOK_COUNT = 5;

const EXAMPLE_TOPICS = [
  "meal prep for lazy people",
  "budget travel in Japan",
  "learning to code at 30",
  "morning routine for night owls",
];

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Slow down a little. Try again in a minute.",
  invalid_topic: "Add a topic, up to 200 characters.",
};

function getErrorCode(error: Error | undefined) {
  if (!error) {
    return null;
  }
  try {
    return (JSON.parse(error.message) as { error?: string }).error ?? null;
  } catch {
    return null;
  }
}

export function HookGenerator() {
  const [topic, setTopic] = useState("");
  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/hooks",
    schema: hooksSchema,
  });

  const hooks = (object?.hooks ?? []).filter(
    (hook): hook is string => typeof hook === "string",
  );
  const errorCode = getErrorCode(error);
  const limitReached = errorCode === "limit_reached";
  const showSlots = isLoading || hooks.length > 0;
  const slotCount = isLoading ? HOOK_COUNT : hooks.length;

  function generate(nextTopic: string) {
    if (!nextTopic.trim() || isLoading) {
      return;
    }
    submit({ topic: nextTopic });
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          generate(topic);
        }}
        className="flex items-center gap-2 rounded-full border border-border-strong bg-surface p-1.5 pl-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] transition-[border-color,box-shadow] duration-150 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_var(--border)]"
      >
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="What's your video about?"
          aria-label="Video topic"
          maxLength={200}
          className="h-10 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="pressable h-10 w-[104px] shrink-0 rounded-full border border-border-strong text-sm font-medium hover:bg-border"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!topic.trim()}
            className="pressable h-10 w-[104px] shrink-0 rounded-full bg-foreground text-sm font-medium text-background hover:opacity-90 disabled:opacity-30"
          >
            Generate
          </button>
        )}
      </form>

      {!showSlots && !limitReached && (
        <div className="-mt-4 flex flex-wrap items-center justify-center gap-2">
          {EXAMPLE_TOPICS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setTopic(example);
                generate(example);
              }}
              className="pressable rounded-full border border-border px-3 py-1.5 text-[13px] text-muted hover:border-border-strong hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {limitReached && <UpgradeCard />}

      {error && !limitReached && (
        <p role="alert" className="text-center text-sm text-muted">
          {(errorCode && ERROR_MESSAGES[errorCode]) ??
            "Something went wrong. Try again."}
        </p>
      )}

      {showSlots && (
        <ol className="flex flex-col gap-2" aria-busy={isLoading}>
          {Array.from({ length: slotCount }, (_, index) => {
            const hook = hooks[index];
            if (!hook) {
              return <HookSkeleton key={index} />;
            }
            return (
              <HookCard
                key={index}
                index={index}
                hook={hook}
                isStreaming={isLoading && index === hooks.length - 1}
              />
            );
          })}
        </ol>
      )}
    </div>
  );
}
