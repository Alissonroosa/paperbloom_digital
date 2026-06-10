-- Migration: Add theme column to baby_showers
-- Description: Stores the visual theme chosen by the host (Chá de Fralda).
--              Defaults to 'safari'. Valid values are validated in the app layer.

ALTER TABLE baby_showers
  ADD COLUMN IF NOT EXISTS theme VARCHAR(20) NOT NULL DEFAULT 'safari';

COMMENT ON COLUMN baby_showers.theme IS 'Visual theme id (classic, safari, ursos, princesa)';
