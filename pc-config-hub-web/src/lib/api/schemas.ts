import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const partCategorySchema = z.enum([
  "complete_computer",
  "drive",
  "expansion_card",
  "motherboard",
  "cpu",
  "ram",
  "video_card",
  "sound_card",
  "storage",
  "floppy_drive",
  "optical_drive",
  "controller_card",
  "network_card",
  "io_card",
  "case",
  "psu",
  "monitor",
  "keyboard",
  "mouse",
  "external_module",
  "midi_module",
  "cable_adapter",
  "software_driver",
  "documentation",
  "other",
]);

export const visibilitySchema = z.enum(["private", "public"]);

export const conditionSchema = z
  .enum(["working", "partially_working", "untested", "for_repair", "dead"])
  .default("untested");

const stringArraySchema = z
  .array(z.string())
  .or(z.string())
  .optional()
  .transform((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  });

const recordSchema = z.record(z.string(), z.unknown()).default({});

const logEntrySchema = z.object({
  date: z.string().optional(),
  testType: z.string().optional(),
  result: z.string().optional(),
  softwareUsed: z.string().optional(),
  notes: z.string().optional(),
  workPerformed: z.string().optional(),
  partsReplaced: z.string().optional(),
  problemsFound: z.string().optional(),
  photos: stringArraySchema,
  photosBefore: stringArraySchema,
  photosAfter: stringArraySchema,
});

export const partBaseSchema = z.object({
  name: z.string().min(2),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  yearEra: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  serialNumber: z.string().optional(),
  inventoryNumber: z.string().optional(),
  condition: conditionSchema,
  visibility: visibilitySchema.default("private"),
  description: z.string().optional(),
  notes: z.string().optional(),
  tags: stringArraySchema,
  location: z.string().optional(),
  acquisitionDate: z.string().optional(),
  source: z.string().optional(),
  purchasePrice: z.string().optional(),
  estimatedValue: z.string().optional(),
  relatedConfigurationId: z.number().int().positive().optional().nullable(),
  category: partCategorySchema,
  specs: recordSchema,
  customFields: recordSchema,
  testLogs: z.array(logEntrySchema).default([]),
  restorationLogs: z.array(logEntrySchema).default([]),
});

export const legacyPartCategorySchema = z.enum([
  "motherboard",
  "cpu",
  "gpu",
  "ram",
  "psu",
  "case",
  "storage",
  "soundcard",
]);

export const motherboardSpecSchema = z.object({
  socket: z.string().min(1),
  formFactor: z.string().min(1),
  ramSlots: z.number().int().positive(),
  ramType: z.string().min(1),
  pciSlots: z.array(z.string().min(1)).min(1),
});

export const cpuSpecSchema = z.object({
  socket: z.string().min(1),
  tdp: z.number().int().positive(),
  cores: z.number().int().positive(),
  threads: z.number().int().positive(),
});

export const gpuSpecSchema = z.object({
  pciSlot: z.string().min(1),
  tdp: z.number().int().positive(),
  vram: z.number().int().positive(),
  length: z.number().int().positive().optional(),
});

export const ramSpecSchema = z.object({
  type: z.string().min(1),
  capacity: z.number().int().positive(),
  speed: z.number().int().positive(),
  slots: z.number().int().positive(),
});

export const psuSpecSchema = z.object({
  wattage: z.number().int().positive(),
  formFactor: z.string().min(1),
  modular: z.boolean(),
});

export const caseSpecSchema = z.object({
  formFactor: z.array(z.string().min(1)).min(1),
  psuFormFactor: z.string().min(1),
  maxGpuLength: z.number().int().positive(),
});

export const storageSpecSchema = z.object({
  interface: z.string().min(1),
  capacity: z.number().int().positive(),
  type: z.enum(["SSD", "HDD", "NVMe"]),
});

export const soundcardSpecSchema = z.object({
  pciSlot: z.string().min(1),
});

export const configSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  visibility: visibilitySchema.default("private"),
  parts: z.array(z.number().int().positive()).min(1),
});

export const compatibilitySchema = z.object({
  parts: z.array(z.number().int().positive()).min(1),
});

export const commentSchema = z.object({
  body: z.string().trim().min(2).max(1000),
});

export const roleSchema = z.enum(["user", "moderator", "admin"]);
