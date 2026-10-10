CREATE TABLE `cases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`complaint` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
