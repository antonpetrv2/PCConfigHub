CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."component_type" AS ENUM('motherboard', 'video_card', 'sound_card', 'case', 'power_supply');--> statement-breakpoint
CREATE TYPE "public"."import_batch_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."import_row_status" AS ENUM('pending', 'processed', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."psu_type" AS ENUM('atx', 'sfx', 'tfx', 'flex_atx');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'moderator', 'user');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "case_details" (
	"component_id" integer PRIMARY KEY NOT NULL,
	"form_factor" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "case_supported_psu_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_component_id" integer NOT NULL,
	"psu_type" "psu_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_user_id" integer NOT NULL,
	"component_id" integer,
	"configuration_id" integer,
	"body" text NOT NULL,
	"approval_status" "approval_status" DEFAULT 'pending' NOT NULL,
	"approved_by_user_id" integer,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "comments_target_check" CHECK ((component_id is not null)::int + (configuration_id is not null)::int = 1)
);
--> statement-breakpoint
CREATE TABLE "component_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt_text" varchar(200),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "components" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_user_id" integer NOT NULL,
	"type" "component_type" NOT NULL,
	"name" varchar(200) NOT NULL,
	"manufacturer" varchar(120),
	"model" varchar(120),
	"description" text,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"approval_status" "approval_status" DEFAULT 'approved' NOT NULL,
	"approved_by_user_id" integer,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"import_batch_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"uploaded_by_user_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"status" "import_batch_status" DEFAULT 'pending' NOT NULL,
	"total_rows" integer,
	"processed_rows" integer,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "import_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"import_batch_id" integer NOT NULL,
	"row_number" integer NOT NULL,
	"raw_data" jsonb NOT NULL,
	"status" "import_row_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"component_type" "component_type",
	"component_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "motherboard_details" (
	"component_id" integer PRIMARY KEY NOT NULL,
	"cpu_socket" varchar(64) NOT NULL,
	"ram_type" varchar(64) NOT NULL,
	"ram_slots" integer,
	"gpu_slot_type" varchar(64) NOT NULL,
	"sound_slot_type" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_configuration_components" (
	"id" serial PRIMARY KEY NOT NULL,
	"pc_configuration_id" integer NOT NULL,
	"component_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"slot_label" varchar(80),
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_user_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"approval_status" "approval_status" DEFAULT 'approved' NOT NULL,
	"approved_by_user_id" integer,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "power_supply_details" (
	"component_id" integer PRIMARY KEY NOT NULL,
	"psu_type" "psu_type" NOT NULL,
	"wattage" integer
);
--> statement-breakpoint
CREATE TABLE "sound_card_details" (
	"component_id" integer PRIMARY KEY NOT NULL,
	"slot_type" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(120),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"approval_status" "approval_status" DEFAULT 'pending' NOT NULL,
	"approved_by_user_id" integer,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"requested_role" "user_role",
	"role_request_status" "approval_status",
	"role_reviewed_by_user_id" integer,
	"role_reviewed_at" timestamp with time zone,
	"role_rejection_reason" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "video_card_details" (
	"component_id" integer PRIMARY KEY NOT NULL,
	"slot_type" varchar(64) NOT NULL,
	"vram_gb" integer
);
--> statement-breakpoint
ALTER TABLE "case_details" ADD CONSTRAINT "case_details_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_supported_psu_types" ADD CONSTRAINT "case_supported_psu_types_case_component_id_case_details_component_id_fk" FOREIGN KEY ("case_component_id") REFERENCES "public"."case_details"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_configuration_id_pc_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."pc_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_images" ADD CONSTRAINT "component_images_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_import_batch_id_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."import_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_import_batch_id_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."import_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motherboard_details" ADD CONSTRAINT "motherboard_details_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_configuration_components" ADD CONSTRAINT "pc_configuration_components_pc_configuration_id_pc_configurations_id_fk" FOREIGN KEY ("pc_configuration_id") REFERENCES "public"."pc_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_configuration_components" ADD CONSTRAINT "pc_configuration_components_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_configurations" ADD CONSTRAINT "pc_configurations_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_configurations" ADD CONSTRAINT "pc_configurations_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "power_supply_details" ADD CONSTRAINT "power_supply_details_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sound_card_details" ADD CONSTRAINT "sound_card_details_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("role_reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_card_details" ADD CONSTRAINT "video_card_details_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "case_supported_psu_types_unique" ON "case_supported_psu_types" USING btree ("case_component_id","psu_type");--> statement-breakpoint
CREATE INDEX "comments_component_idx" ON "comments" USING btree ("component_id");--> statement-breakpoint
CREATE INDEX "comments_configuration_idx" ON "comments" USING btree ("configuration_id");--> statement-breakpoint
CREATE INDEX "comments_approval_status_idx" ON "comments" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "component_images_component_idx" ON "component_images" USING btree ("component_id");--> statement-breakpoint
CREATE UNIQUE INDEX "component_images_component_order_unique" ON "component_images" USING btree ("component_id","sort_order");--> statement-breakpoint
CREATE INDEX "components_type_idx" ON "components" USING btree ("type");--> statement-breakpoint
CREATE INDEX "components_visibility_idx" ON "components" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "components_approval_status_idx" ON "components" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "components_owner_idx" ON "components" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "import_batches_status_idx" ON "import_batches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "import_batches_user_idx" ON "import_batches" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE INDEX "import_rows_batch_idx" ON "import_rows" USING btree ("import_batch_id");--> statement-breakpoint
CREATE INDEX "import_rows_status_idx" ON "import_rows" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "import_rows_batch_row_unique" ON "import_rows" USING btree ("import_batch_id","row_number");--> statement-breakpoint
CREATE INDEX "pc_configuration_components_config_idx" ON "pc_configuration_components" USING btree ("pc_configuration_id");--> statement-breakpoint
CREATE INDEX "pc_configuration_components_component_idx" ON "pc_configuration_components" USING btree ("component_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pc_configuration_components_unique" ON "pc_configuration_components" USING btree ("pc_configuration_id","component_id");--> statement-breakpoint
CREATE INDEX "pc_configurations_owner_idx" ON "pc_configurations" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "pc_configurations_visibility_idx" ON "pc_configurations" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "pc_configurations_approval_status_idx" ON "pc_configurations" USING btree ("approval_status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_approval_status_idx" ON "users" USING btree ("approval_status");