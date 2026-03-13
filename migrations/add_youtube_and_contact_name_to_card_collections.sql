-- Migration: Add youtube_video_id and contact_name to card_collections
-- Date: 2025-01-10
-- Description: Adds support for YouTube music and contact name in card collections

-- Add youtube_video_id column if it doesn't exist
ALTER TABLE card_collections 
ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(255);

-- Add contact_name column if it doesn't exist
ALTER TABLE card_collections 
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_card_collections_youtube_video_id 
ON card_collections(youtube_video_id) 
WHERE youtube_video_id IS NOT NULL;

-- Add comment to columns
COMMENT ON COLUMN card_collections.youtube_video_id IS 'YouTube video ID for background music';
COMMENT ON COLUMN card_collections.contact_name IS 'Name of the contact person for email delivery';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'card_collections'
AND column_name IN ('youtube_video_id', 'contact_name');
