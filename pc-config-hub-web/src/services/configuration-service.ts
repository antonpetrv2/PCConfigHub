import { and, asc, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  caseSupportedPsuTypes,
  componentImages,
  components,
  motherboardDetails,
  pcConfigurationComponents,
  pcConfigurations,
  powerSupplyDetails,
  soundCardDetails,
  videoCardDetails,
} from "@/db/schema";

import type { CatalogComponent } from "@/types/component-types";

export type ConfigurationSummary = {
  id: number;
  name: string;
  description: string | null;
  visibility: "private" | "public";
  approvalStatus: "pending" | "approved" | "rejected";
  ownerUserId: number;
  createdAt: Date;
  componentCount: number;
  caseComponentId: number | null;
  caseName: string | null;
  caseImageUrl: string | null;
  caseImageAlt: string | null;
};

export type ConfigurationDetails = {
  summary: ConfigurationSummary;
  components: CatalogComponent[];
};

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

const mapPrimaryImages = async (componentIds: number[]) => {
  if (!componentIds.length) {
    return new Map<number, { url: string; alt: string | null }>();
  }

  const imageRows = await db
    .select({
      componentId: componentImages.componentId,
      url: componentImages.url,
      altText: componentImages.altText,
      sortOrder: componentImages.sortOrder,
    })
    .from(componentImages)
    .where(inArray(componentImages.componentId, componentIds))
    .orderBy(asc(componentImages.sortOrder));

  const imageMap = new Map<number, { url: string; alt: string | null }>();
  for (const image of imageRows) {
    if (!imageMap.has(image.componentId)) {
      imageMap.set(image.componentId, {
        url: image.url,
        alt: image.altText ?? null,
      });
    }
  }

  return imageMap;
};

export const listVisibleConfigurations = async (userId?: number) => {
  const baseFilter = buildVisibilityFilter(userId);

  const configRows = await db
    .select({
      id: pcConfigurations.id,
      name: pcConfigurations.name,
      description: pcConfigurations.description,
      visibility: pcConfigurations.visibility,
      approvalStatus: pcConfigurations.approvalStatus,
      ownerUserId: pcConfigurations.ownerUserId,
      createdAt: pcConfigurations.createdAt,
    })
    .from(pcConfigurations)
    .where(and(isNull(pcConfigurations.deletedAt), baseFilter))
    .orderBy(desc(pcConfigurations.createdAt));

  if (!configRows.length) {
    return [] as ConfigurationSummary[];
  }

  const configIds = configRows.map((row) => row.id);

  const counts = await db
    .select({
      pcConfigurationId: pcConfigurationComponents.pcConfigurationId,
      total: sql<number>`count(*)`,
    })
    .from(pcConfigurationComponents)
    .where(inArray(pcConfigurationComponents.pcConfigurationId, configIds))
    .groupBy(pcConfigurationComponents.pcConfigurationId);

  const countMap = new Map<number, number>();
  for (const row of counts) {
    countMap.set(row.pcConfigurationId, Number(row.total));
  }

  const caseRows = await db
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
    );

  const caseByConfig = new Map<number, { id: number; name: string }>();
  for (const row of caseRows) {
    if (!caseByConfig.has(row.pcConfigurationId)) {
      caseByConfig.set(row.pcConfigurationId, {
        id: row.caseComponentId,
        name: row.caseName,
      });
    }
  }

  const caseComponentIds = Array.from(caseByConfig.values()).map((row) => row.id);
  const caseImages = await mapPrimaryImages(caseComponentIds);

  return configRows
    .filter((row) => caseByConfig.has(row.id))
    .map((row) => {
      const caseInfo = caseByConfig.get(row.id) ?? null;
      const caseImage = caseInfo ? caseImages.get(caseInfo.id) : null;

      return {
        id: row.id,
        name: row.name,
        description: row.description ?? null,
        visibility: row.visibility,
        approvalStatus: row.approvalStatus,
        ownerUserId: row.ownerUserId,
        createdAt: row.createdAt,
        componentCount: countMap.get(row.id) ?? 0,
        caseComponentId: caseInfo?.id ?? null,
        caseName: caseInfo?.name ?? null,
        caseImageUrl: caseImage?.url ?? null,
        caseImageAlt: caseImage?.alt ?? null,
      } satisfies ConfigurationSummary;
    });
};

export const getConfigurationDetails = async (
  configurationId: number,
  userId?: number
): Promise<ConfigurationDetails | null> => {
  const baseFilter = buildVisibilityFilter(userId);

  const [config] = await db
    .select({
      id: pcConfigurations.id,
      name: pcConfigurations.name,
      description: pcConfigurations.description,
      visibility: pcConfigurations.visibility,
      approvalStatus: pcConfigurations.approvalStatus,
      ownerUserId: pcConfigurations.ownerUserId,
      createdAt: pcConfigurations.createdAt,
    })
    .from(pcConfigurations)
    .where(
      and(
        eq(pcConfigurations.id, configurationId),
        isNull(pcConfigurations.deletedAt),
        baseFilter
      )
    )
    .limit(1);

  if (!config) {
    return null;
  }

  const componentRows = await db
    .select({
      id: components.id,
      type: components.type,
      ownerUserId: components.ownerUserId,
      name: components.name,
      manufacturer: components.manufacturer,
      model: components.model,
      description: components.description,
      visibility: components.visibility,
      approvalStatus: components.approvalStatus,
      cpuSocket: motherboardDetails.cpuSocket,
      ramType: motherboardDetails.ramType,
      ramSlots: motherboardDetails.ramSlots,
      gpuSlotType: motherboardDetails.gpuSlotType,
      soundSlotType: motherboardDetails.soundSlotType,
      videoSlotType: videoCardDetails.slotType,
      vramGb: videoCardDetails.vramGb,
      soundCardSlotType: soundCardDetails.slotType,
      psuType: powerSupplyDetails.psuType,
      wattage: powerSupplyDetails.wattage,
    })
    .from(pcConfigurationComponents)
    .innerJoin(components, eq(pcConfigurationComponents.componentId, components.id))
    .leftJoin(motherboardDetails, eq(motherboardDetails.componentId, components.id))
    .leftJoin(videoCardDetails, eq(videoCardDetails.componentId, components.id))
    .leftJoin(soundCardDetails, eq(soundCardDetails.componentId, components.id))
    .leftJoin(powerSupplyDetails, eq(powerSupplyDetails.componentId, components.id))
    .where(
      and(
        eq(pcConfigurationComponents.pcConfigurationId, configurationId),
        isNull(components.deletedAt)
      )
    )
    .orderBy(components.type);

  const componentIds = componentRows.map((row) => row.id);
  const imageMap = await mapPrimaryImages(componentIds);

  const caseComponentIds = componentRows
    .filter((row) => row.type === "case")
    .map((row) => row.id);
  const casePsuRows = caseComponentIds.length
    ? await db
        .select({
          caseComponentId: caseSupportedPsuTypes.caseComponentId,
          psuType: caseSupportedPsuTypes.psuType,
        })
        .from(caseSupportedPsuTypes)
        .where(inArray(caseSupportedPsuTypes.caseComponentId, caseComponentIds))
    : [];

  const psuTypesByCase = new Map<number, string[]>();
  for (const row of casePsuRows) {
    const list = psuTypesByCase.get(row.caseComponentId) ?? [];
    list.push(row.psuType);
    psuTypesByCase.set(row.caseComponentId, list);
  }

  const componentsList: CatalogComponent[] = componentRows.map((row) => {
    const image = imageMap.get(row.id);

    return {
      id: row.id,
      type: row.type,
      ownerUserId: row.ownerUserId,
      name: row.name,
      manufacturer: row.manufacturer ?? null,
      model: row.model ?? null,
      description: row.description ?? null,
      visibility: row.visibility,
      approvalStatus: row.approvalStatus,
      cpuSocket: row.cpuSocket ?? null,
      ramType: row.ramType ?? null,
      ramSlots: row.ramSlots ?? null,
      gpuSlotType: row.gpuSlotType ?? null,
      soundSlotType: row.soundSlotType ?? null,
      videoSlotType: row.videoSlotType ?? null,
      soundCardSlotType: row.soundCardSlotType ?? null,
      vramGb: row.vramGb ?? null,
      psuType: row.psuType ?? null,
      wattage: row.wattage ?? null,
      psuTypes: psuTypesByCase.get(row.id) ?? [],
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? null,
    };
  });

  const caseComponent = componentsList.find((item) => item.type === "case") ?? null;
  const summary: ConfigurationSummary = {
    id: config.id,
    name: config.name,
    description: config.description ?? null,
    visibility: config.visibility,
    approvalStatus: config.approvalStatus,
    ownerUserId: config.ownerUserId,
    createdAt: config.createdAt,
    componentCount: componentsList.length,
    caseComponentId: caseComponent?.id ?? null,
    caseName: caseComponent?.name ?? null,
    caseImageUrl: caseComponent?.imageUrl ?? null,
    caseImageAlt: caseComponent?.imageAlt ?? null,
  };

  return {
    summary,
    components: componentsList,
  };
};
