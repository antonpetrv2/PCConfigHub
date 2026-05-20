import type { ApiCategory } from "@/lib/api/types";

export const toDbComponentType = (category: ApiCategory) => {
  switch (category) {
    case "gpu":
      return "video_card";
    case "soundcard":
      return "sound_card";
    case "psu":
      return "power_supply";
    default:
      return category;
  }
};

export const fromDbComponentType = (value: string) => {
  switch (value) {
    case "video_card":
      return "gpu";
    case "sound_card":
      return "soundcard";
    case "power_supply":
      return "psu";
    default:
      return value;
  }
};
