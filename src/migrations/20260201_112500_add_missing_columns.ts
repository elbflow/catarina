import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create enum for trap risk levels
  await db.execute(sql`
    CREATE TYPE "public"."enum_traps_current_risk_level" AS ENUM('safe', 'warning', 'danger');
  `)

  // Add current_risk_level column to traps table
  await db.execute(sql`
    ALTER TABLE "traps" 
    ADD COLUMN "current_risk_level" "enum_traps_current_risk_level" DEFAULT 'safe';
  `)

  // Add tenant_id column to traps table (for multi-tenant plugin)
  await db.execute(sql`
    ALTER TABLE "traps" 
    ADD COLUMN "tenant_id" integer;
  `)

  // Add tenant_id column to pest_observations table (for multi-tenant plugin)
  await db.execute(sql`
    ALTER TABLE "pest_observations" 
    ADD COLUMN "tenant_id" integer;
  `)

  // Add foreign key constraints for tenant_id columns
  await db.execute(sql`
    ALTER TABLE "traps" 
    ADD CONSTRAINT "traps_tenant_id_farms_id_fk" 
    FOREIGN KEY ("tenant_id") REFERENCES "public"."farms"("id") ON DELETE set null ON UPDATE no action;
  `)

  await db.execute(sql`
    ALTER TABLE "pest_observations" 
    ADD CONSTRAINT "pest_observations_tenant_id_farms_id_fk" 
    FOREIGN KEY ("tenant_id") REFERENCES "public"."farms"("id") ON DELETE set null ON UPDATE no action;
  `)

  // Create indexes for tenant_id columns
  await db.execute(sql`
    CREATE INDEX "traps_tenant_idx" ON "traps" USING btree ("tenant_id");
  `)

  await db.execute(sql`
    CREATE INDEX "pest_observations_tenant_idx" ON "pest_observations" USING btree ("tenant_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove indexes
  await db.execute(sql`DROP INDEX IF EXISTS "pest_observations_tenant_idx";`)
  await db.execute(sql`DROP INDEX IF EXISTS "traps_tenant_idx";`)

  // Remove foreign key constraints
  await db.execute(sql`ALTER TABLE "pest_observations" DROP CONSTRAINT IF EXISTS "pest_observations_tenant_id_farms_id_fk";`)
  await db.execute(sql`ALTER TABLE "traps" DROP CONSTRAINT IF EXISTS "traps_tenant_id_farms_id_fk";`)

  // Remove columns
  await db.execute(sql`ALTER TABLE "pest_observations" DROP COLUMN IF EXISTS "tenant_id";`)
  await db.execute(sql`ALTER TABLE "traps" DROP COLUMN IF EXISTS "tenant_id";`)
  await db.execute(sql`ALTER TABLE "traps" DROP COLUMN IF EXISTS "current_risk_level";`)

  // Drop enum
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_traps_current_risk_level";`)
}
