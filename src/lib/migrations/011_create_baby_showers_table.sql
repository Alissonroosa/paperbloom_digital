-- Migration: Create baby_showers table
-- Description: Creates the baby_showers table for the "Chá de Fralda" product

-- Create baby_showers table
CREATE TABLE IF NOT EXISTS baby_showers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Baby info
  baby_name VARCHAR(100),
  baby_gender VARCHAR(10) NOT NULL CHECK (baby_gender IN ('menino', 'menina', 'surpresa')),

  -- Host / parents info
  host_name VARCHAR(100) NOT NULL,
  partner_name VARCHAR(100),
  welcome_message TEXT,

  -- Event details
  event_date TIMESTAMP,
  location_name VARCHAR(200),
  location_address TEXT,
  location_maps_url TEXT,
  guest_count INTEGER DEFAULT 0,

  -- Photos (optional, up to 5)
  photos TEXT[] DEFAULT '{}',

  -- Customization
  primary_color VARCHAR(7) DEFAULT '#E6C2C2',

  -- Contact info (buyer / host)
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
CREATE INDEX IF NOT EXISTS idx_baby_showers_slug ON baby_showers(slug);
CREATE INDEX IF NOT EXISTS idx_baby_showers_dashboard_slug ON baby_showers(dashboard_slug);
CREATE INDEX IF NOT EXISTS idx_baby_showers_status ON baby_showers(status);
CREATE INDEX IF NOT EXISTS idx_baby_showers_payment_id ON baby_showers(payment_id);

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_baby_showers_updated_at
  BEFORE UPDATE ON baby_showers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE baby_showers IS 'Stores baby shower events for the "Chá de Fralda" product';
COMMENT ON COLUMN baby_showers.baby_gender IS 'The baby gender: menino, menina or surpresa';
COMMENT ON COLUMN baby_showers.guest_count IS 'Expected number of guests informed by the host';
COMMENT ON COLUMN baby_showers.slug IS 'Public URL slug for the event page shared with guests';
COMMENT ON COLUMN baby_showers.dashboard_slug IS 'Private URL slug for the host dashboard';
