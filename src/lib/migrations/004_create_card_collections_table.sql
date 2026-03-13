-- Migration: Create card_collections table
-- Description: Creates the card_collections table for the "12 Cartas" product with all required fields, constraints, and indexes

-- Create card_collections table
CREATE TABLE IF NOT EXISTS card_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name VARCHAR(100) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  qr_code_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  stripe_session_id VARCHAR(255) UNIQUE,
  contact_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_collections_slug ON card_collections(slug);
CREATE INDEX IF NOT EXISTS idx_card_collections_stripe_session ON card_collections(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_card_collections_status ON card_collections(status);

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_card_collections_updated_at 
  BEFORE UPDATE ON card_collections 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE card_collections IS 'Stores collections of 12 cards for the "12 Cartas" product';
COMMENT ON COLUMN card_collections.id IS 'Unique identifier for the card collection (UUID v4)';
COMMENT ON COLUMN card_collections.recipient_name IS 'Name of the card collection recipient (1-100 characters)';
COMMENT ON COLUMN card_collections.sender_name IS 'Name of the card collection sender (1-100 characters)';
COMMENT ON COLUMN card_collections.slug IS 'Unique URL slug for accessing the card collection (generated after payment)';
COMMENT ON COLUMN card_collections.qr_code_url IS 'URL of the generated QR code (generated after payment)';
COMMENT ON COLUMN card_collections.status IS 'Payment status: pending or paid';
COMMENT ON COLUMN card_collections.stripe_session_id IS 'Stripe checkout session ID for tracking';
COMMENT ON COLUMN card_collections.contact_email IS 'Email address for sending the collection link and QR code';
COMMENT ON COLUMN card_collections.created_at IS 'Timestamp when the collection was created';
COMMENT ON COLUMN card_collections.updated_at IS 'Timestamp when the collection was last updated';
