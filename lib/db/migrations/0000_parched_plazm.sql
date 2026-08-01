CREATE TABLE `brain_dumps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`mode` text,
	`ai_response` text,
	`is_quick_capture` integer DEFAULT false,
	`saved_note_id` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text,
	`source_id` integer,
	`title` text NOT NULL,
	`description` text,
	`location` text,
	`video_url` text,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`is_all_day` integer DEFAULT false,
	`rrule` text,
	`attendees` text,
	`status` text DEFAULT 'confirmed',
	`raw_data` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`source_id`) REFERENCES `calendar_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `calendar_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`calendar_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#4285F4' NOT NULL,
	`is_enabled` integer DEFAULT true,
	`sync_token` text,
	`last_synced` integer,
	`oauth_token_id` integer,
	FOREIGN KEY (`oauth_token_id`) REFERENCES `oauth_tokens`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `daily_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note_date` text NOT NULL,
	`hour_block` integer,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `email_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`color` text DEFAULT '#EA4335',
	`imap_host` text,
	`imap_port` integer,
	`smtp_host` text,
	`smtp_port` integer,
	`oauth_token_id` integer,
	`last_synced` integer,
	`is_enabled` integer DEFAULT true,
	FOREIGN KEY (`oauth_token_id`) REFERENCES `oauth_tokens`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer,
	`message_id` text NOT NULL,
	`thread_id` text,
	`subject` text,
	`from_name` text,
	`from_email` text,
	`to_addresses` text,
	`cc_addresses` text,
	`body_plain` text,
	`body_html` text,
	`snippet` text,
	`is_read` integer DEFAULT false,
	`is_flagged` integer DEFAULT false,
	`is_archived` integer DEFAULT false,
	`ai_summary` text,
	`received_at` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`account_id`) REFERENCES `email_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `grocery_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`quantity` real,
	`unit` text,
	`category` text,
	`store` text,
	`is_checked` integer DEFAULT false,
	`is_recurring` integer DEFAULT false,
	`recur_every_days` integer,
	`next_recur_at` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `morning_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_date` text NOT NULL,
	`primary_focus` text,
	`reflection` text,
	`skipped` integer DEFAULT false,
	`ai_suggestions` text,
	`email_brief` text,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `morning_plans_plan_date_unique` ON `morning_plans` (`plan_date`);--> statement-breakpoint
CREATE TABLE `note_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note_id` integer,
	`linked_type` text,
	`linked_id` integer,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`title` text NOT NULL,
	`content` text,
	`is_pinned` integer DEFAULT false,
	`tags` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oauth_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`account_email` text,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`expires_at` integer,
	`scope` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#6366F1',
	`icon` text,
	`is_archived` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `prompt_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`system` text NOT NULL,
	`user_prefix` text,
	`model` text DEFAULT 'gemini-2.0-flash',
	`version` integer DEFAULT 1,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prompt_templates_name_unique` ON `prompt_templates` (`name`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text,
	`source` text DEFAULT 'local' NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`project` text,
	`labels` text,
	`priority` integer DEFAULT 4,
	`due_at` integer,
	`scheduled_start` integer,
	`scheduled_end` integer,
	`completed_at` integer,
	`is_synced` integer DEFAULT false,
	`raw_data` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
