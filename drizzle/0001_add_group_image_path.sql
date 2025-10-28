-- Migration: Add group_image_path to user_groups table
ALTER TABLE `user_groups` ADD COLUMN `group_image_path` varchar(500);
