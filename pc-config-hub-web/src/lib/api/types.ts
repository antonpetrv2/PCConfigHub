export type ApiCategory =
  | "motherboard"
  | "cpu"
  | "gpu"
  | "ram"
  | "psu"
  | "case"
  | "storage"
  | "soundcard";

export type CompatibilityResult = {
  compatible: boolean;
  warnings: string[];
  errors: string[];
};
