-- Rollback Migration: Remove theme customization fields
-- Description: Removes theme customization columns from messages table

-- Drop indexes
DROP INDEX IF EXISTS idx_messages_theme;

-- Remove theme customization columns
ALTER TABLE messages 
DROP COLUMN IF EXISTS background_color,
DROP COLUMN IF EXISTS theme,
DROP COLUMN IF EXISTS custom_emoji,
DROP COLUMN IF EXISTS music_start_time,
DROP COLUMN IF EXISTS show_time_counter,
DROP COLUMN IF EXISTS time_counter_label;
