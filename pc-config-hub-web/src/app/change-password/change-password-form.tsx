"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type ChangePasswordFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  message?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[#30f2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Changing..." : "Change password"}
    </button>
  );
}

function PasswordField({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
      {label}
      <span className="flex overflow-hidden rounded-2xl border border-white/10 bg-[#0c0b14] focus-within:border-[#30f2ff]/60">
        <input
          type={isVisible ? "text" : "password"}
          name={name}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base normal-case tracking-normal text-[#f2f3ff] outline-none"
          required
        />
        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          className="border-l border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff5bf1] transition hover:bg-[#ff5bf1]/10"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}

export default function ChangePasswordForm({
  action,
  message,
}: ChangePasswordFormProps) {
  return (
    <form
      action={action}
      className="space-y-5 rounded-3xl border border-white/10 bg-[#121126]/90 p-6 shadow-[0_0_32px_rgba(48,242,255,0.16)]"
    >
      {message ? (
        <div className="rounded-2xl border border-[#30f2ff]/40 bg-[#0f0e1b] px-4 py-3 text-sm text-[#b3b7d4]">
          {message}
        </div>
      ) : null}
      <PasswordField label="Current password" name="currentPassword" />
      <PasswordField label="New password" name="newPassword" />
      <PasswordField label="Confirm password" name="confirmPassword" />
      <SubmitButton />
    </form>
  );
}
