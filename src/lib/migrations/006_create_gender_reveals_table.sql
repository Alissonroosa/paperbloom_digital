-- Migration: Create gender_reveals table
-- Description: Creates the gender_reveals table for the "Revelação Virtual" product

-- Create gender_reveals table
CREATE TABLE IF NOT EXISTS gender_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Baby info
  boy_name VARCHAR(100) NOT NULL,
  girl_name VARCHAR(100) NOT NULL,
  actual_gender VARCHAR(10) NOT NULL CHECK (actual_gender IN ('menino', 'menina')),
  
  -- Parents info
  dad_name VARCHAR(100) NOT NULL,
  mom_name VARCHAR(100) NOT NULL,
  story_message TEXT,
  
  -- Photos (optional, up to 5)
  photos TEXT[] DEFAULT '{}',
  
  -- Customization
  boy_color VARCHAR(7) DEFAULT '#5B9BD5',
  girl_color VARCHAR(7) DEFAULT '#E6A0B8',
  
  -- Contact info (buyer)
  contact_name VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  
  -- URLs and status
  slug VARCHAR(255) UNIQUE,
  dashboard_slug VARCHAR(255) UNIQUE,
  qr_code_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payment_id VARCHAR(255),
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gender_reveals_slug ON gender_reveals(slug);
CREATE INDEX IF NOT EXISTS idx_gender_reveals_dashboard_slug ON gender_reveals(dashboard_slug);
CREATE INDEX IF NOT EXISTS idx_gender_reveals_status ON gender_reveals(status);
CREATE INDEX IF NOT EXISTS idx_gender_reveals_payment_id ON gender_reveals(payment_id);

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_gender_reveals_updated_at 
  BEFORE UPDATE ON gender_reveals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE gender_reveals IS 'Stores gender reveal experiences for the "Revelação Virtual" product';
COMMENT ON COLUMN gender_reveals.boy_name IS 'Name chosen for the baby if it is a boy';
COMMENT ON COLUMN gender_reveals.girl_name IS 'Name chosen for the baby if it is a girl';
COMMENT ON COLUMN gender_reveals.actual_gender IS 'The actual gender of the baby (menino or menina)';
COMMENT ON COLUMN gender_reveals.story_message IS 'Custom story message from the parents';
COMMENT ON COLUMN gender_reveals.photos IS 'Array of photo URLs (up to 5)';
COMMENT ON COLUMN gender_reveals.slug IS 'Public URL slug for the reveal page';
COMMENT ON COLUMN gender_reveals.dashboard_slug IS 'Private URL slug for the buyer dashboard';
