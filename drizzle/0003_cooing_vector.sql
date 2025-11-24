ALTER TABLE `trips` MODIFY COLUMN `start_date` datetime;--> statement-breakpoint
ALTER TABLE `trips` MODIFY COLUMN `end_date` datetime;--> statement-breakpoint
ALTER TABLE `dates` ADD `photo` varchar(500);--> statement-breakpoint
ALTER TABLE `mood_calendar` ADD `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `mood_calendar` ADD `modified_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD `last_day_access` date;--> statement-breakpoint
ALTER TABLE `mood_calendar` DROP COLUMN `note`;--> statement-breakpoint
ALTER TABLE `mood_calendar` DROP COLUMN `share`;--> statement-breakpoint
ALTER TABLE `mood_calendar` DROP COLUMN `registration_date`;