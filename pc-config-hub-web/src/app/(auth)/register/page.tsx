import RegisterForm from "./register-form";
import { registerAction } from "@/actions/auth";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

const getMessage = (error?: string) => {
  if (error === "missing") {
    return "Please complete all fields.";
  }
  if (error === "exists") {
    return "An account with that email already exists.";
  }
  if (error === "weak") {
    return "Password must be at least 8 characters.";
  }
  return undefined;
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const message = getMessage(getParam(params.error));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <RegisterForm action={registerAction} message={message} />

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
