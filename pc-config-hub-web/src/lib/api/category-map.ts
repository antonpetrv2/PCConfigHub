import type { ApiCategory } from "@/lib/api/types";

export const toDbComponentType = (category: ApiCategory) => {
  switch (category) {
    case "complete_computer":
      return "case";
    case "video_card":
      return "video_card";
    case "sound_card":
      return "sound_card";
    case "psu":
      return "power_supply";
    case "floppy_drive":
    case "optical_drive":
    case "drive":
      return "storage";
    case "controller_card":
    case "network_card":
    case "io_card":
    case "expansion_card":
      return "sound_card";
    case "monitor":
    case "keyboard":
    case "mouse":
    case "external_module":
    case "midi_module":
    case "cable_adapter":
    case "software_driver":
    case "documentation":
    case "other":
      return "case";
    default:
      return category;
  }
};

export const fromDbComponentType = (value: string) => {
  switch (value) {
    case "video_card":
      return "video_card";
    case "sound_card":
      return "sound_card";
    case "power_supply":
      return "psu";
    default:
      return value;
  }
};
