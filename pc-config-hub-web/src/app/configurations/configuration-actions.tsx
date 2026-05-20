"use client";

import { useState } from "react";

import BuilderClient from "@/app/builder/builder-client";
import type { ApiCategory } from "@/lib/api/types";

type Part = {
  id: number;
  name: string;
  category: ApiCategory;
  specs: Record<string, unknown>;
};

type ConfigurationActionsProps = {
  config: {
    id: number;
    name: string;
    description: string | null;
    visibility: "private" | "public";
    parts: Array<{ id: number }>;
  };
  parts: Part[];
};

export default function ConfigurationActions({
  config,
  parts,
}: ConfigurationActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this configuration? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    setStatus(null);
    const response = await fetch(`/api/configs/${config.id}`, {
      method: "DELETE",
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus(json?.error ?? "Failed to delete configuration.");
      return;
    }

    window.location.href = "/configurations";
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-full bg-[#30f2ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
        >
          Edit configuration
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-full border border-[#ff5bf1]/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8af5]"
        >
          Delete
        </button>
        {status ? <p className="text-xs text-[#ffd166]">{status}</p> : null}
      </div>

      {isEditing ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">
          <div className="mx-auto flex min-h-full w-full max-w-6xl items-center py-8">
            <div className="w-full rounded-3xl border border-white/10 bg-[#0c0b14] p-5 shadow-[0_0_40px_rgba(48,242,255,0.2)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
                  Edit configuration
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]"
                >
                  Close
                </button>
              </div>
              <BuilderClient
                parts={parts}
                isLoggedIn
                configId={config.id}
                initialName={config.name}
                initialDescription={config.description}
                initialVisibility={config.visibility}
                initialPartIds={config.parts.map((part) => part.id)}
                submitLabel="Save changes"
                onSaved={() => {
                  setIsEditing(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
