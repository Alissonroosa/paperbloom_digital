-- Migration: Add enhanced message fields
-- Description: Adds new columns for title, special_date, closing_message, signature, and gallery_images

-- Add new columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS title VARCHAR(100),
ADD COLUMN IF NOT EXISTS special_date DATE,
ADD COLUMN IF NOT EXISTS closing_message VARCHAR(200),
ADD COLUMN IF NOT EXISTS signature VARCHAR(50),
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_special_date ON messages(special_date);
CREATE INDEX IF NOT EXISTS idx_messages_title ON messages(title);

-- Add comments for documentation
COMMENT ON COLUMN messages.title IS 'Message title (optional, max 100 characters)';
COMMENT ON COLUMN messages.special_date IS 'Special occasion date (optional)';
COMMENT ON COLUMN messages.closing_message IS 'Closing message text (optional, max 200 characters)';
COMMENT ON COLUMN messages.signature IS 'Custom signature (optional, max 50 characters)';
COMMENT ON COLUMN messages.gallery_images IS 'Array of gallery image URLs (max 3 images)';
