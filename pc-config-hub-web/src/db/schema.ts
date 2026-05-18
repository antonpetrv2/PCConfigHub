import {
  AnyPgColumn,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["admin", "moderator", "user"]);
export const approvalStatus = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);
export const visibility = pgEnum("visibility", ["private", "public"]);
export const componentType = pgEnum("component_type", [
  "motherboard",
  "video_card",
  "sound_card",
  "case",
  "power_supply",
]);
export const importBatchStatus = pgEnum("import_batch_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
export const importRowStatus = pgEnum("import_row_status", [
  "pending",
  "processed",
  "failed",
  "skipped",
]);
export const psuType = pgEnum("psu_type", ["atx", "sfx", "tfx", "flex_atx"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 120 }),
    role: userRole("role").notNull().default("user"),
    approvalStatus: approvalStatus("approval_status")
      .notNull()
      .default("pending"),
    approvedByUserId: integer("approved_by_user_id").references(
      (): AnyPgColumn => users.id,
      {
        onDelete: "set null",
      }
    ),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    requestedRole: userRole("requested_role"),
    roleRequestStatus: approvalStatus("role_request_status"),
    roleReviewedByUserId: integer("role_reviewed_by_user_id").references(
      (): AnyPgColumn => users.id,
      { onDelete: "set null" }
    ),
    roleReviewedAt: timestamp("role_reviewed_at", { withTimezone: true }),
    roleRejectionReason: text("role_rejection_reason"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => {
    return {
      usersEmailKey: uniqueIndex("users_email_key").on(table.email),
      usersRoleIdx: index("users_role_idx").on(table.role),
      usersApprovalIdx: index("users_approval_status_idx").on(
        table.approvalStatus
      ),
    };
  }
);

export const importBatches = pgTable(
  "import_batches",
  {
    id: serial("id").primaryKey(),
    uploadedByUserId: integer("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    fileName: text("file_name").notNull(),
    status: importBatchStatus("status").notNull().default("pending"),
    totalRows: integer("total_rows"),
    processedRows: integer("processed_rows"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => {
    return {
      importBatchesStatusIdx: index("import_batches_status_idx").on(table.status),
      importBatchesUserIdx: index("import_batches_user_idx").on(
        table.uploadedByUserId
      ),
    };
  }
);

export const components = pgTable(
  "components",
  {
    id: serial("id").primaryKey(),
    ownerUserId: integer("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: componentType("type").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    manufacturer: varchar("manufacturer", { length: 120 }),
    model: varchar("model", { length: 120 }),
    description: text("description"),
    visibility: visibility("visibility").notNull().default("private"),
    approvalStatus: approvalStatus("approval_status")
      .notNull()
      .default("approved"),
    approvedByUserId: integer("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    importBatchId: integer("import_batch_id").references(
      () => importBatches.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => {
    return {
      componentsTypeIdx: index("components_type_idx").on(table.type),
      componentsVisibilityIdx: index("components_visibility_idx").on(
        table.visibility
      ),
      componentsApprovalIdx: index("components_approval_status_idx").on(
        table.approvalStatus
      ),
      componentsOwnerIdx: index("components_owner_idx").on(table.ownerUserId),
    };
  }
);

export const motherboardDetails = pgTable("motherboard_details", {
  componentId: integer("component_id")
    .primaryKey()
    .references(() => components.id, { onDelete: "cascade" }),
  cpuSocket: varchar("cpu_socket", { length: 64 }).notNull(),
  ramType: varchar("ram_type", { length: 64 }).notNull(),
  ramSlots: integer("ram_slots"),
  gpuSlotType: varchar("gpu_slot_type", { length: 64 }).notNull(),
  soundSlotType: varchar("sound_slot_type", { length: 64 }).notNull(),
});

export const videoCardDetails = pgTable("video_card_details", {
  componentId: integer("component_id")
    .primaryKey()
    .references(() => components.id, { onDelete: "cascade" }),
  slotType: varchar("slot_type", { length: 64 }).notNull(),
  vramGb: integer("vram_gb"),
});

export const soundCardDetails = pgTable("sound_card_details", {
  componentId: integer("component_id")
    .primaryKey()
    .references(() => components.id, { onDelete: "cascade" }),
  slotType: varchar("slot_type", { length: 64 }).notNull(),
});

export const caseDetails = pgTable("case_details", {
  componentId: integer("component_id")
    .primaryKey()
    .references(() => components.id, { onDelete: "cascade" }),
  formFactor: varchar("form_factor", { length: 64 }),
});

export const caseSupportedPsuTypes = pgTable(
  "case_supported_psu_types",
  {
    id: serial("id").primaryKey(),
    caseComponentId: integer("case_component_id")
      .notNull()
      .references(() => caseDetails.componentId, { onDelete: "cascade" }),
    psuType: psuType("psu_type").notNull(),
  },
  (table) => {
    return {
      casePsuUnique: uniqueIndex("case_supported_psu_types_unique").on(
        table.caseComponentId,
        table.psuType
      ),
    };
  }
);

export const powerSupplyDetails = pgTable("power_supply_details", {
  componentId: integer("component_id")
    .primaryKey()
    .references(() => components.id, { onDelete: "cascade" }),
  psuType: psuType("psu_type").notNull(),
  wattage: integer("wattage"),
});

export const componentImages = pgTable(
  "component_images",
  {
    id: serial("id").primaryKey(),
    componentId: integer("component_id")
      .notNull()
      .references(() => components.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altText: varchar("alt_text", { length: 200 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      componentImagesComponentIdx: index("component_images_component_idx").on(
        table.componentId
      ),
      componentImagesOrderUnique: uniqueIndex(
        "component_images_component_order_unique"
      ).on(table.componentId, table.sortOrder),
    };
  }
);

export const importRows = pgTable(
  "import_rows",
  {
    id: serial("id").primaryKey(),
    importBatchId: integer("import_batch_id")
      .notNull()
      .references(() => importBatches.id, { onDelete: "cascade" }),
    rowNumber: integer("row_number").notNull(),
    rawData: jsonb("raw_data").notNull(),
    status: importRowStatus("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    componentType: componentType("component_type"),
    componentId: integer("component_id").references(() => components.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      importRowsBatchIdx: index("import_rows_batch_idx").on(table.importBatchId),
      importRowsStatusIdx: index("import_rows_status_idx").on(table.status),
      importRowsUnique: uniqueIndex("import_rows_batch_row_unique").on(
        table.importBatchId,
        table.rowNumber
      ),
    };
  }
);

export const pcConfigurations = pgTable(
  "pc_configurations",
  {
    id: serial("id").primaryKey(),
    ownerUserId: integer("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    visibility: visibility("visibility").notNull().default("private"),
    approvalStatus: approvalStatus("approval_status")
      .notNull()
      .default("approved"),
    approvedByUserId: integer("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => {
    return {
      pcConfigsOwnerIdx: index("pc_configurations_owner_idx").on(
        table.ownerUserId
      ),
      pcConfigsVisibilityIdx: index("pc_configurations_visibility_idx").on(
        table.visibility
      ),
      pcConfigsApprovalIdx: index("pc_configurations_approval_status_idx").on(
        table.approvalStatus
      ),
    };
  }
);

export const pcConfigurationComponents = pgTable(
  "pc_configuration_components",
  {
    id: serial("id").primaryKey(),
    pcConfigurationId: integer("pc_configuration_id")
      .notNull()
      .references(() => pcConfigurations.id, { onDelete: "cascade" }),
    componentId: integer("component_id")
      .notNull()
      .references(() => components.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(1),
    slotLabel: varchar("slot_label", { length: 80 }),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      pcConfigComponentsConfigIdx: index(
        "pc_configuration_components_config_idx"
      ).on(table.pcConfigurationId),
      pcConfigComponentsComponentIdx: index(
        "pc_configuration_components_component_idx"
      ).on(table.componentId),
      pcConfigComponentsUnique: uniqueIndex(
        "pc_configuration_components_unique"
      ).on(table.pcConfigurationId, table.componentId),
    };
  }
);

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    authorUserId: integer("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    componentId: integer("component_id").references(() => components.id, {
      onDelete: "cascade",
    }),
    configurationId: integer("configuration_id").references(
      () => pcConfigurations.id,
      { onDelete: "cascade" }
    ),
    body: text("body").notNull(),
    approvalStatus: approvalStatus("approval_status")
      .notNull()
      .default("pending"),
    approvedByUserId: integer("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => {
    return {
      commentsTargetCheck: check(
        "comments_target_check",
        sql`(component_id is not null)::int + (configuration_id is not null)::int = 1`
      ),
      commentsComponentIdx: index("comments_component_idx").on(table.componentId),
      commentsConfigurationIdx: index("comments_configuration_idx").on(
        table.configurationId
      ),
      commentsApprovalIdx: index("comments_approval_status_idx").on(
        table.approvalStatus
      ),
    };
  }
);
