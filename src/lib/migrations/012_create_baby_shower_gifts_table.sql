-- Migration: Create baby_shower_gifts table
-- Description: Gift list items (fralda + mimo) for a baby shower event.
--              Reservation is tracked by quantity (qty_desired vs qty_reserved).
--              price_cents / payment columns are nullable and reserved for the
--              future "guest pays online" flow (MVP 2) — unused in MVP 1.

CREATE TABLE IF NOT EXISTS baby_shower_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_shower_id UUID NOT NULL REFERENCES baby_showers(id) ON DELETE CASCADE,

  -- Item description
  name VARCHAR(150) NOT NULL,
  category VARCHAR(40) NOT NULL DEFAULT 'mimo' CHECK (category IN ('fralda', 'mimo')),
  -- Diaper size when category = 'fralda' (RN, P, M, G, XG); null for mimos
  diaper_size VARCHAR(5) CHECK (diaper_size IS NULL OR diaper_size IN ('RN', 'P', 'M', 'G', 'XG')),

  -- Quantity-based reservation
  qty_desired INTEGER NOT NULL DEFAULT 1 CHECK (qty_desired >= 1),
  qty_reserved INTEGER NOT NULL DEFAULT 0 CHECK (qty_reserved >= 0),

  -- Pricing (reserved for MVP 2 — guest online payment). Nullable, unused in MVP 1.
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),

  -- Whether this item was added custom by the host (vs from the base catalog)
  is_custom BOOLEAN NOT NULL DEFAULT false,

  -- Display ordering
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT baby_shower_gifts_reserved_lte_desired CHECK (qty_reserved <= qty_desired)
);

CREATE INDEX IF NOT EXISTS idx_baby_shower_gifts_baby_shower_id ON baby_shower_gifts(baby_shower_id);
CREATE INDEX IF NOT EXISTS idx_baby_shower_gifts_category ON baby_shower_gifts(category);

CREATE TRIGGER update_baby_shower_gifts_updated_at
  BEFORE UPDATE ON baby_shower_gifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE baby_shower_gifts IS 'Gift list items (fralda + mimo) for a baby shower event';
COMMENT ON COLUMN baby_shower_gifts.diaper_size IS 'Diaper size (RN/P/M/G/XG) when category is fralda, null otherwise';
COMMENT ON COLUMN baby_shower_gifts.qty_reserved IS 'Units already reserved by guests; cannot exceed qty_desired';
COMMENT ON COLUMN baby_shower_gifts.price_cents IS 'Suggested price in BRL cents; reserved for MVP 2 online payment, unused in MVP 1';
COMMENT ON COLUMN baby_shower_gifts.is_custom IS 'True if the host added this item manually instead of from the base catalog';
