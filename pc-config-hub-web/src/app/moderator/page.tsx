import Link from "next/link";
import { redirect } from "next/navigation";

import {
  moderatorApproveCommentAction,
  moderatorApproveUserAction,
  moderatorBulkDeleteCommentsAction,
  moderatorDeleteCommentAction,
  moderatorRejectUserAction,
} from "@/actions/moderation";
import { getCurrentUser } from "@/lib/auth";
import {
  listPendingCommentsForModeration,
  listPendingUsersForModeration,
} from "@/services/admin-service";

type ModeratorPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const getCommentTarget = (comment: {
  componentId: number | null;
  componentName: string | null;
  configurationId: number | null;
  configurationName: string | null;
}) => {
  if (comment.componentId) {
    return {
      href: `/parts/${comment.componentId}`,
      label: comment.componentName ?? `Part #${comment.componentId}`,
      type: "Part",
    };
  }

  if (comment.configurationId) {
    return {
      href: `/configurations/${comment.configurationId}`,
      label:
        comment.configurationName ??
        `Configuration #${comment.configurationId}`,
      type: "Configuration",
    };
  }

  return { href: "#", label: "Unknown target", type: "Unknown" };
};

const getSpamSignals = (body: string) => {
  const lower = body.toLowerCase();
  const links = body.match(/https?:\/\//g)?.length ?? 0;
  const signals = [
    links >= 2 ? `${links} links` : null,
    lower.includes("free") ? "free" : null,
    lower.includes("crypto") ? "crypto" : null,
    lower.includes("casino") ? "casino" : null,
    lower.includes("loan") ? "loan" : null,
    body.length < 8 ? "very short" : null,
  ].filter((value): value is string => Boolean(value));

  return signals;
};

export default async function ModeratorPage({
  searchParams,
}: ModeratorPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/moderator");
  }

  if (user.role !== "admin" && user.role !== "moderator") {
    redirect("/");
  }

  const params = await searchParams;
  const error = getParam(params.error);
  const [pendingUsers, pendingComments] = await Promise.all([
    listPendingUsersForModeration(),
    listPendingCommentsForModeration(),
  ]);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-12 h-64 w-64 rounded-full bg-[#30f2ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-24 h-56 w-56 rounded-full bg-[#ff5bf1]/15 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Moderation
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Review queue
          </h1>
          <p className="max-w-2xl text-sm text-[#b3b7d4]">
            Approve new users and process pending comments. Moderators cannot
            assign roles, delete users, or access admin-only account controls.
          </p>
        </header>

        {error === "no-comments-selected" ? (
          <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-sm text-[#ffd166]">
            Select at least one comment before bulk deleting.
          </div>
        ) : null}

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b3b7d4]">
                Users
              </p>
              <h2 className="mt-2 font-[var(--font-display)] text-2xl text-[#f2f3ff]">
                Pending user approval
              </h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
              {pendingUsers.length} waiting
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
              No pending users.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121126]/90">
              <div className="grid grid-cols-[1.2fr_0.6fr_0.8fr] gap-4 border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b3b7d4]">
                <span>User</span>
                <span>Role</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-white/10">
                {pendingUsers.map((account) => (
                  <div
                    key={account.id}
                    className="grid gap-4 px-5 py-4 text-sm text-[#f2f3ff] md:grid-cols-[1.2fr_0.6fr_0.8fr] md:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {account.displayName ?? "Unnamed user"}
                      </p>
                      <p className="truncate text-xs text-[#b3b7d4]">
                        {account.email}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.16em] text-[#30f2ff]">
                      {account.role}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <form action={moderatorApproveUserAction}>
                        <input type="hidden" name="userId" value={account.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-[#30f2ff]/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#30f2ff] hover:bg-[#30f2ff]/10"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={moderatorRejectUserAction}>
                        <input type="hidden" name="userId" value={account.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-[#ff5bf1]/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5bf1] hover:bg-[#ff5bf1]/10"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b3b7d4]">
                Comments
              </p>
              <h2 className="mt-2 font-[var(--font-display)] text-2xl text-[#f2f3ff]">
                Pending comment review
              </h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
              {pendingComments.length} waiting
            </span>
          </div>

          {pendingComments.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
              No pending comments.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <form
                  id="bulk-delete-comments"
                  action={moderatorBulkDeleteCommentsAction}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-red-400/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-300 hover:bg-red-400/10"
                  >
                    Delete selected spam
                  </button>
                </form>
              </div>
              <div className="space-y-3">
                {pendingComments.map((comment) => {
                  const target = getCommentTarget(comment);
                  const spamSignals = getSpamSignals(comment.body);

                  return (
                    <article
                      key={comment.id}
                      className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <label className="flex min-w-0 flex-1 gap-3">
                          <input
                            form="bulk-delete-comments"
                            type="checkbox"
                            name="commentIds"
                            value={comment.id}
                            className="mt-1 h-4 w-4 accent-[#ff5bf1]"
                          />
                          <span className="min-w-0">
                            <span className="block text-xs uppercase tracking-[0.24em] text-[#30f2ff]">
                              {comment.authorName ??
                                comment.authorEmail ??
                                `User #${comment.authorUserId}`}
                            </span>
                            <span className="mt-1 block text-xs text-[#b3b7d4]">
                              {comment.authorEmail}
                            </span>
                          </span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <form action={moderatorApproveCommentAction}>
                            <input
                              type="hidden"
                              name="commentId"
                              value={comment.id}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-[#30f2ff]/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#30f2ff] hover:bg-[#30f2ff]/10"
                            >
                              Approve
                            </button>
                          </form>
                          <form action={moderatorDeleteCommentAction}>
                            <input
                              type="hidden"
                              name="commentId"
                              value={comment.id}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-red-400/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-300 hover:bg-red-400/10"
                            >
                              Delete spam
                            </button>
                          </form>
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#0c0b14] p-4 text-sm leading-6 text-[#f2f3ff]">
                        {comment.body}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#b3b7d4]">
                        <span>{target.type}</span>
                        <Link href={target.href} className="text-[#30f2ff]">
                          {target.label}
                        </Link>
                        {spamSignals.length ? (
                          <span className="rounded-full border border-[#ffd166]/40 px-3 py-1 text-[#ffd166]">
                            Signals: {spamSignals.join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
