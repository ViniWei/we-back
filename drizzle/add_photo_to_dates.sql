-- Adicionar coluna photo na tabela dates
ALTER TABLE dates ADD COLUMN photo VARCHAR(500) AFTER description;
