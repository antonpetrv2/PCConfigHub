import LoginForm from "./login-form";
import { loginAction } from "@/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    registered?: string | string[];
    redirectTo?: string | string[];
  }>;
};

const getMessage = (error?: string, registered?: string) => {
  if (registered === "1") {
    return "Registration submitted. Awaiting approval before login.";
  }
  if (registered === "admin") {
    return "Admin account created. You can log in now.";
  }
  if (error === "missing") {
    return "Please fill in both fields.";
  }
  if (error === "invalid") {
    return "Invalid email or password.";
  }
  if (error === "pending") {
    return "Your account is pending approval.";
  }
  return undefined;
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const message = getMessage(
    getParam(params.error),
    getParam(params.registered)
  );
  const redirectTo = getParam(params.redirectTo) ?? "/";

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
        <LoginForm
          action={loginAction}
          message={message}
          redirectTo={redirectTo}
        />
      </div>
    </div>
  );
}
