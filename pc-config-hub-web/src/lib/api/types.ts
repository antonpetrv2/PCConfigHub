export type ApiCategory =
  | "complete_computer"
  | "drive"
  | "expansion_card"
  | "motherboard"
  | "cpu"
  | "ram"
  | "video_card"
  | "sound_card"
  | "storage"
  | "floppy_drive"
  | "optical_drive"
  | "controller_card"
  | "network_card"
  | "io_card"
  | "case"
  | "psu"
  | "monitor"
  | "keyboard"
  | "mouse"
  | "external_module"
  | "midi_module"
  | "cable_adapter"
  | "software_driver"
  | "documentation"
  | "other";

export type ItemCondition =
  | "working"
  | "partially_working"
  | "untested"
  | "for_repair"
  | "dead";

export type CompatibilityResult = {
  compatible: boolean;
  warnings: string[];
  errors: string[];
};
