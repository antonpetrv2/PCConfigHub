import { redirect } from "next/navigation";

import {
  approveUserAction,
  deleteUserAction,
  rejectUserAction,
  updateUserRoleAction,
} from "@/actions/admin";
import { getCurrentUser } from "@/lib/auth";
import { listUsersForAdmin, type UserRole } from "@/services/admin-service";

type AdminUsersPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

const roles: UserRole[] = ["admin", "moderator", "user"];

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/admin/users");
  }

  if (currentUser.role !== "admin") {
    redirect("/");
  }

  const params = await searchParams;
  const error = getParam(params.error);
  const users = await listUsersForAdmin();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
          Administration
        </p>
        <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
          User accounts
        </h1>
        <p className="max-w-2xl text-sm text-[#b3b7d4]">
          Approve new registrations, reject accounts, and assign user roles.
        </p>
        <div>
          <a
            href="/moderator"
            className="inline-flex rounded-full border border-[#30f2ff]/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#30f2ff] hover:bg-[#30f2ff]/10"
          >
            Open review queue
          </a>
        </div>
      </div>

      {error === "self-demote" ? (
        <div className="mb-5 rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-sm text-[#ffd166]">
          You cannot remove your own admin role.
        </div>
      ) : null}
      {error === "self-delete" ? (
        <div className="mb-5 rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-sm text-[#ffd166]">
          You cannot delete your own account.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121126]/90">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_1fr] gap-4 border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b3b7d4]">
          <span>User</span>
          <span>Status</span>
          <span>Role</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-white/10">
          {users.map((account) => (
            <div
              key={account.id}
              className="grid gap-4 px-5 py-4 text-sm text-[#f2f3ff] md:grid-cols-[1.1fr_0.7fr_0.7fr_1fr] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {account.displayName ?? "Unnamed user"}
                </p>
                <p className="truncate text-xs text-[#b3b7d4]">
                  {account.email}
                </p>
              </div>
              <span className="w-fit rounded-full border border-white/10 bg-[#0c0b14] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#b3b7d4]">
                {account.approvalStatus}
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-[#30f2ff]">
                {account.role}
              </span>
              <div className="flex flex-wrap gap-2">
                <form action={approveUserAction}>
                  <input type="hidden" name="userId" value={account.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-[#30f2ff]/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#30f2ff] hover:bg-[#30f2ff]/10"
                  >
                    Approve
                  </button>
                </form>
                <form action={rejectUserAction}>
                  <input type="hidden" name="userId" value={account.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-[#ff5bf1]/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5bf1] hover:bg-[#ff5bf1]/10"
                  >
                    Reject
                  </button>
                </form>
                <form action={updateUserRoleAction} className="flex gap-2">
                  <input type="hidden" name="userId" value={account.id} />
                  <select
                    name="role"
                    defaultValue={account.role}
                    className="rounded-full border border-white/10 bg-[#0c0b14] px-3 py-2 text-xs uppercase tracking-[0.12em] text-[#f2f3ff]"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-full bg-[#ffd166] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0c0b14]"
                  >
                    Save
                  </button>
                </form>
                <form action={deleteUserAction}>
                  <input type="hidden" name="userId" value={account.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-400/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-300 hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
