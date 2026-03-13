-- Rollback: Drop gender_reveals table
DROP TRIGGER IF EXISTS update_gender_reveals_updated_at ON gender_reveals;
DROP INDEX IF EXISTS idx_gender_reveals_slug;
DROP INDEX IF EXISTS idx_gender_reveals_dashboard_slug;
DROP INDEX IF EXISTS idx_gender_reveals_status;
DROP INDEX IF EXISTS idx_gender_reveals_payment_id;
DROP TABLE IF EXISTS gender_reveals;
