CREATE TABLE `bill_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`amount` integer NOT NULL,
	`date` text NOT NULL,
	`users` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bill_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user` text NOT NULL,
	`note` text,
	`amount` integer NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `iou_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note` text NOT NULL,
	`amount` integer NOT NULL,
	`date` text NOT NULL
);
