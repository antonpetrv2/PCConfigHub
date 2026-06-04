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
  "motherboard",
  "cpu",
  "gpu",
  "ram",
  "psu",
  "case",
  "storage",
  "soundcard",
]);

export const visibilitySchema = z.enum(["private", "public"]);

export const partBaseSchema = z.object({
  name: z.string().min(2),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  visibility: visibilitySchema.default("private"),
  category: partCategorySchema,
});

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
