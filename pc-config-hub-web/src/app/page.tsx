import { and, eq, isNull, sql } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db/client";
import {
  componentImages,
  componentRestorationLogs,
  components,
  configurationRestorationLogs,
  pcConfigurations,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { categoryLabels } from "@/lib/api/catalog";
import { listConfigs } from "@/services/api/configs-service";
import { listParts, type PartRecord } from "@/services/api/parts-service";

const eras = [
  {
    label: "1970s",
    hardware: "Apple II, S-100 systems, early terminals",
    tone: "Birth of personal computing",
  },
  {
    label: "1980s",
    hardware: "XT, AT, Commodore, Amiga, CGA/EGA",
    tone: "Home micros and the IBM PC standard",
  },
  {
    label: "1990s",
    hardware: "386, 486, Pentium, VLB, PCI, Sound Blaster",
    tone: "DOS games, multimedia kits and beige towers",
  },
  {
    label: "2000s",
    hardware: "AGP, Socket A, Pentium 4, early SATA",
    tone: "Legacy meets modern performance",
  },
  {
    label: "2010s",
    hardware: "Late optical media, PCIe transitions, rescue systems",
    tone: "The last bridge before everything became sealed",
  },
];

const platforms = [
  "IBM PC / XT",
  "AT",
  "386",
  "486",
  "Pentium",
  "Super Socket 7",
  "Apple II",
  "Amiga",
  "Industrial Systems",
  "Embedded Systems",
  "Servers",
  "Laptops",
];

const preservationFeatures = [
  "Collection management",
  "Configuration linking",
  "Restoration logs",
  "Test logs",
  "Hardware documentation",
  "Historical preservation",
];

const collectionExamples = [
  "DOS Gaming Collection",
  "Industrial Computing Archive",
  "Socket 7 Museum",
  "Apple II Collection",
  "Sound Card Archive",
];

const restorationExamples = [
  "Capacitor replacement documented with before and after photos.",
  "Battery leakage cleaned and neutralized on a late 486 motherboard.",
  "Retro rebuild completed with successful POST and DOS boot test.",
  "Noisy drive diagnosed, imaged and preserved before failure.",
];

const rareTerms = [
  "voodoo",
  "apple ii",
  "xt",
  "industrial",
  "sbc",
  "prototype",
  "rare",
  "386",
  "486",
  "socket 7",
];

type HomeStats = {
  collectors: number;
  computers: number;
  components: number;
  restorations: number;
  photos: number;
};

const publicComponentsFilter = and(
  isNull(components.deletedAt),
  eq(components.visibility, "public"),
  eq(components.approvalStatus, "approved")
);

const publicConfigurationsFilter = and(
  isNull(pcConfigurations.deletedAt),
  eq(pcConfigurations.visibility, "public"),
  eq(pcConfigurations.approvalStatus, "approved")
);

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const firstImage = (part: PartRecord) => part.images[0]?.url ?? null;

const getEraYear = (part: PartRecord) => {
  const text = [part.yearEra, part.name, part.description].filter(Boolean).join(" ");
  const match = text.match(/\b(19[7-9]\d|20[01]\d)\b/);
  return match ? Number(match[1]) : null;
};

const findRareSpotlight = (parts: PartRecord[]) =>
  parts.find((part) => {
    const haystack = [
      part.name,
      part.manufacturer,
      part.model,
      part.yearEra,
      part.description,
      part.tags.join(" "),
      JSON.stringify(part.specs),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return rareTerms.some((term) => haystack.includes(term));
  }) ?? parts[0];

const getHomeStats = async (): Promise<HomeStats> => {
  const [
    [{ collectors }],
    [{ componentsCount }],
    [{ computers }],
    [{ photos }],
    [{ componentRestorations }],
    [{ configurationRestorations }],
  ] = await Promise.all([
    db
      .select({ collectors: sql<number>`count(*)` })
      .from(users)
      .where(and(isNull(users.deletedAt), eq(users.approvalStatus, "approved"))),
    db
      .select({ componentsCount: sql<number>`count(*)` })
      .from(components)
      .where(publicComponentsFilter),
    db
      .select({ computers: sql<number>`count(*)` })
      .from(pcConfigurations)
      .where(publicConfigurationsFilter),
    db.select({ photos: sql<number>`count(*)` }).from(componentImages),
    db
      .select({ componentRestorations: sql<number>`count(*)` })
      .from(componentRestorationLogs),
    db
      .select({ configurationRestorations: sql<number>`count(*)` })
      .from(configurationRestorationLogs),
  ]);

  return {
    collectors: Number(collectors ?? 0),
    computers: Number(computers ?? 0),
    components: Number(componentsCount ?? 0),
    restorations:
      Number(componentRestorations ?? 0) + Number(configurationRestorations ?? 0),
    photos: Number(photos ?? 0),
  };
};

export default async function Home() {
  const user = await getCurrentUser();
  const [stats, configsData, partsData] = await Promise.all([
    getHomeStats(),
    listConfigs({ userId: user?.id, page: 1, limit: 5 }),
    listParts({ userId: user?.id, page: 1, limit: 36 }),
  ]);

  const parts = partsData.parts;
  const heroParts = parts.filter(firstImage).slice(0, 9);
  const featuredConfigs = configsData.configs.slice(0, 5);
  const rareSpotlight = findRareSpotlight(parts);
  const oldestPart =
    [...parts]
      .map((part) => ({ part, year: getEraYear(part) }))
      .filter((entry): entry is { part: PartRecord; year: number } => entry.year !== null)
      .sort((a, b) => a.year - b.year)[0]?.part ?? parts[0];
  const rareCpu =
    parts.find((part) => part.category === "cpu" && /rare|prototype|engineering|gold|ceramic/i.test(part.name)) ??
    parts.find((part) => part.category === "cpu");
  const machineOfWeek = featuredConfigs[0];
  const largestCollection = [...featuredConfigs].sort(
    (a, b) => b.partsCount - a.partsCount
  )[0];
  const ctaHref = user ? "/builder" : "/register";

  return (
    <section className="relative overflow-hidden bg-[#090807] text-[#f6f0df]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(67,92,76,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(67,92,76,0.18)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(9,8,7,0.48)_52%,rgba(9,8,7,0.92)_100%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col">
        <section className="relative min-h-[calc(100vh-73px)] overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
          <div className="absolute inset-0 grid grid-cols-2 gap-3 opacity-45 sm:grid-cols-3 lg:grid-cols-5">
            {heroParts.length ? (
              heroParts.map((part, index) => (
                <div
                  key={part.id}
                  className={`overflow-hidden border border-[#8f6f3f]/30 bg-[#11100d] ${
                    index % 3 === 0 ? "row-span-2" : ""
                  }`}
                >
                  <img
                    src={firstImage(part) ?? ""}
                    alt={part.name}
                    className="h-full min-h-48 w-full object-contain p-3 opacity-90 sepia-[0.2]"
                  />
                </div>
              ))
            ) : (
              eras.map((era) => (
                <div
                  key={era.label}
                  className="flex min-h-44 items-end border border-[#8f6f3f]/30 bg-[#11100d] p-4"
                >
                  <span className="font-[var(--font-display)] text-3xl text-[#6fa36f]/70">
                    {era.label}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="absolute inset-0 bg-[#090807]/70" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#090807]" />

          <div className="relative z-10 flex min-h-[calc(100vh-170px)] max-w-4xl flex-col justify-center gap-7">
            <p className="text-xs font-semibold uppercase tracking-[0.48em] text-[#b59b63]">
              Living archive for vintage hardware
            </p>
            <h1 className="font-[var(--font-display)] text-5xl leading-[1.02] text-[#f6f0df] sm:text-6xl lg:text-7xl">
              Preserving Computer History, One Machine at a Time.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-[#d4c8a9] sm:text-xl">
              Document, organize and share your collection of vintage computers,
              rare hardware, expansion cards, software, and restorations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={ctaHref}
                className="rounded-sm border border-[#d7b56d] bg-[#d7b56d] px-6 py-4 text-xs font-black uppercase tracking-[0.22em] text-[#15110a] shadow-[0_0_24px_rgba(215,181,109,0.24)]"
              >
                Create Collection
              </Link>
              <Link
                href="/configurations"
                className="rounded-sm border border-[#6fa36f]/70 bg-[#0f160f]/80 px-6 py-4 text-xs font-black uppercase tracking-[0.22em] text-[#b7e0a4]"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-px border-y border-[#3c3325] bg-[#3c3325] sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Total collectors", stats.collectors],
            ["Computers documented", stats.computers],
            ["Hardware components", stats.components],
            ["Restoration logs", stats.restorations],
            ["Photos uploaded", stats.photos],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#0d0c0a] px-5 py-7">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.32em] text-[#8c7d5a]">
                {label}
              </p>
              <p className="mt-3 font-[var(--font-display)] text-4xl text-[#d7b56d]">
                {formatNumber(Number(value))}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-10 px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#6fa36f]">
                Hall of Fame
              </p>
              <h2 className="mt-3 font-[var(--font-display)] text-4xl text-[#f6f0df]">
                Reasons to keep documenting
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-7 text-[#c7bda2]">
              The front page rewards preservation work: rare finds, complete
              systems, restoration activity and historically important machines can
              all surface here.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              ["Oldest machine", oldestPart?.name ?? "Awaiting the first dated entry"],
              ["Rarest processor", rareCpu?.name ?? "No rare CPU documented yet"],
              [
                "Largest collection",
                largestCollection
                  ? `${largestCollection.name} / ${largestCollection.partsCount} parts`
                  : "No public collection yet",
              ],
              ["Last restored system", restorationExamples[0]],
              ["Machine of the week", machineOfWeek?.name ?? "Nominate the first build"],
            ].map(([label, value]) => (
              <div key={label} className="border border-[#3c3325] bg-[#11100d]/95 p-5">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-[#b59b63]">
                  {label}
                </p>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#f6f0df]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#b59b63]">
                  Featured collections
                </p>
                <h2 className="mt-3 font-[var(--font-display)] text-3xl text-[#f6f0df]">
                  From private shelves to public archive
                </h2>
              </div>
              <Link href="/configurations" className="text-xs font-bold uppercase tracking-[0.24em] text-[#b7e0a4]">
                Browse all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredConfigs.length
                ? featuredConfigs.map((config) => (
                  <Link
                    key={config.id}
                    href={`/configurations/${config.id}`}
                    className="group grid min-h-56 overflow-hidden border border-[#3c3325] bg-[#11100d]"
                  >
                    {config?.coverImage ? (
                      <img
                        src={config.coverImage}
                        alt={config.coverImageAlt ?? config.name}
                        className="h-56 w-full bg-[#0a0908] object-contain p-3 transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-[#0a0908] p-5 text-center font-[var(--font-display)] text-2xl text-[#6fa36f]">
                        {config.name}
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-lg font-bold text-[#f6f0df]">
                        {config.name}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#b59b63]">
                        {`${config.partsCount} parts / by ${config.ownerName}`}
                      </p>
                    </div>
                  </Link>
                ))
                : collectionExamples.map((entry, index) => (
                  <Link
                    key={entry}
                    href="/register"
                    className="group grid min-h-56 overflow-hidden border border-[#3c3325] bg-[#11100d]"
                  >
                    <div className="flex h-56 items-center justify-center bg-[#0a0908] p-5 text-center font-[var(--font-display)] text-2xl text-[#6fa36f]">
                      {entry}
                    </div>
                    <div className="p-5">
                      <p className="text-lg font-bold text-[#f6f0df]">{entry}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#b59b63]">
                        {`${index + 8} systems / seeking curator`}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <aside className="border border-[#6fa36f]/30 bg-[#0b120c] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#6fa36f]">
              Rare hardware spotlight
            </p>
            {rareSpotlight ? (
              <Link href={`/parts/${rareSpotlight.id}`} className="group mt-5 block">
                {firstImage(rareSpotlight) ? (
                  <img
                    src={firstImage(rareSpotlight) ?? ""}
                    alt={rareSpotlight.name}
                    className="h-80 w-full bg-[#070806] object-contain p-4 transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : null}
                <h3 className="mt-5 font-[var(--font-display)] text-3xl text-[#f6f0df]">
                  {rareSpotlight.name}
                </h3>
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-[#b59b63]">
                  {categoryLabels[rareSpotlight.category]} / {rareSpotlight.yearEra ?? "Era unknown"}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#c7bda2]">
                  {rareSpotlight.description ??
                    "A documented piece of computing history from the public archive."}
                </p>
              </Link>
            ) : (
              <p className="mt-5 text-sm leading-7 text-[#c7bda2]">
                Add Voodoo cards, XT motherboards, Apple II hardware, industrial
                SBCs or prototype hardware to activate the spotlight.
              </p>
            )}
          </aside>
        </section>

        <section className="grid gap-8 border-y border-[#3c3325] bg-[#0d0c0a] px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#b59b63]">
              Recent restorations
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl text-[#f6f0df]">
              Every repair is part of the record
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#c7bda2]">
              Track capacitor replacements, repairs, battery damage cleanup,
              retro rebuilds and successful boot tests with notes and photos.
            </p>
          </div>
          <div className="grid gap-3">
            {restorationExamples.map((item, index) => (
              <div
                key={item}
                className="grid grid-cols-[auto_1fr] gap-4 border border-[#3c3325] bg-[#11100d] p-4"
              >
                <span className="flex h-9 w-9 items-center justify-center border border-[#6fa36f]/50 font-[var(--font-display)] text-[#b7e0a4]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[#f6f0df]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 px-4 py-14 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#6fa36f]">
              Explore the archive
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl text-[#f6f0df]">
              Browse by era and platform
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {eras.map((era) => (
              <Link
                key={era.label}
                href={`/catalog?era=${encodeURIComponent(era.label)}`}
                className="border border-[#3c3325] bg-[#11100d] p-5 hover:border-[#6fa36f]/70"
              >
                <p className="font-[var(--font-display)] text-3xl text-[#d7b56d]">
                  {era.label}
                </p>
                <p className="mt-4 text-sm font-semibold text-[#f6f0df]">
                  {era.tone}
                </p>
                <p className="mt-3 text-xs leading-5 text-[#c7bda2]">
                  {era.hardware}
                </p>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <Link
                key={platform}
                href={`/catalog?search=${encodeURIComponent(platform)}`}
                className="border border-[#3c3325] bg-[#0f0e0c] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#b7e0a4] hover:border-[#6fa36f]/70"
              >
                {platform}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div className="border border-[#3c3325] bg-[#11100d] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#b59b63]">
              Why PCConfigHub?
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl text-[#f6f0df]">
              Not another disappearing forum thread
            </h2>
            <p className="mt-5 text-base leading-8 text-[#c7bda2]">
              Social posts vanish into feeds. Forum images break. Notes stay on
              private drives. PCConfigHub keeps collections organized,
              searchable, linked and preserved for the people who will need them
              next.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {preservationFeatures.map((feature) => (
              <div key={feature} className="border border-[#3c3325] bg-[#0d0c0a] p-4">
                <p className="text-sm font-bold text-[#f6f0df]">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="border border-[#d7b56d]/40 bg-[#15110a] p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#b59b63]">
              Contribute to the archive
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-[var(--font-display)] text-4xl text-[#f6f0df]">
              Your collection deserves to be preserved.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#d4c8a9]">
              Whether you own a single XT motherboard or a room full of vintage
              computers, help document computing history.
            </p>
            <Link
              href={ctaHref}
              className="mt-7 inline-flex rounded-sm border border-[#d7b56d] bg-[#d7b56d] px-7 py-4 text-xs font-black uppercase tracking-[0.22em] text-[#15110a]"
            >
              Create Your Collection
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
