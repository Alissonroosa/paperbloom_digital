-- Migration 008: Create digital_art_orders table
-- Stores orders for digital art products delivered via Canva template links.
-- No download_count, max_downloads or expires_at — delivery is via Canva, not R2.

CREATE TABLE IF NOT EXISTS digital_art_orders (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text         NOT NULL,
  product_slug     text         NOT NULL,
  product_title    text         NOT NULL,
  amount_cents     integer      NOT NULL,
  mp_payment_id    text         UNIQUE,
  mp_preference_id text,
  status           text         NOT NULL DEFAULT 'pending',
  created_at       timestamptz  NOT NULL DEFAULT now(),
  paid_at          timestamptz,
  refunded_at      timestamptz,

  CONSTRAINT digital_art_orders_status_check
    CHECK (status IN ('pending', 'paid', 'refunded'))
);

CREATE INDEX IF NOT EXISTS digital_art_orders_email_idx
  ON digital_art_orders (email);

CREATE INDEX IF NOT EXISTS digital_art_orders_mp_payment_id_idx
  ON digital_art_orders (mp_payment_id);

CREATE INDEX IF NOT EXISTS digital_art_orders_status_idx
  ON digital_art_orders (status);
