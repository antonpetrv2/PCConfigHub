import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";

import { db } from "@/db/client";
import {
  caseDetails,
  caseSupportedPsuTypes,
  componentImages,
  components,
  motherboardDetails,
  powerSupplyDetails,
  soundCardDetails,
  videoCardDetails,
} from "@/db/schema";
import type { CatalogComponent, ComponentType } from "@/types/component-types";

const buildVisibilityFilter = (userId?: number) => {
  const publicFilter = and(
    eq(components.visibility, "public"),
    eq(components.approvalStatus, "approved")
  );

  if (!userId) {
    return publicFilter;
  }

  return or(publicFilter, eq(components.ownerUserId, userId));
};

export const listCatalogComponents = async (userId?: number) => {
  const baseFilter = buildVisibilityFilter(userId);
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
      formFactor: caseDetails.formFactor,
      psuType: powerSupplyDetails.psuType,
      wattage: powerSupplyDetails.wattage,
    })
    .from(components)
    .leftJoin(motherboardDetails, eq(motherboardDetails.componentId, components.id))
    .leftJoin(videoCardDetails, eq(videoCardDetails.componentId, components.id))
    .leftJoin(soundCardDetails, eq(soundCardDetails.componentId, components.id))
    .leftJoin(caseDetails, eq(caseDetails.componentId, components.id))
    .leftJoin(powerSupplyDetails, eq(powerSupplyDetails.componentId, components.id))
    .where(and(isNull(components.deletedAt), baseFilter))
    .orderBy(asc(components.type), asc(components.name));

  const componentIds = componentRows.map((row) => row.id);
  const imageRows = componentIds.length
    ? await db
        .select({
          componentId: componentImages.componentId,
          url: componentImages.url,
          altText: componentImages.altText,
          sortOrder: componentImages.sortOrder,
        })
        .from(componentImages)
        .where(inArray(componentImages.componentId, componentIds))
        .orderBy(asc(componentImages.sortOrder))
    : [];

  const primaryImageByComponent = new Map<number, { url: string; alt: string | null }>();
  for (const image of imageRows) {
    if (!primaryImageByComponent.has(image.componentId)) {
      primaryImageByComponent.set(image.componentId, {
        url: image.url,
        alt: image.altText ?? null,
      });
    }
  }

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

  return componentRows.map((row) => {
    const primaryImage = primaryImageByComponent.get(row.id);

    const component: CatalogComponent = {
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
      formFactor: row.formFactor ?? null,
      psuType: row.psuType ?? null,
      wattage: row.wattage ?? null,
      psuTypes: psuTypesByCase.get(row.id) ?? [],
      imageUrl: primaryImage?.url ?? null,
      imageAlt: primaryImage?.alt ?? null,
    };

    return component;
  });
};

