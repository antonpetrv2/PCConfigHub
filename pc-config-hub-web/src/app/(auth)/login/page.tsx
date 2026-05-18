"use client";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Member access
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Welcome back
          </h1>
          <p className="text-base text-[#b3b7d4]">
            Resume your active builds inside the neon lab.
          </p>
          <div className="rounded-3xl border border-[#30f2ff]/40 bg-[#0f0e1b]/80 p-6 shadow-[0_0_24px_rgba(48,242,255,0.2)]">
            <p className="text-sm text-[#b3b7d4]">Quick hint</p>
            <p className="mt-2 text-lg font-semibold text-[#f2f3ff]">
              Compatibility checks run instantly after login.
            </p>
          </div>
        </div>

        <form className="space-y-5 rounded-3xl border border-white/10 bg-[#121126]/90 p-6 shadow-[0_0_32px_rgba(255,91,241,0.2)]">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base text-[#f2f3ff]"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
            Password
            <input
              type="password"
              name="password"
              placeholder="Your password"
              className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base text-[#f2f3ff]"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-[#30f2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
