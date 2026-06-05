"use client";

import { useEffect, useId, useMemo, useState } from "react";

import type { ApiCategory, ItemCondition } from "@/lib/api/types";
import {
  categoryLabels,
  categoryOrder,
  conditionLabels,
  conditionOrder,
  generalFields,
  getCategoryFields,
  type CatalogField,
} from "@/lib/api/catalog";

type AddPartFormProps = {
  isOpen: boolean;
  onClose: () => void;
  part?: EditablePart;
};

type LogState = Record<string, string>;

type FormState = {
  name: string;
  manufacturer: string;
  model: string;
  yearEra: string;
  countryOfOrigin: string;
  serialNumber: string;
  inventoryNumber: string;
  condition: ItemCondition;
  description: string;
  notes: string;
  tags: string;
  location: string;
  acquisitionDate: string;
  source: string;
  purchasePrice: string;
  estimatedValue: string;
  visibility: "private" | "public";
  category: ApiCategory;
  specs: Record<string, string>;
  customFields: Array<{ key: string; value: string }>;
  testLogs: LogState[];
  restorationLogs: LogState[];
};

export type EditablePart = {
  id: number;
  name: string;
  manufacturer?: string | null;
  model?: string | null;
  yearEra?: string | null;
  countryOfOrigin?: string | null;
  serialNumber?: string | null;
  inventoryNumber?: string | null;
  condition?: ItemCondition;
  description?: string | null;
  notes?: string | null;
  tags?: string[];
  location?: string | null;
  acquisitionDate?: string | null;
  source?: string | null;
  purchasePrice?: string | null;
  estimatedValue?: string | null;
  visibility: "private" | "public";
  category: ApiCategory;
  specs: Record<string, unknown>;
  customFields?: Record<string, unknown>;
  testLogs?: Array<Record<string, unknown>>;
  restorationLogs?: Array<Record<string, unknown>>;
  images?: Array<{ url: string; altText?: string | null }>;
};

const emptyTestLog = (): LogState => ({
  date: "",
  testType: "",
  result: "",
  softwareUsed: "",
  notes: "",
  photos: "",
});

const emptyRestorationLog = (): LogState => ({
  date: "",
  workPerformed: "",
  partsReplaced: "",
  problemsFound: "",
  photosBefore: "",
  photosAfter: "",
});

const initialState: FormState = {
  name: "",
  manufacturer: "",
  model: "",
  yearEra: "",
  countryOfOrigin: "",
  serialNumber: "",
  inventoryNumber: "",
  condition: "untested",
  description: "",
  notes: "",
  tags: "",
  location: "",
  acquisitionDate: "",
  source: "",
  purchasePrice: "",
  estimatedValue: "",
  visibility: "public",
  category: "complete_computer",
  specs: {},
  customFields: [],
  testLogs: [],
  restorationLogs: [],
};

const toInputValue = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : String(value ?? "");

const toFormState = (part?: EditablePart): FormState => {
  if (!part) {
    return initialState;
  }

  return {
    name: part.name,
    manufacturer: part.manufacturer ?? "",
    model: part.model ?? "",
    yearEra: part.yearEra ?? "",
    countryOfOrigin: part.countryOfOrigin ?? "",
    serialNumber: part.serialNumber ?? "",
    inventoryNumber: part.inventoryNumber ?? "",
    condition: part.condition ?? "untested",
    description: part.description ?? "",
    notes: part.notes ?? "",
    tags: part.tags?.join(", ") ?? "",
    location: part.location ?? "",
    acquisitionDate: part.acquisitionDate ?? "",
    source: part.source ?? "",
    purchasePrice: part.purchasePrice ?? "",
    estimatedValue: part.estimatedValue ?? "",
    visibility: part.visibility,
    category: part.category,
    specs: Object.fromEntries(
      Object.entries(part.specs).map(([key, value]) => [key, toInputValue(value)])
    ),
    customFields: Object.entries(part.customFields ?? {}).map(([key, value]) => ({
      key,
      value: toInputValue(value),
    })),
    testLogs: part.testLogs?.length
      ? part.testLogs.map((log) => ({
          date: toInputValue(log.date),
          testType: toInputValue(log.testType),
          result: toInputValue(log.result),
          softwareUsed: toInputValue(log.softwareUsed),
          notes: toInputValue(log.notes),
          photos: toInputValue(log.photos),
        }))
      : [],
    restorationLogs: part.restorationLogs?.length
      ? part.restorationLogs.map((log) => ({
          date: toInputValue(log.date),
          workPerformed: toInputValue(log.workPerformed),
          partsReplaced: toInputValue(log.partsReplaced),
          problemsFound: toInputValue(log.problemsFound),
          photosBefore: toInputValue(log.photosBefore),
          photosAfter: toInputValue(log.photosAfter),
        }))
      : [],
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
  const categoryFields = useMemo(
    () => getCategoryFields(form.category),
    [form.category]
  );

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
      name: form.name.trim(),
      manufacturer: form.manufacturer || undefined,
      model: form.model || undefined,
      yearEra: form.yearEra || undefined,
      countryOfOrigin: form.countryOfOrigin || undefined,
      serialNumber: form.serialNumber || undefined,
      inventoryNumber: form.inventoryNumber || undefined,
      condition: form.condition,
      description: form.description || undefined,
      notes: form.notes || undefined,
      tags: splitList(form.tags),
      location: form.location || undefined,
      acquisitionDate: form.acquisitionDate || undefined,
      source: form.source || undefined,
      purchasePrice: form.purchasePrice || undefined,
      estimatedValue: form.estimatedValue || undefined,
      visibility: form.visibility,
      category: form.category,
      specs: buildFieldRecord(form.specs, categoryFields),
      customFields: Object.fromEntries(
        form.customFields
          .filter((field) => field.key.trim() && field.value.trim())
          .map((field) => [field.key.trim(), field.value.trim()])
      ),
      testLogs: form.testLogs.map((log) => ({
        ...log,
        photos: splitList(log.photos ?? ""),
      })),
      restorationLogs: form.restorationLogs.map((log) => ({
        ...log,
        photosBefore: splitList(log.photosBefore ?? ""),
        photosAfter: splitList(log.photosAfter ?? ""),
      })),
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
      setStatus(json?.error ?? (isEditing ? "Failed to update item." : "Failed to add item."));
      return;
    }

    setStatus(isEditing ? "Item updated." : "Item submitted. Await approval if public.");
    resetForm();
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl space-y-5 overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0e1b] p-4 text-sm text-[#b3b7d4] shadow-[0_0_40px_rgba(0,0,0,0.45)] sm:p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-xl text-[#f2f3ff]">
            {isEditing ? "Edit catalog item" : "Add catalog item"}
          </h3>
          <button type="button" onClick={onClose} className="text-xs uppercase">
            Close
          </button>
        </div>

        <Section title="Identity">
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="field-label">Category</span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  category: event.target.value as ApiCategory,
                  specs: {},
                }))
              }
              className="form-input"
            >
              {categoryOrder.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </label>
          <InputField
            label="Name"
            value={form.name}
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
            error={errors.name}
            required
          />
          <InputField
            label="Manufacturer"
            value={form.manufacturer}
            onChange={(value) => setForm((prev) => ({ ...prev, manufacturer: value }))}
          />
          <InputField
            label="Model"
            value={form.model}
            onChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
          />
          <label className="flex flex-col gap-2">
            <span className="field-label">Condition</span>
            <select
              className="form-input"
              value={form.condition}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  condition: event.target.value as ItemCondition,
                }))
              }
            >
              {conditionOrder.map((condition) => (
                <option key={condition} value={condition}>
                  {conditionLabels[condition]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="field-label">Visibility</span>
            <select
              className="form-input"
              value={form.visibility}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  visibility: event.target.value as "private" | "public",
                }))
              }
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
        </Section>

        <Section title="General collection data">
          {generalFields.map((field) => (
            <SchemaField
              key={field.key}
              field={field}
              value={String(form[field.key as keyof FormState] ?? "")}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, [field.key]: value }))
              }
            />
          ))}
          <InputField
            label="Tags"
            placeholder="486, DOS, ISA, tested"
            value={form.tags}
            onChange={(value) => setForm((prev) => ({ ...prev, tags: value }))}
          />
        </Section>

        <Section title={`${categoryLabels[form.category]} details`}>
          {categoryFields.map((field) => (
            <SchemaField
              key={field.key}
              field={field}
              value={form.specs[field.key] ?? ""}
              onChange={(value) => setSpec(field.key, value)}
            />
          ))}
        </Section>

        <Section title="Description and notes">
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
          />
          <TextAreaField
            label="Notes"
            value={form.notes}
            onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
          />
        </Section>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-[#121126]/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Custom fields
            </p>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  customFields: [...prev.customFields, { key: "", value: "" }],
                }))
              }
              className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase"
            >
              Add field
            </button>
          </div>
          {form.customFields.map((field, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input
                className="form-input"
                placeholder="Field name"
                value={field.key}
                onChange={(event) => updateCustomField(index, "key", event.target.value, setForm)}
              />
              <input
                className="form-input"
                placeholder="Value"
                value={field.value}
                onChange={(event) => updateCustomField(index, "value", event.target.value, setForm)}
              />
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    customFields: prev.customFields.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
                className="rounded-full border border-[#ff5bf1]/50 px-3 py-2 text-xs uppercase text-[#ff8af5]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <LogEditor
          title="Test log"
          logs={form.testLogs}
          emptyLog={emptyTestLog}
          fields={[
            ["date", "Date"],
            ["testType", "Test type"],
            ["result", "Result"],
            ["softwareUsed", "Software used"],
            ["notes", "Notes"],
            ["photos", "Photos/screenshots URLs"],
          ]}
          onChange={(logs) => setForm((prev) => ({ ...prev, testLogs: logs }))}
        />

        <LogEditor
          title="Restoration log"
          logs={form.restorationLogs}
          emptyLog={emptyRestorationLog}
          fields={[
            ["date", "Date"],
            ["workPerformed", "Work performed"],
            ["partsReplaced", "Parts replaced"],
            ["problemsFound", "Problems found"],
            ["photosBefore", "Photos before URLs"],
            ["photosAfter", "Photos after URLs"],
          ]}
          onChange={(logs) =>
            setForm((prev) => ({ ...prev, restorationLogs: logs }))
          }
        />

        <div className="space-y-3">
          <input
            id={imageInputId}
            type="file"
            accept="image/*"
            onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
            className="sr-only"
          />
          <label
            htmlFor={imageInputId}
            className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-[#30f2ff]/50 bg-[#121126] px-4 py-4 text-center transition hover:border-[#30f2ff] hover:bg-[#151a2f]"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#30f2ff]">
              Upload photo
            </span>
            <span className="text-xs text-[#b3b7d4]">
              Add a catalog photo for this item
            </span>
          </label>

          {image ? <p className="text-xs text-[#b3b7d4]">Selected: {image.name}</p> : null}

          {imagePreview ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#121126] p-3">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <span className="text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
                  Image preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleImageChange(null)}
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
              Delete item
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-[#121126]/70 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
        {title}
      </p>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="field-label">{label}</span>
      <input
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
      {error ? <span className="text-xs text-[#ff5bf1]">{error}</span> : null}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 md:col-span-2">
      <span className="field-label">{label}</span>
      <textarea
        className="form-input min-h-24"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SchemaField({
  field,
  value,
  onChange,
}: {
  field: CatalogField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "textarea") {
    return <TextAreaField label={field.label} value={value} onChange={onChange} />;
  }

  if (field.type === "select") {
    return (
      <label className="flex flex-col gap-2">
        <span className="field-label">{field.label}</span>
        <select
          className="form-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121126] px-4 py-3">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(event) => onChange(String(event.target.checked))}
        />
        <span className="field-label">{field.label}</span>
      </label>
    );
  }

  const hint =
    field.type === "multiselect" ? field.options?.join(", ") : field.placeholder;

  return (
    <InputField
      label={field.label}
      value={value}
      onChange={onChange}
      placeholder={hint}
    />
  );
}

function LogEditor({
  title,
  logs,
  emptyLog,
  fields,
  onChange,
}: {
  title: string;
  logs: LogState[];
  emptyLog: () => LogState;
  fields: Array<[string, string]>;
  onChange: (logs: LogState[]) => void;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-[#121126]/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
          {title}
        </p>
        <button
          type="button"
          onClick={() => onChange([...logs, emptyLog()])}
          className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase"
        >
          Add entry
        </button>
      </div>
      {logs.map((log, index) => (
        <div key={index} className="grid gap-2 rounded-xl border border-white/10 p-3 md:grid-cols-2">
          {fields.map(([key, label]) => (
            <InputField
              key={key}
              label={label}
              value={log[key] ?? ""}
              onChange={(value) =>
                onChange(
                  logs.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, [key]: value } : item
                  )
                )
              }
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(logs.filter((_, itemIndex) => itemIndex !== index))}
            className="w-fit rounded-full border border-[#ff5bf1]/50 px-3 py-2 text-xs uppercase text-[#ff8af5]"
          >
            Remove entry
          </button>
        </div>
      ))}
    </section>
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

const buildFieldRecord = (
  values: Record<string, string>,
  fields: CatalogField[]
) => {
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    const rawValue = values[field.key];
    if (!rawValue) {
      continue;
    }

    if (field.type === "number") {
      result[field.key] = Number(rawValue);
      continue;
    }

    if (field.type === "boolean") {
      result[field.key] = rawValue === "true";
      continue;
    }

    if (field.type === "multiselect") {
      result[field.key] = splitList(rawValue);
      continue;
    }

    result[field.key] = rawValue;
  }

  return result;
};

const updateCustomField = (
  index: number,
  key: "key" | "value",
  value: string,
  setForm: React.Dispatch<React.SetStateAction<FormState>>
) => {
  setForm((prev) => ({
    ...prev,
    customFields: prev.customFields.map((field, fieldIndex) =>
      fieldIndex === index ? { ...field, [key]: value } : field
    ),
  }));
};
