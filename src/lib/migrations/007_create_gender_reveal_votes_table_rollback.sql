-- Rollback: Drop gender_reveal_votes table
DROP INDEX IF EXISTS idx_gender_reveal_votes_reveal_id;
DROP INDEX IF EXISTS idx_gender_reveal_votes_vote;
DROP TABLE IF EXISTS gender_reveal_votes;
