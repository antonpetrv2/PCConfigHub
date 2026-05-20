import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

const sanitizeName = (value: string) =>
  value.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();

export const saveUpload = async (file: File) => {
  await mkdir(uploadsDir, { recursive: true });

  const originalName = sanitizeName(file.name || "upload");
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  const suffix = crypto.randomBytes(6).toString("hex");
  const filename = `${baseName}-${suffix}${extension || ".bin"}`;
  const filepath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
};
