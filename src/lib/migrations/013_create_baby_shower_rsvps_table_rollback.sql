-- Rollback: Drop baby_shower_rsvps table
DROP TRIGGER IF EXISTS update_baby_shower_rsvps_updated_at ON baby_shower_rsvps;
DROP INDEX IF EXISTS idx_baby_shower_rsvps_baby_shower_id;
DROP INDEX IF EXISTS idx_baby_shower_rsvps_gift_id;
DROP INDEX IF EXISTS idx_baby_shower_rsvps_attendance;
DROP TABLE IF EXISTS baby_shower_rsvps;
