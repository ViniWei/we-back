-- Migration: Add relationship_start_date to user_groups table
ALTER TABLE `user_groups` ADD COLUMN `relationship_start_date` datetime;
