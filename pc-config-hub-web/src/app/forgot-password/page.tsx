import { forgotPasswordAction } from "@/actions/auth";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    resetUrl?: string | string[];
    sent?: string | string[];
  }>;
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const error = getParam(params.error);
  const sent = getParam(params.sent);
  const resetUrl = getParam(params.resetUrl);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-14">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Account recovery
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Reset your password
          </h1>
        </div>

        <form
          action={forgotPasswordAction}
          className="space-y-5 rounded-3xl border border-white/10 bg-[#121126]/90 p-6 shadow-[0_0_32px_rgba(48,242,255,0.16)]"
        >
          {error === "missing" ? (
            <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-xs text-[#ffd166]">
              Please enter your email.
            </div>
          ) : null}
          {sent === "1" ? (
            <div className="rounded-2xl border border-[#30f2ff]/40 bg-[#0f0e1b] px-4 py-3 text-sm text-[#b3b7d4]">
              If the account exists, a reset link has been created.
              {resetUrl ? (
                <a
                  className="mt-3 block break-all font-semibold text-[#30f2ff]"
                  href={resetUrl}
                >
                  {resetUrl}
                </a>
              ) : null}
            </div>
          ) : null}
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-base normal-case tracking-normal text-[#f2f3ff]"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-[#30f2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
          >
            Create reset link
          </button>
        </form>
      </div>
    </div>
  );
}
