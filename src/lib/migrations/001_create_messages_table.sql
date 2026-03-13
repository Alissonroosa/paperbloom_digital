-- Migration: Create messages table
-- Description: Creates the main messages table with all required fields, constraints, and indexes

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name VARCHAR(100) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  message_text VARCHAR(500) NOT NULL,
  image_url TEXT,
  youtube_url TEXT,
  slug VARCHAR(255) UNIQUE,
  qr_code_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  stripe_session_id VARCHAR(255),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_slug ON messages(slug);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_stripe_session_id ON messages(stripe_session_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Stores personalized messages for Paper Bloom Digital';
COMMENT ON COLUMN messages.id IS 'Unique identifier for the message (UUID v4)';
COMMENT ON COLUMN messages.recipient_name IS 'Name of the message recipient (1-100 characters)';
COMMENT ON COLUMN messages.sender_name IS 'Name of the message sender (1-100 characters)';
COMMENT ON COLUMN messages.message_text IS 'The personalized message text (1-500 characters)';
COMMENT ON COLUMN messages.image_url IS 'URL of the uploaded image (optional)';
COMMENT ON COLUMN messages.youtube_url IS 'YouTube video URL (optional)';
COMMENT ON COLUMN messages.slug IS 'Unique URL slug for accessing the message (generated after payment)';
COMMENT ON COLUMN messages.qr_code_url IS 'URL of the generated QR code (generated after payment)';
COMMENT ON COLUMN messages.status IS 'Payment status: pending or paid';
COMMENT ON COLUMN messages.stripe_session_id IS 'Stripe checkout session ID for tracking';
COMMENT ON COLUMN messages.view_count IS 'Number of times the message has been viewed';
COMMENT ON COLUMN messages.created_at IS 'Timestamp when the message was created';
COMMENT ON COLUMN messages.updated_at IS 'Timestamp when the message was last updated';
