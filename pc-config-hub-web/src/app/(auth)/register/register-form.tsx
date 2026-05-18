"use client";

import { useFormStatus } from "react-dom";

type RegisterFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  message?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[#ff5bf1] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14] transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : "Register"}
    </button>
  );
}

export default function RegisterForm({ action, message }: RegisterFormProps) {
  return (
    <form
      action={action}
      className="order-2 space-y-5 rounded-3xl border border-white/10 bg-[#121126]/90 p-6 shadow-[0_0_32px_rgba(48,242,255,0.2)] lg:order-1"
    >
      {message ? (
        <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-xs text-[#ffd166]">
          {message}
        </div>
      ) : null}
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
          minLength={8}
          required
        />
      </label>
      <SubmitButton />
    </form>
  );
}
