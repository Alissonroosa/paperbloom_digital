-- Migration: Add intro_message and contact_phone columns to card_collections table
-- Date: 2026-01-05
-- Description: Adds support for personalized intro message and contact phone number

-- Add intro_message column
ALTER TABLE card_collections
ADD COLUMN IF NOT EXISTS intro_message TEXT;

-- Add contact_phone column
ALTER TABLE card_collections
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Add comments for documentation
COMMENT ON COLUMN card_collections.intro_message IS 'Personalized introduction message for the card collection';
COMMENT ON COLUMN card_collections.contact_phone IS 'Contact phone number for delivery';
