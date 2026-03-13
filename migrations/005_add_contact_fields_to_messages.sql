-- Migration: Add contact fields to messages table
-- Date: 2024-12-05
-- Description: Adds contact_name, contact_email, and contact_phone fields to store customer contact information

-- Add contact fields
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Add index on contact_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_contact_email ON messages(contact_email);

-- Add comments to document the fields
COMMENT ON COLUMN messages.contact_name IS 'Full name of the person who created the message';
COMMENT ON COLUMN messages.contact_email IS 'Email address for delivery notifications and QR code';
COMMENT ON COLUMN messages.contact_phone IS 'Phone number in Brazilian format (XX) XXXXX-XXXX';
