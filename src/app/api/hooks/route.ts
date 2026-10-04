import { autumn, getCustomerId, HOOKS_FEATURE_ID } from "@/lib/autumn";
import { ratelimit } from "@/lib/rate-limit";
import { streamHooks } from "@/lib/stream-hooks";
import { createTextStreamResponse, toTextStream } from "ai";
import { after, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  topic: z.string().trim().min(1).max(200),
});

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

export async function POST(request: Request) {
  const { success } = await ratelimit.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests, try again in a minute." },
      { status: 429 },
    );
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { error: "Add a topic (up to 200 characters)" },
      { status: 400 },
    );
  }

  const customerId = await getCustomerId();
  const { allowed } = await autumn.check({
    customerId,
    featureId: HOOKS_FEATURE_ID,
  });
  if (!allowed) {
    return NextResponse.json({ error: "limit_reached" }, { status: 402 });
  }

  const result = streamHooks({
    topic: body.data.topic,
    abortSignal: request.signal,
  });

  after(async () => {
    try {
      await result.output;
    } catch {
      return;
    }

    await autumn.track({
      customerId,
      featureId: HOOKS_FEATURE_ID,
      value: 1,
    });
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
