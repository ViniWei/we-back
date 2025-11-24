-- Migration: Change trips start_date and end_date from DATE to DATETIME
-- This fixes timezone issues where dates were being saved incorrectly

ALTER TABLE `trips` 
MODIFY COLUMN `start_date` DATETIME,
MODIFY COLUMN `end_date` DATETIME;
