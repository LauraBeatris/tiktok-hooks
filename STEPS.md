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

Build `POST /api/hooks` that takes `{ topic }` and returns 5 hooks from OpenAI.
Then build a page with an input, a button and a list.

📖 [OpenAI quickstart → Install the OpenAI SDK and run an API call](https://developers.openai.com/api/docs/quickstart)

Use the Responses API (`client.responses.create`, with `instructions` and `input`) and read `response.output_text`.
Model: `gpt-6-luna`, OpenAI's cheapest current model.

**You're done when** you can type a topic and see 5 hooks, as many times as you want.

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
