"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type LoginFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  message?: string;
  redirectTo: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[#30f2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14] transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Logging in..." : "Login"}
    </button>
  );
}

export default function LoginForm({
  action,
  message,
  redirectTo,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      action={action}
      className="space-y-5 rounded-3xl border border-white/10 bg-[#121126]/90 p-6 shadow-[0_0_32px_rgba(255,91,241,0.2)]"
    >
      {message ? (
        <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-xs text-[#ffd166]">
          {message}
        </div>
      ) : null}
      <input type="hidden" name="redirectTo" value={redirectTo} />
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
        <span className="flex overflow-hidden rounded-2xl border border-white/10 bg-[#0c0b14] focus-within:border-[#30f2ff]/60">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Your password"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base normal-case tracking-normal text-[#f2f3ff] outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="border-l border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff5bf1] transition hover:bg-[#ff5bf1]/10"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      <SubmitButton />
    </form>
  );
}
