-- Migration: Create gender_reveal_votes table
-- Description: Creates the votes table for tracking guesses on gender reveals

-- Create gender_reveal_votes table
CREATE TABLE IF NOT EXISTS gender_reveal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reveal_id UUID NOT NULL REFERENCES gender_reveals(id) ON DELETE CASCADE,
  
  -- Voter info
  voter_name VARCHAR(100) NOT NULL,
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('menino', 'menina')),
  
  -- Optional message from voter
  message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gender_reveal_votes_reveal_id ON gender_reveal_votes(reveal_id);
CREATE INDEX IF NOT EXISTS idx_gender_reveal_votes_vote ON gender_reveal_votes(vote);

-- Add comments for documentation
COMMENT ON TABLE gender_reveal_votes IS 'Stores votes/guesses from visitors on gender reveals';
COMMENT ON COLUMN gender_reveal_votes.voter_name IS 'Name of the person who voted';
COMMENT ON COLUMN gender_reveal_votes.vote IS 'The guess: menino or menina';
COMMENT ON COLUMN gender_reveal_votes.message IS 'Optional message left by the voter';
