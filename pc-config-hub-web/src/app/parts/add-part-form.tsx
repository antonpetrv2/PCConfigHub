"use client";

import { useMemo, useState } from "react";

import type { ApiCategory } from "@/lib/api/types";
import { categoryLabels, categoryOrder } from "@/lib/api/catalog";

type AddPartFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormState = {
  name: string;
  manufacturer: string;
  model: string;
  description: string;
  visibility: "private" | "public";
  category: ApiCategory;
  specs: Record<string, string>;
};

const initialState: FormState = {
  name: "",
  manufacturer: "",
  model: "",
  description: "",
  visibility: "private",
  category: "motherboard",
  specs: {},
};

const specFields: Record<
  ApiCategory,
  Array<{ key: string; label: string; placeholder?: string }>
> = {
  motherboard: [
    { key: "socket", label: "CPU socket" },
    { key: "formFactor", label: "Form factor" },
    { key: "ramSlots", label: "RAM slots" },
    { key: "ramType", label: "RAM type" },
    { key: "pciSlots", label: "PCI slots (comma-separated)" },
  ],
  cpu: [
    { key: "socket", label: "Socket" },
    { key: "tdp", label: "TDP (W)" },
    { key: "cores", label: "Cores" },
    { key: "threads", label: "Threads" },
  ],
  gpu: [
    { key: "pciSlot", label: "PCI slot" },
    { key: "tdp", label: "TDP (W)" },
    { key: "vram", label: "VRAM (GB)" },
    { key: "length", label: "Length (mm)" },
  ],
  ram: [
    { key: "type", label: "RAM type" },
    { key: "capacity", label: "Capacity (GB)" },
    { key: "speed", label: "Speed (MHz)" },
    { key: "slots", label: "Slots" },
  ],
  psu: [
    { key: "wattage", label: "Wattage" },
    { key: "formFactor", label: "Form factor (ATX/SFX)" },
    { key: "modular", label: "Modular (true/false)" },
  ],
  case: [
    { key: "formFactor", label: "Form factors (comma-separated)" },
    { key: "psuFormFactor", label: "PSU form factor" },
    { key: "maxGpuLength", label: "Max GPU length (mm)" },
  ],
  storage: [
    { key: "interface", label: "Interface" },
    { key: "capacity", label: "Capacity (GB)" },
    { key: "type", label: "Type (SSD/HDD/NVMe)" },
  ],
  soundcard: [{ key: "pciSlot", label: "PCI slot" }],
};

export default function AddPartForm({ isOpen, onClose }: AddPartFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const fields = useMemo(() => specFields[form.category], [form.category]);

  if (!isOpen) {
    return null;
  }

  const setSpec = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      specs: { ...prev.specs, [key]: value },
    }));
  };

  const resetForm = () => {
    setForm(initialState);
    setImage(null);
    setStatus(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    const payload = {
      name: form.name,
      manufacturer: form.manufacturer || undefined,
      model: form.model || undefined,
      description: form.description || undefined,
      visibility: form.visibility,
      category: form.category,
      specs: buildSpecs(form),
    };

    const data = new FormData();
    data.append("payload", JSON.stringify(payload));
    if (image) {
      data.append("image", image);
    }

    const response = await fetch("/api/parts", {
      method: "POST",
      body: data,
    });

    const json = await response.json();
    if (!response.ok) {
      setStatus(json?.error ?? "Failed to add part.");
      return;
    }

    setStatus("Part submitted. Await approval if public.");
    resetForm();
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-4 rounded-3xl border border-white/10 bg-[#0f0e1b] p-6 text-sm text-[#b3b7d4]"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-xl text-[#f2f3ff]">
            Add new part
          </h3>
          <button type="button" onClick={onClose} className="text-xs uppercase">
            Close
          </button>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
            Category
          </span>
          <select
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                category: event.target.value as ApiCategory,
                specs: {},
              }))
            }
            className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-2 text-sm text-[#f2f3ff]"
          >
            {categoryOrder.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
          <input
            className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-2"
            placeholder="Manufacturer"
            value={form.manufacturer}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, manufacturer: event.target.value }))
            }
          />
          <input
            className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-2"
            placeholder="Model"
            value={form.model}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, model: event.target.value }))
            }
          />
          <select
            className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-2"
            value={form.visibility}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                visibility: event.target.value as "private" | "public",
              }))
            }
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>

        <textarea
          className="w-full rounded-2xl border border-white/10 bg-[#121126] px-4 py-2"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
        />

        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <input
              key={field.key}
              className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-2"
              placeholder={field.label}
              value={form.specs[field.key] ?? ""}
              onChange={(event) => setSpec(field.key, event.target.value)}
              required
            />
          ))}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
          className="w-full text-xs"
        />

        {status ? <p className="text-xs text-[#ffd166]">{status}</p> : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-[#30f2ff] px-5 py-2 text-xs font-semibold uppercase text-[#0c0b14]"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

const buildSpecs = (form: FormState) => {
  const specs: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(form.specs)) {
    if (!value) {
      continue;
    }

    if (key === "pciSlots" || key === "formFactor") {
      specs[key] = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }

    if (["ramSlots", "tdp", "cores", "threads", "vram", "capacity", "speed", "slots", "wattage", "maxGpuLength", "length"].includes(key)) {
      specs[key] = Number(value);
      continue;
    }

    if (key === "modular") {
      specs[key] = value.toLowerCase() === "true";
      continue;
    }

    specs[key] = value;
  }

  return specs;
};
