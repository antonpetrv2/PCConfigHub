import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { components, pcConfigurations } from "@/db/schema";

export const hasPart = async (partId: number) => {
  const [part] = await db
    .select({ id: components.id })
    .from(components)
    .where(and(eq(components.id, partId), isNull(components.deletedAt)))
    .limit(1);

  return Boolean(part);
};

export const hasConfig = async (configId: number) => {
  const [config] = await db
    .select({ id: pcConfigurations.id })
    .from(pcConfigurations)
    .where(and(eq(pcConfigurations.id, configId), isNull(pcConfigurations.deletedAt)))
    .limit(1);

  return Boolean(config);
};
