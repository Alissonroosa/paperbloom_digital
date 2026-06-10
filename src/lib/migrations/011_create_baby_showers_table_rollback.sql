-- Rollback: Drop baby_showers table
DROP TRIGGER IF EXISTS update_baby_showers_updated_at ON baby_showers;
DROP INDEX IF EXISTS idx_baby_showers_slug;
DROP INDEX IF EXISTS idx_baby_showers_dashboard_slug;
DROP INDEX IF EXISTS idx_baby_showers_status;
DROP INDEX IF EXISTS idx_baby_showers_payment_id;
DROP TABLE IF EXISTS baby_showers;
