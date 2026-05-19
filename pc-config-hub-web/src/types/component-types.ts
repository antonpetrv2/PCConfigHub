export type ComponentType =
  | "motherboard"
  | "video_card"
  | "sound_card"
  | "case"
  | "power_supply";

export type CatalogComponent = {
  id: number;
  type: ComponentType;
  ownerUserId: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
  visibility: "private" | "public";
  approvalStatus: "pending" | "approved" | "rejected";
  cpuSocket?: string | null;
  ramType?: string | null;
  ramSlots?: number | null;
  gpuSlotType?: string | null;
  soundSlotType?: string | null;
  videoSlotType?: string | null;
  soundCardSlotType?: string | null;
  vramGb?: number | null;
  formFactor?: string | null;
  psuType?: string | null;
  wattage?: number | null;
  psuTypes?: string[];
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export const componentTypeLabels: Record<ComponentType, string> = {
  motherboard: "Motherboards",
  video_card: "Video cards",
  sound_card: "Sound cards",
  case: "Cases",
  power_supply: "Power supplies",
};
