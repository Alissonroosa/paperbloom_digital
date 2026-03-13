-- Migration: Create admin tables
-- Description: Tables for admin panel - users, product prices, and price history

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product prices table (dynamic pricing)
CREATE TABLE IF NOT EXISTS product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(50) NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  price_from_cents INTEGER, -- "preço de" (original/riscado)
  price_cents INTEGER NOT NULL, -- "preço por" (atual)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history table (audit trail)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(50) NOT NULL,
  old_price_cents INTEGER,
  new_price_cents INTEGER NOT NULL,
  old_price_from_cents INTEGER,
  new_price_from_cents INTEGER,
  changed_by UUID REFERENCES admin_users(id),
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_product_prices_product_id ON product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at DESC);

-- Insert default admin user (password: Alice2611)
-- Hash generated with bcrypt
INSERT INTO admin_users (email, password_hash, name)
VALUES ('paperbloom.tm@gmail.com', '$2b$10$placeholder_will_be_set_on_first_run', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default product prices
INSERT INTO product_prices (product_id, product_name, price_from_cents, price_cents)
VALUES 
  ('message', 'Paper Bloom Digital - Mensagem Personalizada', NULL, 1990),
  ('card-collection', 'Paper Bloom Digital - 12 Cartas', NULL, 2990),
  ('gender-reveal', 'Paper Bloom Digital - Revelação Virtual', NULL, 1990)
ON CONFLICT (product_id) DO NOTHING;

-- Comments
COMMENT ON TABLE admin_users IS 'Admin panel users with authentication';
COMMENT ON TABLE product_prices IS 'Dynamic product pricing with promotional prices';
COMMENT ON TABLE price_history IS 'Audit trail for price changes';
COMMENT ON COLUMN product_prices.price_from_cents IS 'Original price shown crossed out (promotional)';
COMMENT ON COLUMN product_prices.price_cents IS 'Current selling price';
