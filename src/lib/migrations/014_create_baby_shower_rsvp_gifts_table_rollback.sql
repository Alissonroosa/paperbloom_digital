-- Rollback: Drop baby_shower_rsvp_gifts table
DROP INDEX IF EXISTS idx_baby_shower_rsvp_gifts_rsvp_id;
DROP INDEX IF EXISTS idx_baby_shower_rsvp_gifts_gift_id;
DROP TABLE IF EXISTS baby_shower_rsvp_gifts;
