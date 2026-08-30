CREATE TYPE "role" AS ENUM('ADMIN', 'EMPLOYEE', 'CUSTOMER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL UNIQUE,
	"phone" varchar(20),
	"password_hash" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'CUSTOMER'::"role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"banned_at" timestamp,
	"banned_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_banned_by_fk" FOREIGN KEY ("banned_by") REFERENCES "users"("id");