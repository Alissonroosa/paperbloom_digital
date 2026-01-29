-- Migration: Create cards table
-- Description: Creates the cards table for individual cards within a collection with all required fields, constraints, and indexes

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES card_collections(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL CHECK ("order" >= 1 AND "order" <= 12),
  title VARCHAR(200) NOT NULL,
  message_text VARCHAR(500) NOT NULL,
  image_url TEXT,
  youtube_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'unopened' CHECK (status IN ('unopened', 'opened')),
  opened_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, "order")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_collection_id ON cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_order ON cards(collection_id, "order");

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_cards_updated_at 
  BEFORE UPDATE ON cards 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE cards IS 'Stores individual cards within a card collection';
COMMENT ON COLUMN cards.id IS 'Unique identifier for the card (UUID v4)';
COMMENT ON COLUMN cards.collection_id IS 'Foreign key reference to the parent card collection';
COMMENT ON COLUMN cards."order" IS 'Order of the card within the collection (1-12)';
COMMENT ON COLUMN cards.title IS 'Title of the card (e.g., "Abra quando...") (1-200 characters)';
COMMENT ON COLUMN cards.message_text IS 'The personalized message text (1-500 characters)';
COMMENT ON COLUMN cards.image_url IS 'URL of the uploaded image (optional)';
COMMENT ON COLUMN cards.youtube_url IS 'YouTube video URL for music (optional)';
COMMENT ON COLUMN cards.status IS 'Opening status: unopened or opened';
COMMENT ON COLUMN cards.opened_at IS 'Timestamp when the card was first opened (null if unopened)';
COMMENT ON COLUMN cards.created_at IS 'Timestamp when the card was created';
COMMENT ON COLUMN cards.updated_at IS 'Timestamp when the card was last updated';
