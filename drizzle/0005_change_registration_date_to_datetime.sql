-- Change registration_date column from DATE to DATETIME
ALTER TABLE `users` MODIFY COLUMN `registration_date` DATETIME NULL;
