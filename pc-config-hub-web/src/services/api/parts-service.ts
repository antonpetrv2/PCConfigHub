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
  componentImages,
  componentRestorationLogs,
  componentTestLogs,
  components,
} from "@/db/schema";
import { toDbComponentType } from "@/lib/api/category-map";
import { ApiError } from "@/lib/api/errors";
import type { ApiCategory, ItemCondition } from "@/lib/api/types";
import { deleteObjectByUrl } from "@/services/api/upload-service";

export type PartImage = {
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type TestLogEntry = {
  id?: number;
  date?: string | null;
  testType?: string | null;
  result?: string | null;
  softwareUsed?: string | null;
  notes?: string | null;
  photos?: string[];
};

export type RestorationLogEntry = {
  id?: number;
  date?: string | null;
  workPerformed?: string | null;
  partsReplaced?: string | null;
  problemsFound?: string | null;
  photosBefore?: string[];
  photosAfter?: string[];
};

export type PartRecord = {
  id: number;
  category: ApiCategory;
  ownerUserId: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  yearEra: string | null;
  countryOfOrigin: string | null;
  serialNumber: string | null;
  inventoryNumber: string | null;
  condition: ItemCondition;
  description: string | null;
  notes: string | null;
  tags: string[];
  location: string | null;
  acquisitionDate: string | null;
  source: string | null;
  purchasePrice: string | null;
  estimatedValue: string | null;
  relatedConfigurationId: number | null;
  visibility: "private" | "public";
  approvalStatus: "pending" | "approved" | "rejected";
  specs: Record<string, unknown>;
  customFields: Record<string, unknown>;
  images: PartImage[];
  testLogs: TestLogEntry[];
  restorationLogs: RestorationLogEntry[];
};

export type PartFilters = {
  userId?: number;
  category?: ApiCategory;
  search?: string;
  era?: string;
  busType?: string;
  cpuFamily?: string;
  condition?: ItemCondition;
  systemType?: string;
  tag?: string;
  page: number;
  limit: number;
};

type PartInput = {
  userId: number;
  userRole: "admin" | "moderator" | "user";
  category: ApiCategory;
  name: string;
  manufacturer?: string;
  model?: string;
  yearEra?: string;
  countryOfOrigin?: string;
  serialNumber?: string;
  inventoryNumber?: string;
  condition: ItemCondition;
  description?: string;
  notes?: string;
  tags: string[];
  location?: string;
  acquisitionDate?: string;
  source?: string;
  purchasePrice?: string;
  estimatedValue?: string;
  relatedConfigurationId?: number | null;
  visibility: "private" | "public";
  specs: Record<string, unknown>;
  customFields: Record<string, unknown>;
  testLogs: TestLogEntry[];
  restorationLogs: RestorationLogEntry[];
  imageUrl?: string | null;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const asCondition = (value: string): ItemCondition => {
  if (
    value === "working" ||
    value === "partially_working" ||
    value === "untested" ||
    value === "for_repair" ||
    value === "dead"
  ) {
    return value;
  }
  return "untested";
};

const normalizeCategory = (category: string): ApiCategory => {
  if (category === "keyboard" || category === "mouse") {
    return "other";
  }

  if (
    category === "controller_card" ||
    category === "network_card" ||
    category === "io_card"
  ) {
    return "expansion_card";
  }

  if (
    category === "storage" ||
    category === "floppy_drive" ||
    category === "optical_drive"
  ) {
    return "drive";
  }

  return category as ApiCategory;
};

const categoryFilterValues = (category: ApiCategory) => {
  if (category === "other") {
    return ["other", "keyboard", "mouse"];
  }

  if (category === "expansion_card") {
    return ["expansion_card", "controller_card", "network_card", "io_card"];
  }

  if (category === "drive") {
    return ["drive", "storage", "floppy_drive", "optical_drive"];
  }

  return [category];
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

const buildBaseQuery = (filters: Omit<PartFilters, "page" | "limit">) => {
  const conditions = [isNull(components.deletedAt), buildVisibilityFilter(filters.userId)];

  if (filters.category) {
    conditions.push(inArray(components.categorySlug, categoryFilterValues(filters.category)));
  }

  if (filters.condition) {
    conditions.push(eq(components.condition, filters.condition));
  }

  if (filters.era) {
    conditions.push(ilike(components.yearEra, `%${filters.era}%`));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(components.name, term),
        ilike(components.manufacturer, term),
        ilike(components.model, term),
        ilike(components.description, term),
        sql`array_to_string(${components.tags}, ' ') ilike ${term}`
      )
    );
  }

  if (filters.tag) {
    const term = `%${filters.tag}%`;
    conditions.push(sql`array_to_string(${components.tags}, ' ') ilike ${term}`);
  }

  if (filters.busType) {
    conditions.push(sql`${components.specs}->>'busType' ilike ${`%${filters.busType}%`}`);
  }

  if (filters.cpuFamily) {
    conditions.push(
      sql`coalesce(${components.specs}->>'architecture', ${components.specs}->>'cpuType', ${components.specs}->>'cpu') ilike ${`%${filters.cpuFamily}%`}`
    );
  }

  if (filters.systemType) {
    conditions.push(
      sql`coalesce(${components.specs}->>'caseStyle', ${components.specs}->>'formFactor') ilike ${`%${filters.systemType}%`}`
    );
  }

  return and(...conditions);
};

const mapImageList = (
  rows: Array<{
    componentId: number;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>
) => {
  const images = new Map<number, PartImage[]>();
  for (const row of rows) {
    const list = images.get(row.componentId) ?? [];
    list.push({ url: row.url, altText: row.altText, sortOrder: row.sortOrder });
    images.set(row.componentId, list);
  }
  return images;
};

const mapRowsToParts = (
  rows: Array<typeof components.$inferSelect>,
  imagesByComponent: Map<number, PartImage[]>,
  testLogsByComponent = new Map<number, TestLogEntry[]>(),
  restorationLogsByComponent = new Map<number, RestorationLogEntry[]>()
) =>
  rows.map((row) => ({
    id: row.id,
    category: normalizeCategory(row.categorySlug ?? row.type),
    ownerUserId: row.ownerUserId,
    name: row.name,
    manufacturer: row.manufacturer ?? null,
    model: row.model ?? null,
    yearEra: row.yearEra ?? null,
    countryOfOrigin: row.countryOfOrigin ?? null,
    serialNumber: row.serialNumber ?? null,
    inventoryNumber: row.inventoryNumber ?? null,
    condition: asCondition(row.condition),
    description: row.description ?? null,
    notes: row.notes ?? null,
    tags: row.tags ?? [],
    location: row.location ?? null,
    acquisitionDate: row.acquisitionDate ?? null,
    source: row.source ?? null,
    purchasePrice: row.purchasePrice ?? null,
    estimatedValue: row.estimatedValue ?? null,
    relatedConfigurationId: row.relatedConfigurationId ?? null,
    visibility: row.visibility,
    approvalStatus: row.approvalStatus,
    specs: asRecord(row.specs),
    customFields: asRecord(row.customFields),
    images: imagesByComponent.get(row.id) ?? [],
    testLogs: testLogsByComponent.get(row.id) ?? [],
    restorationLogs: restorationLogsByComponent.get(row.id) ?? [],
  })) satisfies PartRecord[];

export const listParts = async (filters: PartFilters) => {
  const where = buildBaseQuery(filters);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(components)
    .where(where);

  const rows = await db
    .select()
    .from(components)
    .where(where)
    .orderBy(desc(components.createdAt), asc(components.id))
    .limit(filters.limit)
    .offset((filters.page - 1) * filters.limit);

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

  return {
    total: Number(total ?? 0),
    parts: mapRowsToParts(rows, mapImageList(imageRows)),
  };
};

const loadPartLogs = async (componentId: number) => {
  const [testRows, restorationRows] = await Promise.all([
    db
      .select()
      .from(componentTestLogs)
      .where(eq(componentTestLogs.componentId, componentId))
      .orderBy(desc(componentTestLogs.createdAt)),
    db
      .select()
      .from(componentRestorationLogs)
      .where(eq(componentRestorationLogs.componentId, componentId))
      .orderBy(desc(componentRestorationLogs.createdAt)),
  ]);

  return {
    testLogs: testRows.map((row) => ({
      id: row.id,
      date: row.testedAt,
      testType: row.testType,
      result: row.result,
      softwareUsed: row.softwareUsed,
      notes: row.notes,
      photos: row.photos ?? [],
    })),
    restorationLogs: restorationRows.map((row) => ({
      id: row.id,
      date: row.restoredAt,
      workPerformed: row.workPerformed,
      partsReplaced: row.partsReplaced,
      problemsFound: row.problemsFound,
      photosBefore: row.photosBefore ?? [],
      photosAfter: row.photosAfter ?? [],
    })),
  };
};

export const getPartById = async (id: number, userId?: number) => {
  const [row] = await db
    .select()
    .from(components)
    .where(
      and(eq(components.id, id), buildVisibilityFilter(userId), isNull(components.deletedAt))
    )
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

  const logs = await loadPartLogs(row.id);
  return mapRowsToParts(
    [row],
    mapImageList(imageRows),
    new Map([[row.id, logs.testLogs]]),
    new Map([[row.id, logs.restorationLogs]])
  )[0];
};

export const getPartsByIds = async (ids: number[], userId?: number) => {
  if (!ids.length) {
    return [] as PartRecord[];
  }

  const rows = await db
    .select()
    .from(components)
    .where(
      and(
        inArray(components.id, ids),
        buildVisibilityFilter(userId),
        isNull(components.deletedAt)
      )
    )
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

  return mapRowsToParts(rows, mapImageList(imageRows));
};

const insertLogs = async (
  componentId: number,
  testLogs: TestLogEntry[],
  restorationLogs: RestorationLogEntry[]
) => {
  const cleanTestLogs = testLogs.filter(
    (log) => log.date || log.testType || log.result || log.softwareUsed || log.notes
  );
  const cleanRestorationLogs = restorationLogs.filter(
    (log) => log.date || log.workPerformed || log.partsReplaced || log.problemsFound
  );

  if (cleanTestLogs.length) {
    await db.insert(componentTestLogs).values(
      cleanTestLogs.map((log) => ({
        componentId,
        testedAt: log.date ?? null,
        testType: log.testType ?? null,
        result: log.result ?? null,
        softwareUsed: log.softwareUsed ?? null,
        notes: log.notes ?? null,
        photos: log.photos ?? [],
      }))
    );
  }

  if (cleanRestorationLogs.length) {
    await db.insert(componentRestorationLogs).values(
      cleanRestorationLogs.map((log) => ({
        componentId,
        restoredAt: log.date ?? null,
        workPerformed: log.workPerformed ?? null,
        partsReplaced: log.partsReplaced ?? null,
        problemsFound: log.problemsFound ?? null,
        photosBefore: log.photosBefore ?? [],
        photosAfter: log.photosAfter ?? [],
      }))
    );
  }
};

export const createPart = async (data: PartInput) => {
  const approvalStatus =
    data.visibility === "public" && data.userRole === "user"
      ? "pending"
      : "approved";

  const [component] = await db
    .insert(components)
    .values({
      ownerUserId: data.userId,
      type: toDbComponentType(data.category),
      categorySlug: data.category,
      name: data.name,
      manufacturer: data.manufacturer,
      model: data.model,
      yearEra: data.yearEra,
      countryOfOrigin: data.countryOfOrigin,
      serialNumber: data.serialNumber,
      inventoryNumber: data.inventoryNumber,
      condition: data.condition,
      description: data.description,
      notes: data.notes,
      tags: data.tags,
      location: data.location,
      acquisitionDate: data.acquisitionDate,
      source: data.source,
      purchasePrice: data.purchasePrice,
      estimatedValue: data.estimatedValue,
      relatedConfigurationId: data.relatedConfigurationId ?? null,
      visibility: data.visibility,
      approvalStatus,
      approvedAt: approvalStatus === "approved" ? new Date() : null,
      specs: data.specs,
      customFields: data.customFields,
    })
    .returning({ id: components.id });

  if (data.imageUrl) {
    await db.insert(componentImages).values({
      componentId: component.id,
      url: data.imageUrl,
      sortOrder: 0,
    });
  }

  await insertLogs(component.id, data.testLogs, data.restorationLogs);
  return component.id;
};

export const updatePart = async (data: PartInput & { partId: number }) => {
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
      type: toDbComponentType(data.category),
      categorySlug: data.category,
      name: data.name,
      manufacturer: data.manufacturer,
      model: data.model,
      yearEra: data.yearEra,
      countryOfOrigin: data.countryOfOrigin,
      serialNumber: data.serialNumber,
      inventoryNumber: data.inventoryNumber,
      condition: data.condition,
      description: data.description,
      notes: data.notes,
      tags: data.tags,
      location: data.location,
      acquisitionDate: data.acquisitionDate,
      source: data.source,
      purchasePrice: data.purchasePrice,
      estimatedValue: data.estimatedValue,
      relatedConfigurationId: data.relatedConfigurationId ?? null,
      visibility: data.visibility,
      approvalStatus,
      approvedAt: approvalStatus === "approved" ? new Date() : null,
      specs: data.specs,
      customFields: data.customFields,
      updatedAt: new Date(),
    })
    .where(eq(components.id, data.partId));

  if (data.imageUrl !== undefined) {
    await replacePartImage(data.partId, data.imageUrl);
  }

  await db
    .delete(componentTestLogs)
    .where(eq(componentTestLogs.componentId, data.partId));
  await db
    .delete(componentRestorationLogs)
    .where(eq(componentRestorationLogs.componentId, data.partId));
  await insertLogs(data.partId, data.testLogs, data.restorationLogs);

  return data.partId;
};

const replacePartImage = async (partId: number, imageUrl: string | null) => {
  const imageRows = await db
    .select({ url: componentImages.url })
    .from(componentImages)
    .where(eq(componentImages.componentId, partId));

  for (const row of imageRows) {
    await deleteObjectByUrl(row.url);
  }

  await db.delete(componentImages).where(eq(componentImages.componentId, partId));

  if (imageUrl) {
    await db.insert(componentImages).values({
      componentId: partId,
      url: imageUrl,
      sortOrder: 0,
    });
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

  const imageRows = await db
    .select({ url: componentImages.url })
    .from(componentImages)
    .where(eq(componentImages.componentId, data.partId));

  for (const row of imageRows) {
    await deleteObjectByUrl(row.url);
  }

  await db
    .delete(componentImages)
    .where(eq(componentImages.componentId, data.partId));

  await db
    .update(components)
    .set({ deletedAt: new Date() })
    .where(eq(components.id, data.partId));
};
