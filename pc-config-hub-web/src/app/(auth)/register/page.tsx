"use client";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <form className="order-2 space-y-5 rounded-3xl border border-white/10 bg-[#121126]/90 p-6 shadow-[0_0_32px_rgba(48,242,255,0.2)] lg:order-1">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5bf1]">
            Display name
            <input
              type="text"
              name="displayName"
              placeholder="Your name"
              className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base text-[#f2f3ff]"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5bf1]">
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base text-[#f2f3ff]"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5bf1]">
            Password
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base text-[#f2f3ff]"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-[#ff5bf1] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
          >
            Register
          </button>
        </form>

        <div className="order-1 space-y-4 lg:order-2">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            New here
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Create your account
          </h1>
          <p className="text-base text-[#b3b7d4]">
            Save configurations, track parts, and share public builds when ready.
          </p>
          <div className="rounded-3xl border border-[#ff5bf1]/40 bg-[#0f0e1b]/80 p-6 shadow-[0_0_24px_rgba(255,91,241,0.2)]">
            <p className="text-sm text-[#b3b7d4]">Get started with</p>
            <p className="mt-2 text-lg font-semibold text-[#f2f3ff]">
              A private workspace for every build.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
