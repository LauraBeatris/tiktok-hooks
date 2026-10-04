import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRatelimit() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    console.warn("Upstash env vars are missing, rate limiting is disabled");
    return null;
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "tiktok-hooks",
  });
}

const ratelimit = createRatelimit();

export async function isRateLimited(identifier: string) {
  if (!ratelimit) {
    return false;
  }

  const { success } = await ratelimit.limit(identifier);
  return !success;
}
