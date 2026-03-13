-- Rollback Migration: Drop messages table
-- Description: Removes the messages table and all associated objects

-- Drop trigger
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes (will be dropped automatically with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_messages_slug;
DROP INDEX IF EXISTS idx_messages_status;
DROP INDEX IF EXISTS idx_messages_stripe_session_id;

-- Drop table
DROP TABLE IF EXISTS messages;
