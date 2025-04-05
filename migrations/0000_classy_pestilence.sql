CREATE TABLE "chicken_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"breed" text NOT NULL,
	"quantity" integer NOT NULL,
	"acquisition_date" timestamp NOT NULL,
	"status" text NOT NULL,
	"notes" text,
	CONSTRAINT "chicken_batches_batch_id_unique" UNIQUE("batch_id")
);
--> statement-breakpoint
CREATE TABLE "financial_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"amount" real NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"tags" text[]
);
--> statement-breakpoint
CREATE TABLE "health_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"batch_id" text NOT NULL,
	"mortality_count" integer DEFAULT 0,
	"symptoms" text[],
	"diagnosis" text,
	"treatment" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"quantity" real NOT NULL,
	"unit" text NOT NULL,
	"reorder_level" real,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "maintenance_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" timestamp,
	"completed" boolean DEFAULT false,
	"category" text NOT NULL,
	"priority" text DEFAULT 'medium'
);
--> statement-breakpoint
CREATE TABLE "production_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"egg_count" integer NOT NULL,
	"grade_a" integer,
	"grade_b" integer,
	"broken" integer,
	"notes" text,
	"batch_id" text
);
--> statement-breakpoint
CREATE TABLE "research_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"tags" text[],
	"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
