"use client";

import { useFormStatus } from "react-dom";

type SetupAdminFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  message?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[#30f2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14] transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating admin..." : "Create admin"}
    </button>
  );
}

export default function SetupAdminForm({
  action,
  message,
}: SetupAdminFormProps) {
  return (
    <form
      action={action}
      className="space-y-5 rounded-3xl border border-white/10 bg-[#121126]/90 p-6 shadow-[0_0_32px_rgba(48,242,255,0.2)]"
    >
      {message ? (
        <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-xs text-[#ffd166]">
          {message}
        </div>
      ) : null}
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
        Display name
        <input
          type="text"
          name="displayName"
          placeholder="Admin"
          className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base text-[#f2f3ff]"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
        Email
        <input
          type="email"
          name="email"
          placeholder="admin@example.com"
          className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base text-[#f2f3ff]"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
        Password
        <input
          type="password"
          name="password"
          placeholder="At least 8 characters"
          minLength={8}
          className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base text-[#f2f3ff]"
          required
        />
      </label>
      <SubmitButton />
    </form>
  );
}
