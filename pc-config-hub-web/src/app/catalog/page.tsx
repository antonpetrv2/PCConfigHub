import { getCurrentUser } from "@/lib/auth";
import { listCatalogComponents } from "@/services/component-service";
import { componentTypeLabels } from "@/types/component-types";

const compactSpecs = (values: Array<string | null | undefined>) =>
  values.filter((value): value is string => Boolean(value));

const formatSpecs = (
  component: Awaited<ReturnType<typeof listCatalogComponents>>[number]
) => {
  switch (component.type) {
    case "motherboard":
      return compactSpecs([
        component.cpuSocket ? `CPU socket: ${component.cpuSocket}` : null,
        component.ramType ? `RAM: ${component.ramType}` : null,
        component.ramSlots ? `RAM slots: ${component.ramSlots}` : null,
        component.gpuSlotType ? `GPU slot: ${component.gpuSlotType}` : null,
        component.soundSlotType ? `Sound slot: ${component.soundSlotType}` : null,
      ]);
    case "video_card":
      return compactSpecs([
        component.videoSlotType ? `Slot: ${component.videoSlotType}` : null,
        component.vramGb ? `VRAM: ${component.vramGb} GB` : null,
      ]);
    case "sound_card":
      return compactSpecs([
        component.soundCardSlotType ? `Slot: ${component.soundCardSlotType}` : null,
      ]);
    case "case":
      return compactSpecs([
        component.formFactor ? `Form factor: ${component.formFactor}` : null,
        component.psuTypes?.length
          ? `PSU support: ${component.psuTypes.join(", ")}`
          : null,
      ]);
    case "power_supply":
      return compactSpecs([
        component.psuType ? `PSU type: ${component.psuType}` : null,
        component.wattage ? `Wattage: ${component.wattage}W` : null,
      ]);
    default:
      return [];
  }
};

export default async function CatalogPage() {
  const user = await getCurrentUser();
  const components = await listCatalogComponents(user?.id);

  const grouped = components.reduce<Record<string, typeof components>>(
    (acc, component) => {
      const key = component.type;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(component);
      return acc;
    },
    {}
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
            <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
              Upload parts
            </p>
            <p className="mt-2">
              You can upload new components and images from the builder once the
              import flow is enabled. Until then, keep your specs ready for
              approval.
            </p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#ffd166]/40 bg-[#16142b]/80 px-4 py-3 text-sm text-[#ffd166]">
          Public components can be commented on, but comments appear only after
          moderator approval.
        </div>

        {components.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6 text-sm text-[#b3b7d4]">
            No components available yet.
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(componentTypeLabels).map(([type, label]) => {
              const items = grouped[type] ?? [];
              if (!items.length) {
                return null;
              }

              return (
                <section key={type} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
                      {label}
                    </h2>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                      {items.length} items
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((component) => {
                      const specs = formatSpecs(component);

                      return (
                        <article
                          key={component.id}
                          className="flex gap-4 rounded-3xl border border-white/10 bg-[#121126]/90 p-4"
                        >
                          <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[#15142a]">
                            {component.imageUrl ? (
                              <img
                                src={component.imageUrl}
                                alt={component.imageAlt ?? component.name}
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
                                  {component.name}
                                </p>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                                  {component.visibility === "public" ? "Public" : "Private"}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-[#b3b7d4]">
                              {component.description ?? "No description yet."}
                            </p>
                            {specs.length ? (
                              <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-[#b3b7d4]">
                                {specs.map((spec) => (
                                  <span key={spec}>{spec}</span>
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
