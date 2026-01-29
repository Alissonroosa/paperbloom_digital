-- Rollback: Drop cards table
-- Description: Removes the cards table and all associated objects

-- Drop trigger
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;

-- Drop indexes
DROP INDEX IF EXISTS idx_cards_collection_id;
DROP INDEX IF EXISTS idx_cards_status;
DROP INDEX IF EXISTS idx_cards_order;

-- Drop table (CASCADE will be handled by the foreign key constraint)
DROP TABLE IF EXISTS cards;
