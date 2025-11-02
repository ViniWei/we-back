CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int,
	`trip_id` int,
	`event_name` varchar(255),
	`date` datetime NOT NULL,
	`created_by` int,
	`modified_by` int,
	`created_at` timestamp DEFAULT (now()),
	`modified_at` timestamp DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `date_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` varchar(50) NOT NULL,
	CONSTRAINT `date_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`date` datetime NOT NULL,
	`location` varchar(255),
	`description` text,
	`status_id` int NOT NULL,
	`created_by` int,
	`modified_by` int,
	`created_at` timestamp DEFAULT (now()),
	`modified_at` timestamp DEFAULT (now()),
	CONSTRAINT `dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finance_type` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	CONSTRAINT `finance_type_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int,
	`description` varchar(255),
	`amount` float,
	`type_id` int,
	`instalments` int DEFAULT 1,
	`transaction_date` date NOT NULL,
	`created_by` int,
	`modified_by` int,
	`created_at` timestamp DEFAULT (now()),
	`modified_at` timestamp DEFAULT (now()),
	CONSTRAINT `finances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` varchar(50) NOT NULL,
	CONSTRAINT `game_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int,
	`name` varchar(255),
	`platform` varchar(50),
	`status_id` int,
	`link` varchar(255),
	`comment` text,
	`created_by` int,
	`modified_by` int,
	`created_at` timestamp DEFAULT (now()),
	`modified_at` timestamp DEFAULT (now()),
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_invite_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` varchar(50) NOT NULL,
	CONSTRAINT `group_invite_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_invite` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(100) NOT NULL,
	`creator_user_id` int,
	`status_id` int,
	`expiration` datetime,
	`created_at` datetime NOT NULL,
	CONSTRAINT `group_invite_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_invite_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `language` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(5) NOT NULL,
	`name` varchar(50) NOT NULL,
	`native_name` varchar(50) NOT NULL,
	`flag_emoji` varchar(10),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `language_id` PRIMARY KEY(`id`),
	CONSTRAINT `language_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `mood_calendar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`mood_id` int,
	`note` text,
	`share` tinyint DEFAULT 0,
	`registration_date` datetime,
	CONSTRAINT `mood_calendar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	CONSTRAINT `moods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movie_list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`movie_id` int,
	`list_id` int,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `movie_list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movie_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int,
	`name` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `movie_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`synopsis` text,
	`api_id` varchar(100),
	`poster_path` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `movies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int,
	`suggestion_name` varchar(255),
	`interest` tinyint DEFAULT 0,
	CONSTRAINT `suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trip_id` int NOT NULL,
	`photo_url` varchar(500) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `trip_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` varchar(50) NOT NULL,
	CONSTRAINT `trip_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int,
	`destination` varchar(255),
	`start_date` date,
	`end_date` date,
	`budget` float,
	`description` text,
	`status_id` int,
	`created_by` int,
	`modified_by` int,
	`created_at` timestamp DEFAULT (now()),
	`modified_at` timestamp DEFAULT (now()),
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`active` tinyint DEFAULT 1,
	`group_image_path` varchar(500),
	`relationship_start_date` datetime,
	`created_at` date,
	CONSTRAINT `user_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`registration_date` date,
	`verification_code` varchar(100),
	`verification_expires` datetime,
	`email_verified` tinyint DEFAULT 0,
	`group_invite_id` int,
	`group_id` int,
	`language_id` int,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
-- Seed Data: Status de Dates
INSERT INTO `date_status` (`status`) VALUES 
('pending'),
('canceled'),
('done');
--> statement-breakpoint
-- Seed Data: Status de Trips
INSERT INTO `trip_status` (`status`) VALUES 
('pending'),
('canceled'),
('done');
--> statement-breakpoint
-- Seed Data: Tipos de Finanças
INSERT INTO `finance_type` (`type`) VALUES
('Food'),
('Transport'),
('Accommodation'),
('Entertainment'),
('Shopping'),
('Bills'),
('Health'),
('Other');
--> statement-breakpoint
-- Seed Data: Idiomas
INSERT INTO `language` (`code`, `name`, `native_name`, `flag_emoji`) VALUES
('pt', 'Portuguese', 'Português', '🇧🇷'),
('en', 'English', 'English', '🇺🇸'),
('es', 'Spanish', 'Español', '🇪🇸');
--> statement-breakpoint
-- Seed Data: Status de Convites de Grupo
INSERT INTO `group_invite_status` (`status`) VALUES
('pending'),
('accepted'),
('expired');
--> statement-breakpoint
-- Seed Data: Status de Jogos
INSERT INTO `game_status` (`status`) VALUES
('want_to_play'),
('playing'),
('completed'),
('dropped');
--> statement-breakpoint
-- Seed Data: Moods
INSERT INTO `moods` (`name`) VALUES
('happy'),
('sad'),
('angry'),
('anxious'),
('calm'),
('excited'),
('tired'),
('loved');
