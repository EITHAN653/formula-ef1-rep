CREATE TABLE "adjustments" (
	"id" serial PRIMARY KEY,
	"driver" text NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" serial PRIMARY KEY,
	"round" text NOT NULL,
	"driver" text NOT NULL,
	"pos" integer NOT NULL,
	"status" text NOT NULL,
	"pts" integer NOT NULL,
	CONSTRAINT "results_round_driver_unique" UNIQUE("round","driver"),
	CONSTRAINT "results_round_pos_unique" UNIQUE("round","pos")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL
);
