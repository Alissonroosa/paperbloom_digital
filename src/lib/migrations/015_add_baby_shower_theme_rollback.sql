-- Rollback: Remove theme column from baby_showers
ALTER TABLE baby_showers DROP COLUMN IF EXISTS theme;
