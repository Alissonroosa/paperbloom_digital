-- Rollback: Remove enhanced message fields
-- Description: Removes the columns added in migration 002

-- Remove columns from messages table
ALTER TABLE messages 
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS special_date,
DROP COLUMN IF EXISTS closing_message,
DROP COLUMN IF EXISTS signature,
DROP COLUMN IF EXISTS gallery_images;

-- Drop indexes
DROP INDEX IF EXISTS idx_messages_special_date;
DROP INDEX IF EXISTS idx_messages_title;
