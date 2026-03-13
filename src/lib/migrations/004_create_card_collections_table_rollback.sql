-- Rollback: Drop card_collections table
-- Description: Removes the card_collections table and all associated objects

-- Drop trigger
DROP TRIGGER IF EXISTS update_card_collections_updated_at ON card_collections;

-- Drop indexes
DROP INDEX IF EXISTS idx_card_collections_slug;
DROP INDEX IF EXISTS idx_card_collections_stripe_session;
DROP INDEX IF EXISTS idx_card_collections_status;

-- Drop table
DROP TABLE IF EXISTS card_collections;
