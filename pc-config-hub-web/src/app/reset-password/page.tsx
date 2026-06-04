import { resetPasswordAction } from "@/actions/auth";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    token?: string | string[];
  }>;
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const getMessage = (error?: string) => {
  if (error === "missing") return "Please complete all fields.";
  if (error === "weak") return "Password must be at least 8 characters.";
  if (error === "mismatch") return "Passwords do not match.";
  if (error === "invalid") return "The reset link is invalid or expired.";
  if (error === "failed") return "Unable to reset password. Try again.";
  return undefined;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = getParam(params.token) ?? "";
  const message = getMessage(getParam(params.error));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-14">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Account recovery
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Choose a new password
          </h1>
        </div>

        <form
          action={resetPasswordAction}
          className="space-y-5 rounded-3xl border border-white/10 bg-[#121126]/90 p-6 shadow-[0_0_32px_rgba(255,91,241,0.16)]"
        >
          {message ? (
            <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-xs text-[#ffd166]">
              {message}
            </div>
          ) : null}
          <input type="hidden" name="token" value={token} />
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
            New password
            <input
              type="password"
              name="password"
              className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base normal-case tracking-normal text-[#f2f3ff]"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base normal-case tracking-normal text-[#f2f3ff]"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-[#30f2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
          >
            Save password
          </button>
        </form>
      </div>
    </div>
  );
}
