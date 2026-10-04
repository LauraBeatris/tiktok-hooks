"use client";

import { hooksSchema } from "@/lib/stream-hooks";
import { useObject } from "@ai-sdk/react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/hooks",
    schema: hooksSchema,
  });

  const errorCode = getErrorCode(error);
  const limitReached = errorCode === "limit_reached";

  async function upgrade() {
    const response = await fetch("/api/upgrade", { method: "POST " });
    const { url } = await response.json();
    window.location.href = url;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-bold">TikTok hook generator</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit({ topic });
        }}
        className="flex gap-2"
      >
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. meal prep for lazy people"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700"
          >
            Stop
          </button>
        ) : (
          <button className="rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
            Generate
          </button>
        )}
      </form>

      {limitReached && (
        <div className="rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p className="mb-3">You&apos;ve used your free hooks for today.</p>
          <button
            onClick={upgrade}
            className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-black"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {error && !limitReached && (
        <p className="text-red-600">
          {(errorCode && ERROR_MESSAGES[errorCode]) ?? "Something went wrong."}
        </p>
      )}

      <ol className="flex flex-col gap-3">
        {object?.hooks?.map((hook, index) => (
          <li
            key={index}
            className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            {hook}
          </li>
        ))}
      </ol>
    </main>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Too many requests, try again in a minute.",
  invalid_topic: "Add a topic (up to 200 characters).",
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
