-- Migration: Create customers table
-- Description: Stores customer information for order tracking and email delivery
-- Created: 2024-03-15

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT customers_email_unique UNIQUE (email)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Add customer_id to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Create index on customer_id for faster joins
CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);

-- Create orders table to track purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'brl',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'failed', 'refunded'))
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_message_id ON orders(message_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create email_logs table to track email delivery
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL, -- qrcode, confirmation, reminder, etc
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, sent, failed, bounced
  provider_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT email_logs_status_check CHECK (status IN ('pending', 'sent', 'failed', 'bounced'))
);

-- Create indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_customer_id ON email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_message_id ON email_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE customers IS 'Stores customer contact information';
COMMENT ON TABLE orders IS 'Tracks all purchase transactions';
COMMENT ON TABLE email_logs IS 'Logs all email delivery attempts';

COMMENT ON COLUMN customers.email IS 'Customer email address (unique)';
COMMENT ON COLUMN orders.amount_cents IS 'Order amount in cents (e.g., 2999 for R$29.99)';
COMMENT ON COLUMN orders.status IS 'Order payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN email_logs.email_type IS 'Type of email: qrcode, confirmation, reminder, etc';
COMMENT ON COLUMN email_logs.provider_message_id IS 'Message ID from email provider (e.g., Resend)';
