-- Migration: Create baby_shower_rsvps table
-- Description: Guest RSVPs for a baby shower event. A guest confirms attendance
--              (sim/nao/talvez), may reserve a gift item and leave a message.
--              gift_payment columns are reserved for MVP 2 (guest pays online) — unused in MVP 1.

CREATE TABLE IF NOT EXISTS baby_shower_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_shower_id UUID NOT NULL REFERENCES baby_showers(id) ON DELETE CASCADE,

  -- Guest info
  guest_name VARCHAR(100) NOT NULL,
  attendance VARCHAR(10) NOT NULL CHECK (attendance IN ('sim', 'nao', 'talvez')),
  message TEXT,

  -- Optional gift reservation
  gift_id UUID REFERENCES baby_shower_gifts(id) ON DELETE SET NULL,
  gift_qty INTEGER NOT NULL DEFAULT 0 CHECK (gift_qty >= 0),

  -- Gift payment (reserved for MVP 2). 'none' in MVP 1.
  gift_payment_status VARCHAR(20) NOT NULL DEFAULT 'none'
    CHECK (gift_payment_status IN ('none', 'pending', 'paid')),
  gift_payment_id VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baby_shower_rsvps_baby_shower_id ON baby_shower_rsvps(baby_shower_id);
CREATE INDEX IF NOT EXISTS idx_baby_shower_rsvps_gift_id ON baby_shower_rsvps(gift_id);
CREATE INDEX IF NOT EXISTS idx_baby_shower_rsvps_attendance ON baby_shower_rsvps(attendance);

CREATE TRIGGER update_baby_shower_rsvps_updated_at
  BEFORE UPDATE ON baby_shower_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE baby_shower_rsvps IS 'Guest RSVPs (attendance + optional gift reservation + message) for a baby shower';
COMMENT ON COLUMN baby_shower_rsvps.attendance IS 'Guest attendance: sim, nao or talvez';
COMMENT ON COLUMN baby_shower_rsvps.gift_id IS 'Reserved gift item, if the guest chose one';
COMMENT ON COLUMN baby_shower_rsvps.gift_qty IS 'Number of units reserved by this guest for the chosen gift';
COMMENT ON COLUMN baby_shower_rsvps.gift_payment_status IS 'Reserved for MVP 2 online payment; always none in MVP 1';
