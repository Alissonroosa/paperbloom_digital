-- Migration: Add theme customization fields
-- Description: Adds columns for theme customization (background color, theme style, emoji, music settings, time counter)

-- Add theme customization columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS background_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) CHECK (theme IN ('gradient', 'bright', 'matte', 'pastel', 'neon', 'vintage')),
ADD COLUMN IF NOT EXISTS custom_emoji VARCHAR(10),
ADD COLUMN IF NOT EXISTS music_start_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS show_time_counter BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS time_counter_label VARCHAR(100);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_theme ON messages(theme);

-- Add comments for documentation
COMMENT ON COLUMN messages.background_color IS 'Background color in hex format (e.g., #FDF6F0)';
COMMENT ON COLUMN messages.theme IS 'Visual theme style: gradient, bright, matte, pastel, neon, or vintage';
COMMENT ON COLUMN messages.custom_emoji IS 'Custom emoji for falling animation (optional)';
COMMENT ON COLUMN messages.music_start_time IS 'YouTube music start time in seconds (default: 0)';
COMMENT ON COLUMN messages.show_time_counter IS 'Whether to show time counter (default: false)';
COMMENT ON COLUMN messages.time_counter_label IS 'Label for time counter (e.g., "Juntos há")';
