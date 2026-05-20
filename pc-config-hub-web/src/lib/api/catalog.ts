import type { ApiCategory } from "@/lib/api/types";

export const categoryLabels: Record<ApiCategory, string> = {
  motherboard: "Motherboard",
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  psu: "PSU",
  case: "Case",
  storage: "Storage",
  soundcard: "Sound Card",
};

export const categoryOrder: ApiCategory[] = [
  "motherboard",
  "cpu",
  "gpu",
  "ram",
  "psu",
  "case",
  "storage",
  "soundcard",
];
