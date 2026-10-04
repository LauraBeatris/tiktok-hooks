import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { hooksSchema } from "./hooks-schema";

export function streamHooks({
  topic,
  abortSignal,
}: {
  topic: string;
  abortSignal: AbortSignal;
}) {
  return streamText({
    model: openai("gpt-6-luna"),
    output: Output.object({ schema: hooksSchema }),
    system:
      "You write opening lines for TikTok videos. Each hook is one short sentence a creator says in the first 2 seconds to stop the scroll.",
    prompt: `Write 5 hooks for this video topic: ${topic}`,
    abortSignal,
    onError: ({ error }) => {
      console.error("Hook generation failed", error)
    }
  });
}
