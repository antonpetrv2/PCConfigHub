import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  componentImages,
  components,
  cpuDetails,
  pcConfigurationComponents,
  pcConfigurations,
  users,
  videoCardDetails,
} from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import type { CompatibilityResult } from "@/lib/api/types";
import { checkCompatibility } from "@/services/api/compatibility-service";
import { getPartsByIds } from "@/services/api/parts-service";

const buildVisibilityFilter = (userId?: number) => {
  const publicFilter = and(
    eq(pcConfigurations.visibility, "public"),
    eq(pcConfigurations.approvalStatus, "approved")
  );

  if (!userId) {
    return publicFilter;
  }

  return or(publicFilter, eq(pcConfigurations.ownerUserId, userId));
};

export const listConfigs = async (data: {
  userId?: number;
  page: number;
  limit: number;
}) => {
  const where = and(isNull(pcConfigurations.deletedAt), buildVisibilityFilter(data.userId));

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(pcConfigurations)
    .where(where);

  const configs = await db
    .select({
      id: pcConfigurations.id,
      ownerUserId: pcConfigurations.ownerUserId,
      ownerName: sql<string>`coalesce(${users.displayName}, ${users.email})`,
      name: pcConfigurations.name,
      description: pcConfigurations.description,
      visibility: pcConfigurations.visibility,
      approvalStatus: pcConfigurations.approvalStatus,
      createdAt: pcConfigurations.createdAt,
    })
    .from(pcConfigurations)
    .innerJoin(users, eq(users.id, pcConfigurations.ownerUserId))
    .where(where)
    .orderBy(desc(pcConfigurations.createdAt))
    .limit(data.limit)
    .offset((data.page - 1) * data.limit);

  const configIds = configs.map((config) => config.id);
  const caseRows = configIds.length
    ? await db
        .select({
          pcConfigurationId: pcConfigurationComponents.pcConfigurationId,
          caseComponentId: components.id,
          caseName: components.name,
        })
        .from(pcConfigurationComponents)
        .innerJoin(components, eq(pcConfigurationComponents.componentId, components.id))
        .where(
          and(
            inArray(pcConfigurationComponents.pcConfigurationId, configIds),
            eq(components.type, "case"),
            isNull(components.deletedAt)
          )
        )
    : [];

  const aggregateRows = configIds.length
    ? await db
        .select({
          pcConfigurationId: pcConfigurationComponents.pcConfigurationId,
          partsCount: sql<number>`count(*)`,
          cpuTdp: sql<number>`coalesce(sum(${cpuDetails.tdp}), 0)`,
          gpuTdp: sql<number>`coalesce(sum(${videoCardDetails.tdp}), 0)`,
        })
        .from(pcConfigurationComponents)
        .innerJoin(
          components,
          eq(pcConfigurationComponents.componentId, components.id)
        )
        .leftJoin(cpuDetails, eq(cpuDetails.componentId, components.id))
        .leftJoin(videoCardDetails, eq(videoCardDetails.componentId, components.id))
        .where(
          and(
            inArray(pcConfigurationComponents.pcConfigurationId, configIds),
            isNull(components.deletedAt)
          )
        )
        .groupBy(pcConfigurationComponents.pcConfigurationId)
    : [];

  const aggregateMap = new Map<
    number,
    { partsCount: number; estimatedWattage: number }
  >();
  for (const row of aggregateRows) {
    aggregateMap.set(row.pcConfigurationId, {
      partsCount: Number(row.partsCount ?? 0),
      estimatedWattage: Number(row.cpuTdp ?? 0) + Number(row.gpuTdp ?? 0),
    });
  }

  const caseComponentIds = caseRows.map((row) => row.caseComponentId);
  const imageRows = caseComponentIds.length
    ? await db
        .select({
          componentId: componentImages.componentId,
          url: componentImages.url,
          altText: componentImages.altText,
          sortOrder: componentImages.sortOrder,
        })
        .from(componentImages)
        .where(inArray(componentImages.componentId, caseComponentIds))
        .orderBy(componentImages.sortOrder)
    : [];

  const imageMap = new Map<number, { url: string; altText: string | null }>();
  for (const row of imageRows) {
    if (!imageMap.has(row.componentId)) {
      imageMap.set(row.componentId, { url: row.url, altText: row.altText });
    }
  }

  return {
    total: Number(total ?? 0),
    configs: configs.map((config) => {
      const caseRow = caseRows.find(
        (row) => row.pcConfigurationId === config.id
      );
      const caseImage = caseRow ? imageMap.get(caseRow.caseComponentId) : null;

      return {
        id: config.id,
        name: config.name,
        ownerName: config.ownerName,
        description: config.description ?? null,
        visibility: config.visibility,
        approvalStatus: config.approvalStatus,
        ownerUserId: config.ownerUserId,
        createdAt: config.createdAt,
        coverImage: caseImage?.url ?? null,
        coverImageAlt: caseImage?.altText ?? null,
        partsCount: aggregateMap.get(config.id)?.partsCount ?? 0,
        estimatedWattage:
          aggregateMap.get(config.id)?.estimatedWattage ?? 0,
      };
    }),
  };
};

export const getConfigById = async (id: number, userId?: number) => {
  const [config] = await db
    .select({
      id: pcConfigurations.id,
      ownerUserId: pcConfigurations.ownerUserId,
      ownerName: sql<string>`coalesce(${users.displayName}, ${users.email})`,
      name: pcConfigurations.name,
      description: pcConfigurations.description,
      visibility: pcConfigurations.visibility,
      approvalStatus: pcConfigurations.approvalStatus,
      createdAt: pcConfigurations.createdAt,
    })
    .from(pcConfigurations)
    .innerJoin(users, eq(users.id, pcConfigurations.ownerUserId))
    .where(
      and(
        eq(pcConfigurations.id, id),
        isNull(pcConfigurations.deletedAt),
        buildVisibilityFilter(userId)
      )
    )
    .limit(1);

  if (!config) {
    return null;
  }

  const componentRows = await db
    .select({ componentId: pcConfigurationComponents.componentId })
    .from(pcConfigurationComponents)
    .where(eq(pcConfigurationComponents.pcConfigurationId, config.id));

  const componentIds = componentRows.map((row) => row.componentId);
  const parts = await getPartsByIds(componentIds, userId);
  const compatibility = checkCompatibility(parts);

  const casePart = parts.find((part) => part.category === "case");
  const coverImage = casePart?.images[0] ?? null;

  return {
    id: config.id,
    name: config.name,
    ownerName: config.ownerName,
    description: config.description ?? null,
    visibility: config.visibility,
    approvalStatus: config.approvalStatus,
    ownerUserId: config.ownerUserId,
    createdAt: config.createdAt,
    coverImage: coverImage?.url ?? null,
    coverImageAlt: coverImage?.altText ?? null,
    compatibility,
    parts,
  };
};

export const createConfig = async (data: {
  userId: number;
  userRole: "admin" | "moderator" | "user";
  name: string;
  description?: string;
  visibility: "private" | "public";
  partIds: number[];
}) => {
  const parts = await getPartsByIds(data.partIds, data.userId);
  if (parts.length !== data.partIds.length) {
    throw new ApiError("One or more parts are not accessible", 403);
  }

  if (!parts.some((part) => part.category === "case")) {
    throw new ApiError("A case is required", 422);
  }

  const compatibility = checkCompatibility(parts);
  if (!compatibility.compatible) {
    throw new ApiError("Compatibility check failed", 422, compatibility);
  }

  const approvalStatus =
    data.visibility === "public" && data.userRole === "user"
      ? "pending"
      : "approved";

  const [config] = await db
    .insert(pcConfigurations)
    .values({
      ownerUserId: data.userId,
      name: data.name,
      description: data.description,
      visibility: data.visibility,
      approvalStatus,
      approvedAt: approvalStatus === "approved" ? new Date() : null,
    })
    .returning({ id: pcConfigurations.id });

  await db.insert(pcConfigurationComponents).values(
    data.partIds.map((componentId) => ({
      pcConfigurationId: config.id,
      componentId,
      quantity: 1,
    }))
  );

  return { id: config.id, compatibility };
};

export const updateConfig = async (data: {
  configId: number;
  userId: number;
  userRole: "admin" | "moderator" | "user";
  name: string;
  description?: string;
  visibility: "private" | "public";
  partIds: number[];
}) => {
  const [config] = await db
    .select({ id: pcConfigurations.id, ownerUserId: pcConfigurations.ownerUserId })
    .from(pcConfigurations)
    .where(and(eq(pcConfigurations.id, data.configId), isNull(pcConfigurations.deletedAt)))
    .limit(1);

  if (!config || config.ownerUserId !== data.userId) {
    throw new ApiError("Configuration not found", 404);
  }

  const parts = await getPartsByIds(data.partIds, data.userId);
  if (parts.length !== data.partIds.length) {
    throw new ApiError("One or more parts are not accessible", 403);
  }

  if (!parts.some((part) => part.category === "case")) {
    throw new ApiError("A case is required", 422);
  }

  const compatibility = checkCompatibility(parts);
  if (!compatibility.compatible) {
    throw new ApiError("Compatibility check failed", 422, compatibility);
  }

  const approvalStatus =
    data.visibility === "public" && data.userRole === "user"
      ? "pending"
      : "approved";

  await db
    .update(pcConfigurations)
    .set({
      name: data.name,
      description: data.description,
      visibility: data.visibility,
      approvalStatus,
      approvedAt: approvalStatus === "approved" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(pcConfigurations.id, data.configId));

  await db
    .delete(pcConfigurationComponents)
    .where(eq(pcConfigurationComponents.pcConfigurationId, data.configId));

  await db.insert(pcConfigurationComponents).values(
    data.partIds.map((componentId) => ({
      pcConfigurationId: data.configId,
      componentId,
      quantity: 1,
    }))
  );

  return { id: data.configId, compatibility };
};

export const deleteConfig = async (data: { configId: number; userId: number }) => {
  const [config] = await db
    .select({ id: pcConfigurations.id, ownerUserId: pcConfigurations.ownerUserId })
    .from(pcConfigurations)
    .where(and(eq(pcConfigurations.id, data.configId), isNull(pcConfigurations.deletedAt)))
    .limit(1);

  if (!config || config.ownerUserId !== data.userId) {
    throw new ApiError("Configuration not found", 404);
  }

  await db
    .update(pcConfigurations)
    .set({ deletedAt: new Date() })
    .where(eq(pcConfigurations.id, data.configId));
};

export const checkConfigCompatibility = async (data: {
  partIds: number[];
  userId?: number;
}) => {
  const parts = await getPartsByIds(data.partIds, data.userId);
  if (parts.length !== data.partIds.length) {
    throw new ApiError("One or more parts are not accessible", 403);
  }

  return checkCompatibility(parts);
};
