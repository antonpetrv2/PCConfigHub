import { changePasswordAction } from "@/actions/auth";
import ChangePasswordForm from "./change-password-form";

type ChangePasswordPageProps = {
  searchParams: Promise<{
    changed?: string | string[];
    error?: string | string[];
  }>;
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const getMessage = (error?: string, changed?: string) => {
  if (changed === "1") return "Password changed.";
  if (error === "missing") return "Please complete all fields.";
  if (error === "weak") return "New password must be at least 8 characters.";
  if (error === "mismatch") return "Passwords do not match.";
  if (error === "incorrect") return "Current password is incorrect.";
  if (error === "failed") return "Unable to change password. Try again.";
  return undefined;
};

export default async function ChangePasswordPage({
  searchParams,
}: ChangePasswordPageProps) {
  const params = await searchParams;
  const message = getMessage(getParam(params.error), getParam(params.changed));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-14">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Account security
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Change password
          </h1>
        </div>

        <ChangePasswordForm action={changePasswordAction} message={message} />
      </div>
    </div>
  );
}
