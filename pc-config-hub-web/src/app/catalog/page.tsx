import { getCurrentUser } from "@/lib/auth";
import AddPartLauncher from "@/app/parts/add-part-launcher";
import { categoryLabels, categoryOrder } from "@/lib/api/catalog";
import type { ApiCategory } from "@/lib/api/types";
import { listParts } from "@/services/api/parts-service";

const compactSpecs = (values: Array<string | null | undefined>) =>
  values.filter((value): value is string => Boolean(value));

const formatValue = (value: unknown) => {
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

const spec = (
  specs: Record<string, unknown>,
  key: string,
  label: string,
  suffix = ""
) => {
  const value = formatValue(specs[key]);
  return value ? `${label}: ${value}${suffix}` : null;
};

const formatSpecs = (part: {
  category: ApiCategory;
  specs: Record<string, unknown>;
}) => {
  switch (part.category) {
    case "motherboard":
      return compactSpecs([
        spec(part.specs, "socket", "CPU socket"),
        spec(part.specs, "ramType", "RAM"),
        spec(part.specs, "ramSlots", "RAM slots"),
        spec(part.specs, "pciSlots", "PCI slots"),
      ]);
    case "cpu":
      return compactSpecs([
        spec(part.specs, "socket", "Socket"),
        spec(part.specs, "cores", "Cores"),
        spec(part.specs, "threads", "Threads"),
        spec(part.specs, "tdp", "TDP", "W"),
      ]);
    case "gpu":
      return compactSpecs([
        spec(part.specs, "pciSlot", "Slot"),
        spec(part.specs, "vram", "VRAM", " GB"),
        spec(part.specs, "length", "Length", " mm"),
        spec(part.specs, "tdp", "TDP", "W"),
      ]);
    case "ram":
      return compactSpecs([
        spec(part.specs, "type", "Type"),
        spec(part.specs, "capacity", "Capacity", " GB"),
        spec(part.specs, "speed", "Speed", " MHz"),
        spec(part.specs, "slots", "Slots"),
      ]);
    case "psu":
      return compactSpecs([
        spec(part.specs, "formFactor", "Form factor"),
        spec(part.specs, "wattage", "Wattage", "W"),
        spec(part.specs, "modular", "Modular"),
      ]);
    case "case":
      return compactSpecs([
        spec(part.specs, "formFactor", "Form factors"),
        spec(part.specs, "psuFormFactor", "PSU support"),
        spec(part.specs, "maxGpuLength", "Max GPU", " mm"),
      ]);
    case "storage":
      return compactSpecs([
        spec(part.specs, "interface", "Interface"),
        spec(part.specs, "capacity", "Capacity", " GB"),
        spec(part.specs, "type", "Type"),
      ]);
    case "soundcard":
      return compactSpecs([spec(part.specs, "pciSlot", "Slot")]);
    default:
      return [];
  }
};

export default async function CatalogPage() {
  const user = await getCurrentUser();
  const { parts } = await listParts({
    userId: user?.id,
    page: 1,
    limit: 100,
  });

  const grouped = parts.reduce<Record<ApiCategory, typeof parts>>(
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

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-12 h-64 w-64 rounded-full bg-[#30f2ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-24 h-56 w-56 rounded-full bg-[#ff5bf1]/15 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Component catalog
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Parts catalog
          </h1>
          <p className="max-w-2xl text-sm text-[#b3b7d4]">
            {user
              ? "Showing public components plus your private inventory."
              : "Showing public components only. Sign in to see your private parts."}
          </p>
        </header>

        {user ? (
          <div className="rounded-3xl border border-[#30f2ff]/40 bg-[#0f0e1b]/80 p-6 text-sm text-[#b3b7d4] shadow-[0_0_20px_rgba(48,242,255,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                  Upload parts
                </p>
                <p className="mt-2">
                  Add new components with specs, visibility, and an image. Public parts
                  require approval before showing up to everyone.
                </p>
              </div>
              <AddPartLauncher />
            </div>
          </div>
        ) : null}

        {parts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6 text-sm text-[#b3b7d4]">
            No components available yet.
          </div>
        ) : (
          <div className="space-y-10">
            {categoryOrder.map((category) => {
              const items = grouped[category];
              if (!items.length) {
                return null;
              }

              return (
                <section key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
                      {categoryLabels[category]}
                    </h2>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                      {items.length} items
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((part) => {
                      const specs = formatSpecs(part);
                      const canEdit = user?.id === part.ownerUserId;

                      return (
                        <article
                          key={part.id}
                          className="flex gap-4 rounded-3xl border border-white/10 bg-[#121126]/90 p-4"
                        >
                          <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[#15142a]">
                            {part.images[0]?.url ? (
                              <img
                                src={part.images[0].url}
                                alt={part.images[0].altText ?? part.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-[0.3em] text-[#b3b7d4]">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-base font-semibold text-[#f2f3ff]">
                                  {part.name}
                                </p>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                                  {part.visibility === "public" ? "Public" : "Private"}
                                </p>
                              </div>
                              {canEdit ? <AddPartLauncher part={part} /> : null}
                            </div>
                            <p className="text-sm text-[#b3b7d4]">
                              {part.description ?? "No description yet."}
                            </p>
                            {specs.length ? (
                              <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-[#b3b7d4]">
                                {specs.map((item) => (
                                  <span key={item}>{item}</span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
