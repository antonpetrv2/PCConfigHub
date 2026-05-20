"use client";

import { useEffect, useId, useMemo, useState } from "react";

import type { ApiCategory } from "@/lib/api/types";
import { categoryLabels, categoryOrder } from "@/lib/api/catalog";

type AddPartFormProps = {
  isOpen: boolean;
  onClose: () => void;
  part?: EditablePart;
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

export type EditablePart = {
  id: number;
  name: string;
  manufacturer?: string | null;
  model?: string | null;
  description?: string | null;
  visibility: "private" | "public";
  category: ApiCategory;
  specs: Record<string, unknown>;
  images?: Array<{ url: string; altText?: string | null }>;
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

const toFormState = (part?: EditablePart): FormState => {
  if (!part) {
    return initialState;
  }

  return {
    name: part.name,
    manufacturer: part.manufacturer ?? "",
    model: part.model ?? "",
    description: part.description ?? "",
    visibility: part.visibility,
    category: part.category,
    specs: Object.fromEntries(
      Object.entries(part.specs).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(", ") : String(value ?? ""),
      ])
    ),
  };
};

export default function AddPartForm({ isOpen, onClose, part }: AddPartFormProps) {
  const imageInputId = useId();
  const [form, setForm] = useState<FormState>(() => toFormState(part));
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    part?.images?.[0]?.url ?? null
  );
  const [hasClearedExistingImage, setHasClearedExistingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(part);
  const fields = useMemo(() => specFields[form.category], [form.category]);

  const setSpec = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      specs: { ...prev.specs, [key]: value },
    }));
  };

  const resetForm = () => {
    setForm(toFormState(part));
    setImage(null);
    setImagePreview(part?.images?.[0]?.url ?? null);
    setHasClearedExistingImage(false);
    setIsUploading(false);
    setStatus(null);
    setErrors({});
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isOpen) {
    return null;
  }

  const handleImageChange = (file: File | null) => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    setHasClearedExistingImage(!file);
  };

  const clearImage = () => {
    handleImageChange(null);
  };

  const handleDelete = async () => {
    if (!part) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this part? Existing configurations that use it may be affected."
    );
    if (!confirmed) {
      return;
    }

    setStatus(null);
    const response = await fetch(`/api/parts/${part.id}`, {
      method: "DELETE",
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus(json?.error ?? "Failed to delete part.");
      return;
    }

    resetForm();
    onClose();
    window.location.reload();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setErrors({});

    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    for (const field of fields) {
      const value = form.specs[field.key]?.trim() ?? "";
      if (!value) {
        nextErrors[`specs.${field.key}`] = "This field is required.";
        continue;
      }

      if (
        [
          "ramSlots",
          "tdp",
          "cores",
          "threads",
          "vram",
          "capacity",
          "speed",
          "slots",
          "wattage",
          "maxGpuLength",
          "length",
        ].includes(field.key)
      ) {
        if (!Number.isFinite(Number(value))) {
          nextErrors[`specs.${field.key}`] = "Enter a valid number.";
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("Please fix the highlighted fields.");
      return;
    }

    let imageUrl: string | null | undefined;

    if (image) {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", image);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadJson = await uploadResponse.json();
      if (!uploadResponse.ok) {
        setIsUploading(false);
        setStatus(uploadJson?.error ?? "Failed to upload image.");
        return;
      }

      imageUrl = uploadJson?.data?.url;
      setIsUploading(false);
    } else if (isEditing && hasClearedExistingImage) {
      imageUrl = null;
    }

    const payload = {
      name: form.name,
      manufacturer: form.manufacturer || undefined,
      model: form.model || undefined,
      description: form.description || undefined,
      visibility: form.visibility,
      category: form.category,
      specs: buildSpecs(form),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    };

    const response = isEditing
      ? await fetch(`/api/parts/${part?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await submitNewPart(payload);

    const json = await response.json();
    if (!response.ok) {
      setStatus(json?.error ?? (isEditing ? "Failed to update part." : "Failed to add part."));
      return;
    }

    setStatus(isEditing ? "Part updated." : "Part submitted. Await approval if public.");
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
            {isEditing ? "Edit part" : "Add new part"}
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
          <div className="space-y-1">
            <input
            className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
            />
            {errors.name ? (
              <p className="text-xs text-[#ff5bf1]">{errors.name}</p>
            ) : null}
          </div>
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
            <div key={field.key} className="space-y-1">
              <input
                className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-2"
                placeholder={field.label}
                value={form.specs[field.key] ?? ""}
                onChange={(event) => setSpec(field.key, event.target.value)}
                required
              />
              {errors[`specs.${field.key}`] ? (
                <p className="text-xs text-[#ff5bf1]">
                  {errors[`specs.${field.key}`]}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <input
            id={imageInputId}
            type="file"
            accept="image/*"
            onChange={(event) =>
              handleImageChange(event.target.files?.[0] ?? null)
            }
            className="sr-only"
          />
          <label
            htmlFor={imageInputId}
            className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-[#30f2ff]/50 bg-[#121126] px-4 py-5 text-center transition hover:border-[#30f2ff] hover:bg-[#151a2f]"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#30f2ff]">
              Upload image
            </span>
            <span className="text-xs text-[#b3b7d4]">
              Choose a product photo for this part
            </span>
          </label>

          {image ? (
            <p className="text-xs text-[#b3b7d4]">Selected: {image.name}</p>
          ) : null}

          {imagePreview ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#121126] p-3">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <span className="text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
                  Image preview
                </span>
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase"
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>

        {status ? <p className="text-xs text-[#ffd166]">{status}</p> : null}

        <div className="flex flex-wrap justify-between gap-3">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-[#ff5bf1]/50 px-4 py-2 text-xs font-semibold uppercase text-[#ff8af5]"
            >
              Delete part
            </button>
          ) : (
            <span />
          )}
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
              disabled={isUploading}
              className="rounded-full bg-[#30f2ff] px-5 py-2 text-xs font-semibold uppercase text-[#0c0b14] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "Uploading" : isEditing ? "Save changes" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const submitNewPart = (payload: Record<string, unknown>) => {
  const data = new FormData();
  data.append("payload", JSON.stringify(payload));

  return fetch("/api/parts", {
    method: "POST",
    body: data,
  });
};

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildSpecs = (form: FormState) => {
  const specs: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(form.specs)) {
    if (!value) {
      continue;
    }

    if (key === "pciSlots" || (form.category === "case" && key === "formFactor")) {
      specs[key] = splitList(value);
      continue;
    }

    if (
      [
        "ramSlots",
        "tdp",
        "cores",
        "threads",
        "vram",
        "capacity",
        "speed",
        "slots",
        "wattage",
        "maxGpuLength",
        "length",
      ].includes(key)
    ) {
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
