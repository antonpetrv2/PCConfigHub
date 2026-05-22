import Link from "next/link";

import type { CurrentUser } from "@/lib/auth";

type Comment = {
  id: number;
  authorUserId: number;
  authorName: string | null;
  authorEmail: string;
  body: string;
  createdAt: string | Date;
};

type CommentsSectionProps = {
  action: (formData: FormData) => Promise<void>;
  comments: Comment[];
  currentUser: CurrentUser | null;
  hiddenField: { name: string; value: number };
  loginHref: string;
  status?: string;
};

const formatAuthor = (comment: Comment) =>
  comment.authorName ?? comment.authorEmail ?? `User #${comment.authorUserId}`;

export default function CommentsSection({
  action,
  comments,
  currentUser,
  hiddenField,
  loginHref,
  status,
}: CommentsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#b3b7d4]">
            Community
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-2xl text-[#f2f3ff]">
            Comments
          </h2>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
          {comments.length} approved
        </span>
      </div>

      {status === "pending" ? (
        <div className="rounded-2xl border border-[#30f2ff]/40 bg-[#0f1622] px-4 py-3 text-sm text-[#30f2ff]">
          Comment submitted. A moderator will review it before it becomes public.
        </div>
      ) : null}
      {status === "invalid" ? (
        <div className="rounded-2xl border border-[#ff5bf1]/40 bg-[#1a1122] px-4 py-3 text-sm text-[#ff5bf1]">
          Comments must be between 2 and 1000 characters.
        </div>
      ) : null}

      {currentUser ? (
        <form
          action={action}
          className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5"
        >
          <input type="hidden" name={hiddenField.name} value={hiddenField.value} />
          <label
            htmlFor={`comment-${hiddenField.name}-${hiddenField.value}`}
            className="text-xs uppercase tracking-[0.25em] text-[#b3b7d4]"
          >
            Add comment
          </label>
          <textarea
            id={`comment-${hiddenField.name}-${hiddenField.value}`}
            name="body"
            minLength={2}
            maxLength={1000}
            required
            rows={4}
            className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 text-sm text-[#f2f3ff] outline-none transition focus:border-[#30f2ff]/70"
            placeholder="Share build notes, compatibility tips, or feedback."
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#b3b7d4]">
              New comments stay hidden until moderator approval.
            </p>
            <button
              type="submit"
              className="rounded-full bg-[#30f2ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0c0b14]"
            >
              Submit
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
          <Link href={loginHref} className="text-[#30f2ff]">
            Login
          </Link>{" "}
          to add a comment.
        </div>
      )}

      {comments.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
          No approved comments yet.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-2xl border border-white/10 bg-[#121126]/90 p-4 text-sm text-[#b3b7d4]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.2em] text-[#30f2ff]">
                  {formatAuthor(comment)}
                </p>
                <time className="text-xs uppercase tracking-[0.18em] text-[#b3b7d4]">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#f2f3ff]">
                {comment.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
