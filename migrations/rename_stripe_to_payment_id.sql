-- Migration: Rename stripe_session_id to payment_id
-- This migration supports the switch from Stripe to Mercado Pago

-- Rename column in messages table
ALTER TABLE messages RENAME COLUMN stripe_session_id TO payment_id;

-- Rename column in card_collections table
ALTER TABLE card_collections RENAME COLUMN stripe_session_id TO payment_id;
