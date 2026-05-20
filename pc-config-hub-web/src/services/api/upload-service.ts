import crypto from "crypto";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import { ApiError } from "@/lib/api/errors";

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

const getR2Config = (): R2Config => {
  const endpoint = process.env.R2_URL;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new ApiError("R2 configuration is missing", 500);
  }

  return { endpoint, accessKeyId, secretAccessKey, bucketName, publicUrl };
};

const createClient = (config: R2Config) =>
  new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

const sanitizeName = (value: string) =>
  value.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();

const buildObjectKey = (filename: string) => {
  const safeName = sanitizeName(filename || "upload");
  const extension = path.extname(safeName);
  const baseName = path.basename(safeName, extension);
  const suffix = crypto.randomBytes(8).toString("hex");
  return `parts/${baseName}-${suffix}${extension || ".bin"}`;
};

const buildPublicUrl = (publicBase: string, key: string) => {
  const trimmed = publicBase.endsWith("/")
    ? publicBase.slice(0, -1)
    : publicBase;
  return `${trimmed}/${key}`;
};

const getObjectKeyFromUrl = (url: string, publicBase: string) => {
  const trimmedBase = publicBase.endsWith("/")
    ? publicBase.slice(0, -1)
    : publicBase;

  if (url.startsWith(trimmedBase)) {
    return url.slice(trimmedBase.length).replace(/^\//, "");
  }

  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
};

export const uploadFile = async (file: File) => {
  const config = getR2Config();
  const client = createClient(config);
  const key = buildObjectKey(file.name);
  const body = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    url: buildPublicUrl(config.publicUrl, key),
    key,
  };
};

export const deleteObjectByUrl = async (url: string) => {
  if (!url.startsWith("http")) {
    return false;
  }

  const config = getR2Config();
  const key = getObjectKeyFromUrl(url, config.publicUrl);
  if (!key) {
    return false;
  }

  const client = createClient(config);
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })
  );

  return true;
};
