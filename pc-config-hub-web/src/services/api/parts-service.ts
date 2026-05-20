import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db/client";
import {
  caseDetails,
  componentImages,
  components,
  cpuDetails,
  motherboardDetails,
  powerSupplyDetails,
  ramDetails,
  soundCardDetails,
  storageDetails,
  videoCardDetails,
} from "@/db/schema";
import { toDbComponentType, fromDbComponentType } from "@/lib/api/category-map";
import { ApiError } from "@/lib/api/errors";
import type { ApiCategory } from "@/lib/api/types";

export type PartImage = {
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type PartRecord = {
  id: number;
  category: ApiCategory;
  ownerUserId: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
  visibility: "private" | "public";
  approvalStatus: "pending" | "approved" | "rejected";
  specs: Record<string, unknown>;
  images: PartImage[];
};

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

const mapSpecs = (row: {
  type: string;
  cpuSocket: string | null;
  motherboardFormFactor: string | null;
  ramType: string | null;
  ramSlots: number | null;
  pciSlots: string[] | null;
  gpuSlotType: string | null;
  soundSlotType: string | null;
  cpuSocketValue: string | null;
  cpuTdp: number | null;
  cpuCores: number | null;
  cpuThreads: number | null;
  videoSlotType: string | null;
  videoTdp: number | null;
  videoLength: number | null;
  vramGb: number | null;
  ramTypeValue: string | null;
  ramCapacityGb: number | null;
  ramSpeedMhz: number | null;
  ramSlotsValue: number | null;
  psuType: string | null;
  psuFormFactor: string | null;
  psuModular: boolean | null;
  psuWattage: number | null;
  caseFormFactor: string | null;
  caseFormFactors: string[] | null;
  casePsuFormFactor: string | null;
  caseMaxGpuLength: number | null;
  storageInterface: string | null;
  storageCapacityGb: number | null;
  storageType: string | null;
  soundSlotTypeValue: string | null;
}) => {
  const category = fromDbComponentType(row.type) as ApiCategory;

  switch (category) {
    case "motherboard": {
      const derivedPciSlots = [row.gpuSlotType, row.soundSlotType].filter(
        (value): value is string => Boolean(value)
      );
      return {
        socket: row.cpuSocket,
        formFactor: row.motherboardFormFactor,
        ramSlots: row.ramSlots,
        ramType: row.ramType,
        pciSlots: row.pciSlots?.length ? row.pciSlots : derivedPciSlots,
      };
    }
    case "cpu":
      return {
        socket: row.cpuSocketValue,
        tdp: row.cpuTdp,
        cores: row.cpuCores,
        threads: row.cpuThreads,
      };
    case "gpu":
      return {
        pciSlot: row.videoSlotType,
        tdp: row.videoTdp,
        vram: row.vramGb,
        length: row.videoLength,
      };
    case "ram":
      return {
        type: row.ramTypeValue,
        capacity: row.ramCapacityGb,
        speed: row.ramSpeedMhz,
        slots: row.ramSlotsValue,
      };
    case "psu":
      return {
        wattage: row.psuWattage,
        formFactor: row.psuFormFactor ?? row.psuType,
        modular: row.psuModular ?? false,
      };
    case "case":
      return {
        formFactor:
          row.caseFormFactors?.length && row.caseFormFactors.length > 0
            ? row.caseFormFactors
            : row.caseFormFactor
              ? [row.caseFormFactor]
              : [],
        psuFormFactor: row.casePsuFormFactor,
        maxGpuLength: row.caseMaxGpuLength,
      };
    case "storage":
      return {
        interface: row.storageInterface,
        capacity: row.storageCapacityGb,
        type: row.storageType,
      };
    case "soundcard":
      return {
        pciSlot: row.soundSlotTypeValue,
      };
    default:
      return {};
  }
};

const mapImageList = (rows: Array<{ componentId: number; url: string; altText: string | null; sortOrder: number }>) => {
  const images = new Map<number, PartImage[]>();
  for (const row of rows) {
    const list = images.get(row.componentId) ?? [];
    list.push({ url: row.url, altText: row.altText, sortOrder: row.sortOrder });
    images.set(row.componentId, list);
  }
  return images;
};

const buildBaseQuery = (userId?: number, category?: ApiCategory, search?: string) => {
  const conditions = [isNull(components.deletedAt), buildVisibilityFilter(userId)];

  if (category) {
    conditions.push(eq(components.type, toDbComponentType(category)));
  }

  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        ilike(components.name, term),
        ilike(components.manufacturer, term),
        ilike(components.model, term)
      )
    );
  }

  return and(...conditions);
};

export const listParts = async (data: {
  userId?: number;
  category?: ApiCategory;
  search?: string;
  page: number;
  limit: number;
}) => {
  const where = buildBaseQuery(data.userId, data.category, data.search);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(components)
    .where(where);

  const rows = await db
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
      motherboardFormFactor: motherboardDetails.formFactor,
      ramType: motherboardDetails.ramType,
      ramSlots: motherboardDetails.ramSlots,
      pciSlots: motherboardDetails.pciSlots,
      gpuSlotType: motherboardDetails.gpuSlotType,
      soundSlotType: motherboardDetails.soundSlotType,
      cpuSocketValue: cpuDetails.socket,
      cpuTdp: cpuDetails.tdp,
      cpuCores: cpuDetails.cores,
      cpuThreads: cpuDetails.threads,
      videoSlotType: videoCardDetails.slotType,
      videoTdp: videoCardDetails.tdp,
      videoLength: videoCardDetails.lengthMm,
      vramGb: videoCardDetails.vramGb,
      ramTypeValue: ramDetails.type,
      ramCapacityGb: ramDetails.capacityGb,
      ramSpeedMhz: ramDetails.speedMhz,
      ramSlotsValue: ramDetails.slots,
      psuType: powerSupplyDetails.psuType,
      psuFormFactor: powerSupplyDetails.formFactor,
      psuModular: powerSupplyDetails.modular,
      psuWattage: powerSupplyDetails.wattage,
      caseFormFactor: caseDetails.formFactor,
      caseFormFactors: caseDetails.formFactors,
      casePsuFormFactor: caseDetails.psuFormFactor,
      caseMaxGpuLength: caseDetails.maxGpuLength,
      storageInterface: storageDetails.interface,
      storageCapacityGb: storageDetails.capacityGb,
      storageType: storageDetails.type,
      soundSlotTypeValue: soundCardDetails.slotType,
    })
    .from(components)
    .leftJoin(motherboardDetails, eq(motherboardDetails.componentId, components.id))
    .leftJoin(cpuDetails, eq(cpuDetails.componentId, components.id))
    .leftJoin(videoCardDetails, eq(videoCardDetails.componentId, components.id))
    .leftJoin(ramDetails, eq(ramDetails.componentId, components.id))
    .leftJoin(powerSupplyDetails, eq(powerSupplyDetails.componentId, components.id))
    .leftJoin(caseDetails, eq(caseDetails.componentId, components.id))
    .leftJoin(storageDetails, eq(storageDetails.componentId, components.id))
    .leftJoin(soundCardDetails, eq(soundCardDetails.componentId, components.id))
    .where(where)
    .orderBy(desc(components.createdAt), asc(components.id))
    .limit(data.limit)
    .offset((data.page - 1) * data.limit);

  const componentIds = rows.map((row) => row.id);
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

  const imagesByComponent = mapImageList(imageRows);

  return {
    total: Number(total ?? 0),
    parts: rows.map((row) => ({
      id: row.id,
      category: fromDbComponentType(row.type) as ApiCategory,
      ownerUserId: row.ownerUserId,
      name: row.name,
      manufacturer: row.manufacturer ?? null,
      model: row.model ?? null,
      description: row.description ?? null,
      visibility: row.visibility,
      approvalStatus: row.approvalStatus,
      specs: mapSpecs(row),
      images: imagesByComponent.get(row.id) ?? [],
    })) satisfies PartRecord[],
  };
};

export const getPartById = async (id: number, userId?: number) => {
  const where = and(
    eq(components.id, id),
    buildVisibilityFilter(userId),
    isNull(components.deletedAt)
  );

  const [row] = await db
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
      motherboardFormFactor: motherboardDetails.formFactor,
      ramType: motherboardDetails.ramType,
      ramSlots: motherboardDetails.ramSlots,
      pciSlots: motherboardDetails.pciSlots,
      gpuSlotType: motherboardDetails.gpuSlotType,
      soundSlotType: motherboardDetails.soundSlotType,
      cpuSocketValue: cpuDetails.socket,
      cpuTdp: cpuDetails.tdp,
      cpuCores: cpuDetails.cores,
      cpuThreads: cpuDetails.threads,
      videoSlotType: videoCardDetails.slotType,
      videoTdp: videoCardDetails.tdp,
      videoLength: videoCardDetails.lengthMm,
      vramGb: videoCardDetails.vramGb,
      ramTypeValue: ramDetails.type,
      ramCapacityGb: ramDetails.capacityGb,
      ramSpeedMhz: ramDetails.speedMhz,
      ramSlotsValue: ramDetails.slots,
      psuType: powerSupplyDetails.psuType,
      psuFormFactor: powerSupplyDetails.formFactor,
      psuModular: powerSupplyDetails.modular,
      psuWattage: powerSupplyDetails.wattage,
      caseFormFactor: caseDetails.formFactor,
      caseFormFactors: caseDetails.formFactors,
      casePsuFormFactor: caseDetails.psuFormFactor,
      caseMaxGpuLength: caseDetails.maxGpuLength,
      storageInterface: storageDetails.interface,
      storageCapacityGb: storageDetails.capacityGb,
      storageType: storageDetails.type,
      soundSlotTypeValue: soundCardDetails.slotType,
    })
    .from(components)
    .leftJoin(motherboardDetails, eq(motherboardDetails.componentId, components.id))
    .leftJoin(cpuDetails, eq(cpuDetails.componentId, components.id))
    .leftJoin(videoCardDetails, eq(videoCardDetails.componentId, components.id))
    .leftJoin(ramDetails, eq(ramDetails.componentId, components.id))
    .leftJoin(powerSupplyDetails, eq(powerSupplyDetails.componentId, components.id))
    .leftJoin(caseDetails, eq(caseDetails.componentId, components.id))
    .leftJoin(storageDetails, eq(storageDetails.componentId, components.id))
    .leftJoin(soundCardDetails, eq(soundCardDetails.componentId, components.id))
    .where(where)
    .limit(1);

  if (!row) {
    return null;
  }

  const imageRows = await db
    .select({
      componentId: componentImages.componentId,
      url: componentImages.url,
      altText: componentImages.altText,
      sortOrder: componentImages.sortOrder,
    })
    .from(componentImages)
    .where(eq(componentImages.componentId, row.id))
    .orderBy(asc(componentImages.sortOrder));

  return {
    id: row.id,
    category: fromDbComponentType(row.type) as ApiCategory,
    ownerUserId: row.ownerUserId,
    name: row.name,
    manufacturer: row.manufacturer ?? null,
    model: row.model ?? null,
    description: row.description ?? null,
    visibility: row.visibility,
    approvalStatus: row.approvalStatus,
    specs: mapSpecs(row),
    images: imageRows.map((image) => ({
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
  } satisfies PartRecord;
};

export const getPartsByIds = async (ids: number[], userId?: number) => {
  if (!ids.length) {
    return [] as PartRecord[];
  }

  const where = and(
    inArray(components.id, ids),
    buildVisibilityFilter(userId),
    isNull(components.deletedAt)
  );

  const rows = await db
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
      motherboardFormFactor: motherboardDetails.formFactor,
      ramType: motherboardDetails.ramType,
      ramSlots: motherboardDetails.ramSlots,
      pciSlots: motherboardDetails.pciSlots,
      gpuSlotType: motherboardDetails.gpuSlotType,
      soundSlotType: motherboardDetails.soundSlotType,
      cpuSocketValue: cpuDetails.socket,
      cpuTdp: cpuDetails.tdp,
      cpuCores: cpuDetails.cores,
      cpuThreads: cpuDetails.threads,
      videoSlotType: videoCardDetails.slotType,
      videoTdp: videoCardDetails.tdp,
      videoLength: videoCardDetails.lengthMm,
      vramGb: videoCardDetails.vramGb,
      ramTypeValue: ramDetails.type,
      ramCapacityGb: ramDetails.capacityGb,
      ramSpeedMhz: ramDetails.speedMhz,
      ramSlotsValue: ramDetails.slots,
      psuType: powerSupplyDetails.psuType,
      psuFormFactor: powerSupplyDetails.formFactor,
      psuModular: powerSupplyDetails.modular,
      psuWattage: powerSupplyDetails.wattage,
      caseFormFactor: caseDetails.formFactor,
      caseFormFactors: caseDetails.formFactors,
      casePsuFormFactor: caseDetails.psuFormFactor,
      caseMaxGpuLength: caseDetails.maxGpuLength,
      storageInterface: storageDetails.interface,
      storageCapacityGb: storageDetails.capacityGb,
      storageType: storageDetails.type,
      soundSlotTypeValue: soundCardDetails.slotType,
    })
    .from(components)
    .leftJoin(motherboardDetails, eq(motherboardDetails.componentId, components.id))
    .leftJoin(cpuDetails, eq(cpuDetails.componentId, components.id))
    .leftJoin(videoCardDetails, eq(videoCardDetails.componentId, components.id))
    .leftJoin(ramDetails, eq(ramDetails.componentId, components.id))
    .leftJoin(powerSupplyDetails, eq(powerSupplyDetails.componentId, components.id))
    .leftJoin(caseDetails, eq(caseDetails.componentId, components.id))
    .leftJoin(storageDetails, eq(storageDetails.componentId, components.id))
    .leftJoin(soundCardDetails, eq(soundCardDetails.componentId, components.id))
    .where(where)
    .orderBy(asc(components.id));

  const imageRows = await db
    .select({
      componentId: componentImages.componentId,
      url: componentImages.url,
      altText: componentImages.altText,
      sortOrder: componentImages.sortOrder,
    })
    .from(componentImages)
    .where(inArray(componentImages.componentId, ids))
    .orderBy(asc(componentImages.sortOrder));

  const imagesByComponent = mapImageList(imageRows);

  return rows.map((row) => ({
    id: row.id,
    category: fromDbComponentType(row.type) as ApiCategory,
    ownerUserId: row.ownerUserId,
    name: row.name,
    manufacturer: row.manufacturer ?? null,
    model: row.model ?? null,
    description: row.description ?? null,
    visibility: row.visibility,
    approvalStatus: row.approvalStatus,
    specs: mapSpecs(row),
    images: imagesByComponent.get(row.id) ?? [],
  })) satisfies PartRecord[];
};

export const createPart = async (data: {
  userId: number;
  userRole: "admin" | "moderator" | "user";
  category: ApiCategory;
  name: string;
  manufacturer?: string;
  model?: string;
  description?: string;
  visibility: "private" | "public";
  specs: Record<string, unknown>;
  imageUrl?: string | null;
}) => {
  const dbType = toDbComponentType(data.category);
  const approvalStatus =
    data.visibility === "public" && data.userRole === "user"
      ? "pending"
      : "approved";

  const [component] = await db
    .insert(components)
    .values({
      ownerUserId: data.userId,
      type: dbType,
      name: data.name,
      manufacturer: data.manufacturer,
      model: data.model,
      description: data.description,
      visibility: data.visibility,
      approvalStatus,
      approvedAt: approvalStatus === "approved" ? new Date() : null,
    })
    .returning({ id: components.id });

  await insertPartDetails(component.id, data.category, data.specs);

  if (data.imageUrl) {
    await db.insert(componentImages).values({
      componentId: component.id,
      url: data.imageUrl,
      sortOrder: 0,
    });
  }

  return component.id;
};

const insertPartDetails = async (
  componentId: number,
  category: ApiCategory,
  specs: Record<string, unknown>
) => {
  switch (category) {
    case "motherboard":
      await db.insert(motherboardDetails).values({
        componentId,
        cpuSocket: String(specs.socket),
        formFactor: String(specs.formFactor),
        ramType: String(specs.ramType),
        ramSlots: Number(specs.ramSlots),
        pciSlots: Array.isArray(specs.pciSlots)
          ? (specs.pciSlots as string[])
          : [],
        gpuSlotType: Array.isArray(specs.pciSlots)
          ? String((specs.pciSlots as string[])[0] ?? "")
          : "",
        soundSlotType: Array.isArray(specs.pciSlots)
          ? String((specs.pciSlots as string[])[1] ?? "")
          : "",
      });
      return;
    case "cpu":
      await db.insert(cpuDetails).values({
        componentId,
        socket: String(specs.socket),
        tdp: Number(specs.tdp),
        cores: Number(specs.cores),
        threads: Number(specs.threads),
      });
      return;
    case "gpu":
      await db.insert(videoCardDetails).values({
        componentId,
        slotType: String(specs.pciSlot),
        tdp: Number(specs.tdp),
        lengthMm: specs.length ? Number(specs.length) : null,
        vramGb: Number(specs.vram),
      });
      return;
    case "ram":
      await db.insert(ramDetails).values({
        componentId,
        type: String(specs.type),
        capacityGb: Number(specs.capacity),
        speedMhz: Number(specs.speed),
        slots: Number(specs.slots),
      });
      return;
    case "psu":
      const psuFormFactor = String(specs.formFactor).toLowerCase();
      await db.insert(powerSupplyDetails).values({
        componentId,
        psuType: psuFormFactor as "atx" | "sfx" | "tfx" | "flex_atx",
        formFactor: psuFormFactor,
        modular: Boolean(specs.modular),
        wattage: Number(specs.wattage),
      });
      return;
    case "case":
      const caseFormFactors = Array.isArray(specs.formFactor)
        ? (specs.formFactor as string[]).map((value) => value.toLowerCase())
        : [];
      const casePsuFormFactor = String(specs.psuFormFactor).toLowerCase();
      await db.insert(caseDetails).values({
        componentId,
        formFactor: caseFormFactors[0] ?? null,
        formFactors: caseFormFactors,
        psuFormFactor: casePsuFormFactor,
        maxGpuLength: Number(specs.maxGpuLength),
      });
      return;
    case "storage":
      await db.insert(storageDetails).values({
        componentId,
        interface: String(specs.interface),
        capacityGb: Number(specs.capacity),
        type: String(specs.type),
      });
      return;
    case "soundcard":
      await db.insert(soundCardDetails).values({
        componentId,
        slotType: String(specs.pciSlot),
      });
      return;
    default:
      throw new ApiError("Unknown category", 400);
  }
};

export const updatePart = async (data: {
  partId: number;
  userId: number;
  userRole: "admin" | "moderator" | "user";
  category: ApiCategory;
  name: string;
  manufacturer?: string;
  model?: string;
  description?: string;
  visibility: "private" | "public";
  specs: Record<string, unknown>;
}) => {
  const [existing] = await db
    .select({ id: components.id, ownerUserId: components.ownerUserId })
    .from(components)
    .where(and(eq(components.id, data.partId), isNull(components.deletedAt)))
    .limit(1);

  if (!existing || existing.ownerUserId !== data.userId) {
    throw new ApiError("Part not found", 404);
  }

  const approvalStatus =
    data.visibility === "public" && data.userRole === "user"
      ? "pending"
      : "approved";

  await db
    .update(components)
    .set({
      name: data.name,
      manufacturer: data.manufacturer,
      model: data.model,
      description: data.description,
      visibility: data.visibility,
      approvalStatus,
      approvedAt: approvalStatus === "approved" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(components.id, data.partId));

  await replacePartDetails(data.partId, data.category, data.specs);

  return data.partId;
};

const replacePartDetails = async (
  componentId: number,
  category: ApiCategory,
  specs: Record<string, unknown>
) => {
  switch (category) {
    case "motherboard":
      await db
        .insert(motherboardDetails)
        .values({
          componentId,
          cpuSocket: String(specs.socket),
          formFactor: String(specs.formFactor),
          ramType: String(specs.ramType),
          ramSlots: Number(specs.ramSlots),
          pciSlots: Array.isArray(specs.pciSlots)
            ? (specs.pciSlots as string[])
            : [],
          gpuSlotType: Array.isArray(specs.pciSlots)
            ? String((specs.pciSlots as string[])[0] ?? "")
            : "",
          soundSlotType: Array.isArray(specs.pciSlots)
            ? String((specs.pciSlots as string[])[1] ?? "")
            : "",
        })
        .onConflictDoUpdate({
          target: motherboardDetails.componentId,
          set: {
            cpuSocket: String(specs.socket),
            formFactor: String(specs.formFactor),
            ramType: String(specs.ramType),
            ramSlots: Number(specs.ramSlots),
            pciSlots: Array.isArray(specs.pciSlots)
              ? (specs.pciSlots as string[])
              : [],
            gpuSlotType: Array.isArray(specs.pciSlots)
              ? String((specs.pciSlots as string[])[0] ?? "")
              : "",
            soundSlotType: Array.isArray(specs.pciSlots)
              ? String((specs.pciSlots as string[])[1] ?? "")
              : "",
          },
        });
      return;
    case "cpu":
      await db
        .insert(cpuDetails)
        .values({
          componentId,
          socket: String(specs.socket),
          tdp: Number(specs.tdp),
          cores: Number(specs.cores),
          threads: Number(specs.threads),
        })
        .onConflictDoUpdate({
          target: cpuDetails.componentId,
          set: {
            socket: String(specs.socket),
            tdp: Number(specs.tdp),
            cores: Number(specs.cores),
            threads: Number(specs.threads),
          },
        });
      return;
    case "gpu":
      await db
        .insert(videoCardDetails)
        .values({
          componentId,
          slotType: String(specs.pciSlot),
          tdp: Number(specs.tdp),
          lengthMm: specs.length ? Number(specs.length) : null,
          vramGb: Number(specs.vram),
        })
        .onConflictDoUpdate({
          target: videoCardDetails.componentId,
          set: {
            slotType: String(specs.pciSlot),
            tdp: Number(specs.tdp),
            lengthMm: specs.length ? Number(specs.length) : null,
            vramGb: Number(specs.vram),
          },
        });
      return;
    case "ram":
      await db
        .insert(ramDetails)
        .values({
          componentId,
          type: String(specs.type),
          capacityGb: Number(specs.capacity),
          speedMhz: Number(specs.speed),
          slots: Number(specs.slots),
        })
        .onConflictDoUpdate({
          target: ramDetails.componentId,
          set: {
            type: String(specs.type),
            capacityGb: Number(specs.capacity),
            speedMhz: Number(specs.speed),
            slots: Number(specs.slots),
          },
        });
      return;
    case "psu":
      const psuFormFactor = String(specs.formFactor).toLowerCase();
      await db
        .insert(powerSupplyDetails)
        .values({
          componentId,
          psuType: psuFormFactor as "atx" | "sfx" | "tfx" | "flex_atx",
          formFactor: psuFormFactor,
          modular: Boolean(specs.modular),
          wattage: Number(specs.wattage),
        })
        .onConflictDoUpdate({
          target: powerSupplyDetails.componentId,
          set: {
            psuType: psuFormFactor as "atx" | "sfx" | "tfx" | "flex_atx",
            formFactor: psuFormFactor,
            modular: Boolean(specs.modular),
            wattage: Number(specs.wattage),
          },
        });
      return;
    case "case":
      const caseFormFactors = Array.isArray(specs.formFactor)
        ? (specs.formFactor as string[]).map((value) => value.toLowerCase())
        : [];
      const casePsuFormFactor = String(specs.psuFormFactor).toLowerCase();
      await db
        .insert(caseDetails)
        .values({
          componentId,
          formFactor: caseFormFactors[0] ?? null,
          formFactors: caseFormFactors,
          psuFormFactor: casePsuFormFactor,
          maxGpuLength: Number(specs.maxGpuLength),
        })
        .onConflictDoUpdate({
          target: caseDetails.componentId,
          set: {
            formFactor: caseFormFactors[0] ?? null,
            formFactors: caseFormFactors,
            psuFormFactor: casePsuFormFactor,
            maxGpuLength: Number(specs.maxGpuLength),
          },
        });
      return;
    case "storage":
      await db
        .insert(storageDetails)
        .values({
          componentId,
          interface: String(specs.interface),
          capacityGb: Number(specs.capacity),
          type: String(specs.type),
        })
        .onConflictDoUpdate({
          target: storageDetails.componentId,
          set: {
            interface: String(specs.interface),
            capacityGb: Number(specs.capacity),
            type: String(specs.type),
          },
        });
      return;
    case "soundcard":
      await db
        .insert(soundCardDetails)
        .values({
          componentId,
          slotType: String(specs.pciSlot),
        })
        .onConflictDoUpdate({
          target: soundCardDetails.componentId,
          set: {
            slotType: String(specs.pciSlot),
          },
        });
      return;
    default:
      throw new ApiError("Unknown category", 400);
  }
};

export const deletePart = async (data: { partId: number; userId: number }) => {
  const [existing] = await db
    .select({ id: components.id, ownerUserId: components.ownerUserId })
    .from(components)
    .where(and(eq(components.id, data.partId), isNull(components.deletedAt)))
    .limit(1);

  if (!existing || existing.ownerUserId !== data.userId) {
    throw new ApiError("Part not found", 404);
  }

  await db
    .update(components)
    .set({ deletedAt: new Date() })
    .where(eq(components.id, data.partId));
};
