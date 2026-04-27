-- Migration: Add cover image field to card_collections table
-- Description: Single cover photo uploaded in Step 2; used as fallback for any card without its own image

ALTER TABLE card_collections
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMENT ON COLUMN card_collections.cover_image_url IS 'Cover photo applied as background for cards that have no individual image (optional)';
