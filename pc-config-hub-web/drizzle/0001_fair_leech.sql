ALTER TYPE "public"."component_type" ADD VALUE 'cpu' BEFORE 'video_card';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'ram' BEFORE 'video_card';--> statement-breakpoint
ALTER TYPE "public"."component_type" ADD VALUE 'storage' BEFORE 'video_card';--> statement-breakpoint
CREATE TABLE "cpu_details" (
	"component_id" integer PRIMARY KEY NOT NULL,
	"socket" varchar(64) NOT NULL,
	"tdp" integer NOT NULL,
	"cores" integer NOT NULL,
	"threads" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ram_details" (
	"component_id" integer PRIMARY KEY NOT NULL,
	"type" varchar(64) NOT NULL,
	"capacity_gb" integer NOT NULL,
	"speed_mhz" integer NOT NULL,
	"slots" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_details" (
	"component_id" integer PRIMARY KEY NOT NULL,
	"interface" varchar(64) NOT NULL,
	"capacity_gb" integer NOT NULL,
	"type" varchar(32) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_details" ADD COLUMN "form_factors" text[];--> statement-breakpoint
ALTER TABLE "case_details" ADD COLUMN "psu_form_factor" varchar(64);--> statement-breakpoint
ALTER TABLE "case_details" ADD COLUMN "max_gpu_length" integer;--> statement-breakpoint
ALTER TABLE "motherboard_details" ADD COLUMN "form_factor" varchar(64);--> statement-breakpoint
UPDATE "motherboard_details" SET "form_factor" = 'ATX' WHERE "form_factor" IS NULL;--> statement-breakpoint
ALTER TABLE "motherboard_details" ALTER COLUMN "form_factor" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "motherboard_details" ADD COLUMN "pci_slots" text[];--> statement-breakpoint
ALTER TABLE "power_supply_details" ADD COLUMN "form_factor" varchar(64);--> statement-breakpoint
ALTER TABLE "power_supply_details" ADD COLUMN "modular" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "video_card_details" ADD COLUMN "tdp" integer;--> statement-breakpoint
ALTER TABLE "video_card_details" ADD COLUMN "length_mm" integer;--> statement-breakpoint
ALTER TABLE "cpu_details" ADD CONSTRAINT "cpu_details_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ram_details" ADD CONSTRAINT "ram_details_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_details" ADD CONSTRAINT "storage_details_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;
