import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('farmer', 'technician');
  CREATE TYPE "public"."enum_traps_current_risk_level" AS ENUM('safe', 'warning', 'danger');
  CREATE TYPE "public"."enum_pest_types_crop" AS ENUM('apple', 'pecan', 'grape', 'berry');
  CREATE TYPE "public"."enum_coop_memberships_status" AS ENUM('pending', 'active');
  CREATE TYPE "public"."enum_coop_memberships_member_role" AS ENUM('member', 'admin');
  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'farmer' NOT NULL,
  	"is_super_admin" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "farms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"pest_type_id" integer NOT NULL,
  	"coop_id" integer,
  	"location" varchar,
  	"lat" numeric,
  	"lng" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "traps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"farm_id" integer NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"current_risk_level" "enum_traps_current_risk_level" DEFAULT 'safe',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pest_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"crop" "enum_pest_types_crop" DEFAULT 'apple' NOT NULL,
  	"rate_threshold" numeric DEFAULT 2 NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pest_observations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"date" timestamp(3) with time zone NOT NULL,
  	"count" numeric NOT NULL,
  	"is_baseline" boolean DEFAULT false,
  	"trap_id" integer NOT NULL,
  	"notes" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coops" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"region" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coop_memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"coop_id" integer NOT NULL,
  	"status" "enum_coop_memberships_status" DEFAULT 'pending' NOT NULL,
  	"member_role" "enum_coop_memberships_member_role" DEFAULT 'member' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"farms_id" integer,
  	"traps_id" integer,
  	"pest_types_id" integer,
  	"pest_observations_id" integer,
  	"coops_id" integer,
  	"coop_memberships_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_farms_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."farms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "farms" ADD CONSTRAINT "farms_pest_type_id_pest_types_id_fk" FOREIGN KEY ("pest_type_id") REFERENCES "public"."pest_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "farms" ADD CONSTRAINT "farms_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "traps" ADD CONSTRAINT "traps_tenant_id_farms_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."farms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "traps" ADD CONSTRAINT "traps_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pest_observations" ADD CONSTRAINT "pest_observations_tenant_id_farms_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."farms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pest_observations" ADD CONSTRAINT "pest_observations_trap_id_traps_id_fk" FOREIGN KEY ("trap_id") REFERENCES "public"."traps"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pest_observations" ADD CONSTRAINT "pest_observations_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coop_memberships" ADD CONSTRAINT "coop_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coop_memberships" ADD CONSTRAINT "coop_memberships_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_farms_fk" FOREIGN KEY ("farms_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_traps_fk" FOREIGN KEY ("traps_id") REFERENCES "public"."traps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pest_types_fk" FOREIGN KEY ("pest_types_id") REFERENCES "public"."pest_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pest_observations_fk" FOREIGN KEY ("pest_observations_id") REFERENCES "public"."pest_observations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coops_fk" FOREIGN KEY ("coops_id") REFERENCES "public"."coops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coop_memberships_fk" FOREIGN KEY ("coop_memberships_id") REFERENCES "public"."coop_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "farms_pest_type_idx" ON "farms" USING btree ("pest_type_id");
  CREATE INDEX "farms_coop_idx" ON "farms" USING btree ("coop_id");
  CREATE INDEX "farms_updated_at_idx" ON "farms" USING btree ("updated_at");
  CREATE INDEX "farms_created_at_idx" ON "farms" USING btree ("created_at");
  CREATE INDEX "traps_tenant_idx" ON "traps" USING btree ("tenant_id");
  CREATE INDEX "traps_farm_idx" ON "traps" USING btree ("farm_id");
  CREATE INDEX "traps_updated_at_idx" ON "traps" USING btree ("updated_at");
  CREATE INDEX "traps_created_at_idx" ON "traps" USING btree ("created_at");
  CREATE INDEX "pest_types_updated_at_idx" ON "pest_types" USING btree ("updated_at");
  CREATE INDEX "pest_types_created_at_idx" ON "pest_types" USING btree ("created_at");
  CREATE INDEX "pest_observations_tenant_idx" ON "pest_observations" USING btree ("tenant_id");
  CREATE INDEX "pest_observations_trap_idx" ON "pest_observations" USING btree ("trap_id");
  CREATE INDEX "pest_observations_photo_idx" ON "pest_observations" USING btree ("photo_id");
  CREATE INDEX "pest_observations_updated_at_idx" ON "pest_observations" USING btree ("updated_at");
  CREATE INDEX "pest_observations_created_at_idx" ON "pest_observations" USING btree ("created_at");
  CREATE INDEX "coops_updated_at_idx" ON "coops" USING btree ("updated_at");
  CREATE INDEX "coops_created_at_idx" ON "coops" USING btree ("created_at");
  CREATE INDEX "coop_memberships_user_idx" ON "coop_memberships" USING btree ("user_id");
  CREATE INDEX "coop_memberships_coop_idx" ON "coop_memberships" USING btree ("coop_id");
  CREATE INDEX "coop_memberships_updated_at_idx" ON "coop_memberships" USING btree ("updated_at");
  CREATE INDEX "coop_memberships_created_at_idx" ON "coop_memberships" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_farms_id_idx" ON "payload_locked_documents_rels" USING btree ("farms_id");
  CREATE INDEX "payload_locked_documents_rels_traps_id_idx" ON "payload_locked_documents_rels" USING btree ("traps_id");
  CREATE INDEX "payload_locked_documents_rels_pest_types_id_idx" ON "payload_locked_documents_rels" USING btree ("pest_types_id");
  CREATE INDEX "payload_locked_documents_rels_pest_observations_id_idx" ON "payload_locked_documents_rels" USING btree ("pest_observations_id");
  CREATE INDEX "payload_locked_documents_rels_coops_id_idx" ON "payload_locked_documents_rels" USING btree ("coops_id");
  CREATE INDEX "payload_locked_documents_rels_coop_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("coop_memberships_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "farms" CASCADE;
  DROP TABLE "traps" CASCADE;
  DROP TABLE "pest_types" CASCADE;
  DROP TABLE "pest_observations" CASCADE;
  DROP TABLE "coops" CASCADE;
  DROP TABLE "coop_memberships" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_traps_current_risk_level";
  DROP TYPE "public"."enum_pest_types_crop";
  DROP TYPE "public"."enum_coop_memberships_status";
  DROP TYPE "public"."enum_coop_memberships_member_role";`)
}
