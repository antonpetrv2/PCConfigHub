"use client";

import { useEffect, useMemo, useState } from "react";

import type { ApiCategory } from "@/lib/api/types";
import { categoryLabels, categoryOrder } from "@/lib/api/catalog";

type Part = {
  id: number;
  name: string;
  category: ApiCategory;
  specs: Record<string, unknown>;
};

type CompatibilityResult = {
  compatible: boolean;
  warnings: string[];
  errors: string[];
};

type BuilderClientProps = {
  parts: Part[];
  isLoggedIn: boolean;
};

export default function BuilderClient({ parts, isLoggedIn }: BuilderClientProps) {
  const [selection, setSelection] = useState<Record<ApiCategory, Part | null>>(
    () => ({
      motherboard: null,
      cpu: null,
      gpu: null,
      ram: null,
      psu: null,
      case: null,
      storage: null,
      soundcard: null,
    })
  );
  const [activeCategory, setActiveCategory] = useState<ApiCategory | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [configName, setConfigName] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [status, setStatus] = useState<string | null>(null);

  const partOptions = useMemo(() => {
    return parts.reduce<Record<ApiCategory, Part[]>>(
      (acc, part) => {
        acc[part.category].push(part);
        return acc;
      },
      {
        motherboard: [],
        cpu: [],
        gpu: [],
        ram: [],
        psu: [],
        case: [],
        storage: [],
        soundcard: [],
      }
    );
  }, [parts]);

  const selectedIds = useMemo(() =>
    Object.values(selection)
      .filter((part): part is Part => Boolean(part))
      .map((part) => part.id), [selection]);

  useEffect(() => {
    if (!selectedIds.length) {
      setCompatibility(null);
      return;
    }

    const controller = new AbortController();
    const runCheck = async () => {
      const response = await fetch("/api/configs/check-compatibility", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ parts: selectedIds }),
        signal: controller.signal,
      });

      const json = await response.json();
      if (response.ok) {
        setCompatibility(json.data);
      }
    };

    runCheck();
    return () => controller.abort();
  }, [selectedIds]);

  const handleSave = async () => {
    setStatus(null);

    if (!isLoggedIn) {
      window.location.href = "/login?redirectTo=/builder";
      return;
    }

    if (!configName.trim()) {
      setStatus("Configuration name is required.");
      return;
    }

    if (!selection.case) {
      setStatus("A case is required.");
      return;
    }

    const response = await fetch("/api/configs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: configName,
        visibility,
        parts: selectedIds,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      setStatus(json.error ?? "Failed to save configuration.");
      return;
    }

    window.location.href = `/configurations/${json.data.id}`;
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[#0f0e1b]/90 p-6">
          <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
            Build slots
          </h2>
          <div className="mt-6 space-y-4">
            {categoryOrder.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#121126] px-4 py-3"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                    {categoryLabels[category]}
                  </p>
                  <p className="text-sm text-[#f2f3ff]">
                    {selection[category]?.name ?? "Not selected"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selection[category] ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSelection((prev) => ({ ...prev, [category]: null }))
                      }
                      className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-[#b3b7d4]"
                    >
                      Clear
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className="rounded-full bg-[#30f2ff] px-3 py-1 text-xs font-semibold uppercase text-[#0c0b14]"
                  >
                    Choose part
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Configuration details
            </p>
            <div className="mt-3 space-y-3">
              <input
                className="w-full rounded-2xl border border-white/10 bg-[#0f0e1b] px-4 py-2"
                placeholder="Configuration name"
                value={configName}
                onChange={(event) => setConfigName(event.target.value)}
              />
              <select
                className="w-full rounded-2xl border border-white/10 bg-[#0f0e1b] px-4 py-2"
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as "private" | "public")
                }
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0f0e1b]/90 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Compatibility status
            </p>
            <div className="mt-3 space-y-3 text-sm">
              {compatibility?.errors?.length ? (
                <div className="rounded-2xl border border-[#ff5bf1]/40 bg-[#1a1122] px-4 py-3 text-[#ff5bf1]">
                  {compatibility.errors.map((issue) => (
                    <p key={issue}>{issue}</p>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#30f2ff]/40 bg-[#0f1622] px-4 py-3 text-[#30f2ff]">
                  {compatibility
                    ? "All selected components are compatible."
                    : "Select parts to run compatibility check."}
                </div>
              )}
              {compatibility?.warnings?.length ? (
                <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-[#ffd166]">
                  {compatibility.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : null}
            </div>

            {status ? <p className="mt-3 text-xs text-[#ffd166]">{status}</p> : null}

            <button
              type="button"
              onClick={handleSave}
              className="mt-4 w-full rounded-full bg-[#30f2ff] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#0c0b14]"
            >
              Save configuration
            </button>
          </div>
        </div>
      </div>

      {activeCategory ? (
        <PartPicker
          category={activeCategory}
          parts={partOptions[activeCategory]}
          onClose={() => setActiveCategory(null)}
          onSelect={(part) => {
            setSelection((prev) => ({ ...prev, [activeCategory]: part }));
            setActiveCategory(null);
          }}
        />
      ) : null}
    </div>
  );
}

type PartPickerProps = {
  category: ApiCategory;
  parts: Part[];
  onSelect: (part: Part) => void;
  onClose: () => void;
};

function PartPicker({ category, parts, onSelect, onClose }: PartPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl space-y-4 rounded-3xl border border-white/10 bg-[#0f0e1b] p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-xl text-[#f2f3ff]">
            Choose {categoryLabels[category]}
          </h3>
          <button onClick={onClose} className="text-xs uppercase text-[#b3b7d4]">
            Close
          </button>
        </div>
        <div className="max-h-[360px] space-y-2 overflow-y-auto text-sm text-[#b3b7d4]">
          {parts.length === 0 ? (
            <p>No parts available.</p>
          ) : (
            parts.map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => onSelect(part)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#121126] px-4 py-3 text-left"
              >
                <span className="text-[#f2f3ff]">{part.name}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[#30f2ff]">
                  Select
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
