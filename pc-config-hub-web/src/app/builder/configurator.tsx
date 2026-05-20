"use client";

import { useMemo, useState } from "react";

import type {
  CatalogComponent,
  ComponentType,
} from "@/types/component-types";
import { componentTypeLabels } from "@/types/component-types";

type ConfiguratorProps = {
  components: CatalogComponent[];
};

type SelectionState = Record<ComponentType, number | "">;

const componentTypes: ComponentType[] = [
  "motherboard",
  "cpu",
  "ram",
  "storage",
  "video_card",
  "sound_card",
  "case",
  "power_supply",
];

const createInitialSelection = (): SelectionState => ({
  motherboard: "",
  cpu: "",
  ram: "",
  storage: "",
  video_card: "",
  sound_card: "",
  case: "",
  power_supply: "",
});

const getComponentById = (
  components: CatalogComponent[],
  id: number | ""
) => components.find((component) => component.id === id) ?? null;

export default function Configurator({ components }: ConfiguratorProps) {
  const [selection, setSelection] = useState<SelectionState>(() =>
    createInitialSelection()
  );

  const componentsByType = useMemo(() => {
    return components.reduce<Record<ComponentType, CatalogComponent[]>>(
      (acc, component) => {
        acc[component.type].push(component);
        return acc;
      },
      {
        motherboard: [],
        cpu: [],
        ram: [],
        storage: [],
        video_card: [],
        sound_card: [],
        case: [],
        power_supply: [],
      }
    );
  }, [components]);

  const compatibility = useMemo(() => {
    const motherboard = getComponentById(components, selection.motherboard);
    const videoCard = getComponentById(components, selection.video_card);
    const soundCard = getComponentById(components, selection.sound_card);
    const caseComponent = getComponentById(components, selection.case);
    const powerSupply = getComponentById(components, selection.power_supply);

    const issues: string[] = [];
    const warnings: string[] = [];

    if (!caseComponent) {
      issues.push("A case is required for every configuration.");
    }

    if (motherboard && videoCard) {
      if (motherboard.gpuSlotType && videoCard.videoSlotType) {
        if (motherboard.gpuSlotType !== videoCard.videoSlotType) {
          issues.push("GPU slot does not match the motherboard.");
        }
      } else {
        warnings.push("GPU slot type is missing for compatibility check.");
      }
    }

    if (motherboard && soundCard) {
      if (motherboard.soundSlotType && soundCard.soundCardSlotType) {
        if (motherboard.soundSlotType !== soundCard.soundCardSlotType) {
          issues.push("Sound card slot does not match the motherboard.");
        }
      } else {
        warnings.push("Sound slot type is missing for compatibility check.");
      }
    }

    if (caseComponent && powerSupply) {
      if (caseComponent.psuTypes?.length && powerSupply.psuType) {
        if (!caseComponent.psuTypes.includes(powerSupply.psuType)) {
          issues.push("Power supply type is not supported by the case.");
        }
      } else {
        warnings.push("Case PSU support is incomplete for compatibility check.");
      }
    }

    return {
      issues,
      warnings,
      selection: {
        motherboard,
        videoCard,
        soundCard,
        caseComponent,
        powerSupply,
      },
    };
  }, [components, selection]);

  const canSave = compatibility.issues.length === 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[#0f0e1b]/90 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
              Configure your build
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Live compatibility
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {componentTypes.map((type) => (
              <label key={type} className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                  {componentTypeLabels[type]}
                </span>
                <select
                  className="rounded-2xl border border-white/10 bg-[#121126] px-4 py-3 text-sm text-[#f2f3ff]"
                  value={selection[type]}
                  onChange={(event) => {
                    const value = event.target.value
                      ? Number(event.target.value)
                      : "";
                    setSelection((prev) => ({ ...prev, [type]: value }));
                  }}
                >
                  <option value="">Select {componentTypeLabels[type]}</option>
                  {componentsByType[type].map((component) => (
                    <option key={component.id} value={component.id}>
                      {component.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Summary
            </p>
            <ul className="mt-3 space-y-2">
              {Object.entries(compatibility.selection).map(([key, value]) => (
                <li key={key} className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
                    {componentTypeLabels[key as ComponentType]}
                  </span>
                  <span className="text-[#f2f3ff]">
                    {value?.name ?? "Not selected"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0f0e1b]/90 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Compatibility status
            </p>
            <div className="mt-3 space-y-3 text-sm">
              {compatibility.issues.length ? (
                <div className="rounded-2xl border border-[#ff5bf1]/40 bg-[#1a1122] px-4 py-3 text-[#ff5bf1]">
                  {compatibility.issues.map((issue) => (
                    <p key={issue}>{issue}</p>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#30f2ff]/40 bg-[#0f1622] px-4 py-3 text-[#30f2ff]">
                  All selected components are compatible.
                </div>
              )}
              {compatibility.warnings.length ? (
                <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-[#ffd166]">
                  {compatibility.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              disabled={!canSave}
              className={`mt-4 w-full rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                canSave
                  ? "bg-[#30f2ff] text-[#0c0b14]"
                  : "cursor-not-allowed border border-white/10 bg-[#121126] text-[#b3b7d4]"
              }`}
            >
              Save configuration
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#ffd166]/40 bg-[#16142b]/80 p-5 text-sm text-[#ffd166]">
        Public configurations and components can be commented on, but comments
        appear only after moderator approval.
      </div>
    </div>
  );
}
