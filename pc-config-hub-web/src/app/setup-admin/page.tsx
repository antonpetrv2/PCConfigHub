import { redirect } from "next/navigation";

import { createFirstAdminAction } from "@/actions/admin";
import { hasAdminUser } from "@/services/admin-service";
import SetupAdminForm from "./setup-admin-form";

type SetupAdminPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const getMessage = (error?: string) => {
  if (error === "missing") {
    return "Please complete all fields.";
  }
  if (error === "weak") {
    return "Password must be at least 8 characters.";
  }
  if (error === "exists") {
    return "An account with that email already exists.";
  }
  return undefined;
};

export default async function SetupAdminPage({
  searchParams,
}: SetupAdminPageProps) {
  if (await hasAdminUser()) {
    redirect("/login");
  }

  const params = await searchParams;
  const message = getMessage(getParam(params.error));

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
          First admin
        </p>
        <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
          Create the control account
        </h1>
        <p className="text-base text-[#b3b7d4]">
          This page is available only until the first administrator exists.
          After that, user management moves into the admin dashboard.
        </p>
      </div>
      <SetupAdminForm action={createFirstAdminAction} message={message} />
    </div>
  );
}
