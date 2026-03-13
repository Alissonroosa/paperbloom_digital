-- Migration: Add missing fields to card_collections table
-- Description: Adds contact_phone and intro_message fields that are needed for the checkout flow

-- Add contact_phone field
ALTER TABLE card_collections 
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Add intro_message field
ALTER TABLE card_collections 
ADD COLUMN IF NOT EXISTS intro_message TEXT;

-- Add comments for documentation
COMMENT ON COLUMN card_collections.contact_phone IS 'Phone number for contact (optional)';
COMMENT ON COLUMN card_collections.intro_message IS 'Introductory message shown before the cards (optional)';
