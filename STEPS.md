# Build it step by step

Goal: a TikTok hook generator. Free users get 3 hooks a day, Pro users ($5/month) get unlimited.

Each step lists what to build, where to read, and how to know it works.
Stuck? Peek at the reference implementation for one file:

```bash
git show solution:src/lib/autumn.ts
```

---

## Step 0 — Learn the vocabulary (15 min)

No code. Read these three pages, in order:

- [Features](https://docs.useautumn.com/documentation/concepts/features): what you're limiting (`hooks`)
- [Plans](https://docs.useautumn.com/documentation/concepts/plans): bundles of features with a price (`free`, `pro`)
- [Balances](https://docs.useautumn.com/documentation/concepts/balances): how many uses a customer has left, and when it resets

**You're done when** you can explain the difference between a feature, a plan and a balance.

## Step 1 — Model your pricing in the dashboard

In the Autumn dashboard, in **sandbox** mode:

- a metered feature with ID `hooks`
- a `free` plan: 3 `hooks`, resetting daily, set as the **default** plan
- a `pro` plan: $5/month, unlimited `hooks`

📖 [Setup → Create your pricing plans](https://docs.useautumn.com/documentation/getting-started/setup#create-your-pricing-plans)

**You're done when** both plans show up in the dashboard and `free` is marked as the default.

## Step 2 — Create the Autumn client

Get a sandbox secret key and put it in `.env.local` (copy `.env.example`).
Create `src/lib/autumn.ts` that exports an `Autumn` client.

📖 [Setup → Installation](https://docs.useautumn.com/documentation/getting-started/setup#installation)

**You're done when** the client is exported and `pnpm exec tsc --noEmit` passes.

## Step 3 — Create a customer

There's no login, so make one up: on the first request, generate a random ID, save it in a cookie, and call `autumn.customers.getOrCreate` with it.

📖 [Setup → Create an Autumn customer](https://docs.useautumn.com/documentation/getting-started/setup#create-an-autumn-customer)
📖 [API reference → Get or Create Customer](https://docs.useautumn.com/api-reference/customers/getOrCreateCustomer)

Hint: in a route handler, `cookies()` from `next/headers` can read and set cookies.

**You're done when** your customer appears under **Customers** in the dashboard, already on the `free` plan.

## Step 4 — Generate hooks (no Autumn yet)

Build `POST /api/hooks` in `src/app/api/hooks/route.ts` that takes `{ topic }` and returns 5 hooks.
Then build a page with an input, a button and a list.

Use zod twice:
- **Request body**: parse `{ topic }` with a schema (non-empty, max ~200 chars) and return `400` when it fails. Use `safeParse` so you get a result instead of a thrown error.
- **Model output**: describe the answer as `z.object({ hooks: z.array(z.string()).length(5) })` and let the AI SDK enforce it. No more splitting text by newlines.

📖 [Next.js → Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers): the file must be named `route.ts`
📖 [AI SDK → Generating Structured Data → Generating Structured Outputs](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data#generating-structured-outputs): `generateText` with `output: Output.object({ schema })`
📖 [AI SDK → OpenAI provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai): `import { openai } from "@ai-sdk/openai"`, then `model: openai("gpt-6-luna")`
📖 [Zod → Basic usage](https://zod.dev/basics): `safeParse`

Model: `gpt-6-luna`, OpenAI's cheapest current model. The provider reads `OPENAI_API_KEY` from env.

**You're done when** you can type a topic and see 5 hooks, as many times as you want, and an empty topic gets a 400.

## Step 4.5 — Rate limit by IP

Autumn's daily limit follows the **cookie**. Clear cookies or open an incognito window and you're a new customer with 3 fresh hooks. A rate limit keyed on the **IP address** closes that gap and stops someone from spamming your OpenAI bill.

Create a free Redis database on Upstash and add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`.
Allow something like 5 requests per minute per IP. Run it **first** in the route, before Autumn and before OpenAI, and return `429` when it fails.

📖 [Upstash Ratelimit → Getting started](https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted): `Ratelimit.slidingWindow` and `ratelimit.limit(identifier)`
📖 [Vercel → Request headers → x-forwarded-for](https://vercel.com/docs/headers/request-headers#x-forwarded-for): where the client IP comes from

Think about it: Autumn's limit and this one answer different questions. Autumn asks "what did they pay for?" The rate limit asks "is this abuse?" Which one should send the user to the upgrade box?

**You're done when** clicking Generate 6 times in a minute gets a 429 on the 6th.

Order of checks in the route after step 6: **rate limit → validate body → customer → `check` → generate → `track`**. Cheapest and most likely to reject goes first.

## Step 5 — Gate it with `check`

Before calling OpenAI, ask Autumn if the customer is allowed. If not, return `402`.

📖 [Checking and tracking → Checking feature access](https://docs.useautumn.com/documentation/getting-started/gating#checking-feature-access)
📖 [API reference → Check](https://docs.useautumn.com/api-reference/core/check)

**You're done when** the code compiles. It won't block anything yet. Can you guess why before reading step 6?

## Step 6 — Record usage with `track`

After OpenAI succeeds, tell Autumn one hook generation was used.

📖 [Checking and tracking → Tracking usage](https://docs.useautumn.com/documentation/getting-started/gating#tracking-usage)
📖 [API reference → Track](https://docs.useautumn.com/api-reference/core/track)

Think about it: why `check` **before** the work and `track` **after**?

**You're done when** the 4th generation of the day returns 402 and the dashboard shows a balance of 0.
Show an "Upgrade" box in the UI when you get a 402.

🔗 At Resend: `packages/billing/src/emails-enforcement.ts` (check) and `packages/billing/src/emails-usage-queue.ts` (track).

## Step 7 — Upgrade with `attach`

Connect Stripe (test mode) in the dashboard. Build `POST /api/upgrade` that calls `autumn.billing.attach` for `pro` and returns `paymentUrl`. Redirect the browser to it.

📖 [Setup → Stripe payment flow](https://docs.useautumn.com/documentation/getting-started/setup#stripe-payment-flow)
📖 [API reference → Attach](https://docs.useautumn.com/api-reference/billing/attach) (look at `successUrl`)
📖 [Stripe Sync](https://docs.useautumn.com/documentation/concepts/stripe)

**You're done when** you can pay with `4242 4242 4242 4242`, land back on the app, and generate past the limit.

🔗 At Resend: `apps/dashboard/src/routers/billing.ts` (search for `billing.attach`).

---

## Stretch goals

### Show "2 hooks left today"
Read the customer's balance and show it under the button.
📖 [Balances](https://docs.useautumn.com/documentation/concepts/balances) and [Managing Customers](https://docs.useautumn.com/api-reference/customers/managing-customers)

### Cancel Pro
Add a "Cancel" button that downgrades back to free.
📖 [Subscriptions](https://docs.useautumn.com/documentation/concepts/subscriptions) and [API reference → Update Subscription](https://docs.useautumn.com/api-reference/billing/billingUpdate)

### Deploy
📖 [Deploy to production](https://docs.useautumn.com/documentation/getting-started/deploy)
Then run `vercel deploy` and add the env vars in Vercel.
