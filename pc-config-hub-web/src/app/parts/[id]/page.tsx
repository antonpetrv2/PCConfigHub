import Link from "next/link";
import { notFound } from "next/navigation";

import CommentsSection from "@/app/comments-section";
import AddPartLauncher from "@/app/parts/add-part-launcher";
import { createPartCommentAction } from "@/actions/comments";
import { categoryLabels } from "@/lib/api/catalog";
import { getCurrentUser } from "@/lib/auth";
import { listPartComments } from "@/services/api/comments-service";
import { getPartById } from "@/services/api/parts-service";

type PartDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ comment?: string | string[] }>;
};

const formatSpecValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

export default async function PartDetailsPage({
  params,
  searchParams,
}: PartDetailsPageProps) {
  const { id } = await params;
  const partId = Number(id);
  if (!Number.isInteger(partId) || partId <= 0) {
    notFound();
  }

  const query = await searchParams;
  const commentStatus = Array.isArray(query.comment)
    ? query.comment[0]
    : query.comment;
  const user = await getCurrentUser();
  const part = await getPartById(partId, user?.id);

  if (!part) {
    notFound();
  }

  const comments = await listPartComments(part.id);
  const specs = Object.entries(part.specs)
    .map(([key, value]) => [key, formatSpecValue(value)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));
  const canEdit = user?.id === part.ownerUserId;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-12 h-64 w-64 rounded-full bg-[#30f2ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-24 h-56 w-56 rounded-full bg-[#ff5bf1]/15 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16">
        <header className="flex flex-col gap-3">
          <Link
            href="/parts"
            className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]"
          >
            Back to parts
          </Link>
          <p className="text-xs uppercase tracking-[0.35em] text-[#30f2ff]">
            {categoryLabels[part.category]}
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
                {part.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#b3b7d4]">
                {part.description ?? "No description yet."}
              </p>
            </div>
            {canEdit ? <AddPartLauncher part={part} /> : null}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121126]/90 shadow-[0_0_32px_rgba(48,242,255,0.12)]">
            <div className="aspect-[4/3] bg-[#15142a] p-4">
              {part.images[0]?.url ? (
                <img
                  src={part.images[0].url}
                  alt={part.images[0].altText ?? part.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 px-5 py-4 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
              <span>{part.visibility}</span>
              <span>{part.approvalStatus}</span>
              {part.manufacturer ? <span>{part.manufacturer}</span> : null}
              {part.model ? <span>{part.model}</span> : null}
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Specifications
            </p>
            {specs.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {specs.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3"
                  >
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#b3b7d4]">
                      {key}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#f2f3ff]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#b3b7d4]">
                No specifications recorded.
              </p>
            )}
          </aside>
        </div>

        <CommentsSection
          action={createPartCommentAction}
          comments={comments}
          currentUser={user}
          hiddenField={{ name: "partId", value: part.id }}
          loginHref={`/login?redirectTo=/parts/${part.id}`}
          status={commentStatus}
        />
      </div>
    </section>
  );
}
