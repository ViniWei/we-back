-- Add transaction_date column to finances table
ALTER TABLE `finances` ADD COLUMN `transaction_date` date NOT NULL DEFAULT (CURDATE());
