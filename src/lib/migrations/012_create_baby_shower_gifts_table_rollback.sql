-- Rollback: Drop baby_shower_gifts table
DROP TRIGGER IF EXISTS update_baby_shower_gifts_updated_at ON baby_shower_gifts;
DROP INDEX IF EXISTS idx_baby_shower_gifts_baby_shower_id;
DROP INDEX IF EXISTS idx_baby_shower_gifts_category;
DROP TABLE IF EXISTS baby_shower_gifts;
