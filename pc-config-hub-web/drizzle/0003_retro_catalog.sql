ALTER TABLE "components" ADD COLUMN "category_slug" varchar(80);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "year_era" varchar(120);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "country_of_origin" varchar(120);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "serial_number" varchar(160);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "inventory_number" varchar(160);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "condition" varchar(40) DEFAULT 'untested' NOT NULL;
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "notes" text;
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "tags" text[];
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "location" varchar(200);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "acquisition_date" varchar(40);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "source" varchar(200);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "purchase_price" varchar(80);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "estimated_value" varchar(80);
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "related_configuration_id" integer;
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "specs" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
UPDATE "components"
SET "category_slug" = CASE "type"
  WHEN 'video_card' THEN 'video_card'
  WHEN 'sound_card' THEN 'sound_card'
  WHEN 'power_supply' THEN 'psu'
  ELSE "type"::text
END
WHERE "category_slug" IS NULL;
--> statement-breakpoint
UPDATE "components" c
SET "specs" = jsonb_strip_nulls(jsonb_build_object(
  'cpuType', m."cpu_socket",
  'formFactor', m."form_factor",
  'ramTypes', case when m."ram_type" is null then null else array[m."ram_type"] end,
  'busSlots', m."pci_slots",
  'powerConnectors', null
))
FROM "motherboard_details" m
WHERE m."component_id" = c."id";
--> statement-breakpoint
UPDATE "components" c
SET "specs" = jsonb_strip_nulls(jsonb_build_object(
  'socket', cd."socket",
  'clockSpeed', null,
  'cache', null,
  'architecture', null,
  'testedStatus', 'Untested',
  'tdp', cd."tdp",
  'cores', cd."cores",
  'threads', cd."threads"
))
FROM "cpu_details" cd
WHERE cd."component_id" = c."id";
--> statement-breakpoint
UPDATE "components" c
SET "specs" = jsonb_strip_nulls(jsonb_build_object(
  'busType', v."slot_type",
  'videoMemory', v."vram_gb",
  'tdp', v."tdp",
  'length', v."length_mm"
))
FROM "video_card_details" v
WHERE v."component_id" = c."id";
--> statement-breakpoint
UPDATE "components" c
SET "specs" = jsonb_strip_nulls(jsonb_build_object(
  'ramType', r."type",
  'capacity', r."capacity_gb",
  'speed', r."speed_mhz",
  'slots', r."slots"
))
FROM "ram_details" r
WHERE r."component_id" = c."id";
--> statement-breakpoint
UPDATE "components" c
SET "specs" = jsonb_strip_nulls(jsonb_build_object(
  'psuType', p."form_factor",
  'wattage', p."wattage",
  'modular', p."modular"
))
FROM "power_supply_details" p
WHERE p."component_id" = c."id";
--> statement-breakpoint
UPDATE "components" c
SET "specs" = jsonb_strip_nulls(jsonb_build_object(
  'supportedFormFactor', coalesce(array_to_string(ca."form_factors", ', '), ca."form_factor"),
  'psuType', ca."psu_form_factor",
  'maxGpuLength', ca."max_gpu_length"
))
FROM "case_details" ca
WHERE ca."component_id" = c."id";
--> statement-breakpoint
UPDATE "components" c
SET "specs" = jsonb_strip_nulls(jsonb_build_object(
  'interface', s."interface",
  'capacity', s."capacity_gb",
  'type', s."type"
))
FROM "storage_details" s
WHERE s."component_id" = c."id";
--> statement-breakpoint
UPDATE "components" c
SET "specs" = jsonb_strip_nulls(jsonb_build_object(
  'busType', sc."slot_type"
))
FROM "sound_card_details" sc
WHERE sc."component_id" = c."id";
--> statement-breakpoint
ALTER TABLE "components" ALTER COLUMN "category_slug" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_related_configuration_id_pc_configurations_id_fk" FOREIGN KEY ("related_configuration_id") REFERENCES "public"."pc_configurations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "components_category_slug_idx" ON "components" USING btree ("category_slug");
--> statement-breakpoint
CREATE INDEX "components_condition_idx" ON "components" USING btree ("condition");
--> statement-breakpoint
CREATE TABLE "component_test_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" integer NOT NULL,
	"tested_at" varchar(40),
	"test_type" varchar(160),
	"result" varchar(160),
	"software_used" text,
	"notes" text,
	"photos" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component_restoration_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" integer NOT NULL,
	"restored_at" varchar(40),
	"work_performed" text,
	"parts_replaced" text,
	"problems_found" text,
	"photos_before" text[],
	"photos_after" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configuration_test_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"configuration_id" integer NOT NULL,
	"tested_at" varchar(40),
	"test_type" varchar(160),
	"result" varchar(160),
	"software_used" text,
	"notes" text,
	"photos" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configuration_restoration_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"configuration_id" integer NOT NULL,
	"restored_at" varchar(40),
	"work_performed" text,
	"parts_replaced" text,
	"problems_found" text,
	"photos_before" text[],
	"photos_after" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "component_test_logs" ADD CONSTRAINT "component_test_logs_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "component_restoration_logs" ADD CONSTRAINT "component_restoration_logs_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "configuration_test_logs" ADD CONSTRAINT "configuration_test_logs_configuration_id_pc_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."pc_configurations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "configuration_restoration_logs" ADD CONSTRAINT "configuration_restoration_logs_configuration_id_pc_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."pc_configurations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "component_test_logs_component_idx" ON "component_test_logs" USING btree ("component_id");
--> statement-breakpoint
CREATE INDEX "component_restoration_logs_component_idx" ON "component_restoration_logs" USING btree ("component_id");
--> statement-breakpoint
CREATE INDEX "configuration_test_logs_configuration_idx" ON "configuration_test_logs" USING btree ("configuration_id");
--> statement-breakpoint
CREATE INDEX "configuration_restoration_logs_configuration_idx" ON "configuration_restoration_logs" USING btree ("configuration_id");
