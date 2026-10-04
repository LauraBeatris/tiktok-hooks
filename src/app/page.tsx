import { HookGenerator } from "@/components/hook-generator";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { upgraded } = await searchParams;

  return (
    <>
      <div className="backdrop-glow" aria-hidden />
      <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-20 pb-16 sm:pt-28">
        <header className="mb-10 flex flex-col items-center text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-pink" />
            {upgraded ? "You're on Pro. Unlimited hooks." : "3 free hooks a day"}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Stop the scroll
            <span className="text-pink">.</span>
          </h1>
          <p className="mt-3 max-w-sm text-[15px] text-muted text-balance">
            Five opening lines for your next TikTok, written for the first two
            seconds.
          </p>
        </header>

        <HookGenerator />
      </main>
    </>
  );
}
