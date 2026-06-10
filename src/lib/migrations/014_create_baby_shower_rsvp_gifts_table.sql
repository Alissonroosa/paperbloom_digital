-- Migration: Create baby_shower_rsvp_gifts table
-- Description: Items reserved by a guest within a single RSVP. A guest may reserve
--              more than one gift (e.g. a diaper + a "mimo"). Each row links an
--              RSVP to a gift with a quantity. The aggregate against
--              baby_shower_gifts.qty_reserved is still the source of availability.

CREATE TABLE IF NOT EXISTS baby_shower_rsvp_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES baby_shower_rsvps(id) ON DELETE CASCADE,
  gift_id UUID NOT NULL REFERENCES baby_shower_gifts(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty >= 1),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baby_shower_rsvp_gifts_rsvp_id ON baby_shower_rsvp_gifts(rsvp_id);
CREATE INDEX IF NOT EXISTS idx_baby_shower_rsvp_gifts_gift_id ON baby_shower_rsvp_gifts(gift_id);

COMMENT ON TABLE baby_shower_rsvp_gifts IS 'Gifts reserved by a guest within an RSVP (allows fralda + mimo in one confirmation)';
COMMENT ON COLUMN baby_shower_rsvp_gifts.qty IS 'Units of this gift reserved by the guest';
