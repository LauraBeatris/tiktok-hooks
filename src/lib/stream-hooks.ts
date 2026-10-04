import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";

const hooksSchema = z.object({
  hooks: z.array(z.string()).length(5),
});

export async function streamHooks({
  topic,
  onComplete,
}: {
  topic: string;
  onComplete: () => Promise<void>;
}) {
  return streamText({
    model: openai("gpt-6-luna"),
    output: Output.object({ schema: hooksSchema }),
    system:
      "You write opening lines for TikTok videos. Each hook is one short sentence a creator says in the first 2 seconds to stop the scroll.",
    prompt: `Write 5 hooks for this video topic: ${topic}`,
    onFinish: async ({ output }) => {
      if (output) {
        await onComplete();
      }
    },
    onError: ({ error }) => {
      console.error("Hook generation failed", error)
    }
  });
}
