-- Migration: Add dashboard_token to card_collections
-- Description: Magic link token (sem expiração) que dá acesso ao painel /painel/[token].
-- Gerado uma vez pelo webhook do Mercado Pago após pagamento confirmado.
-- Usado pelas Specs 3.1 (email-compra-neutro) e 3.2 (dashboard-comprador-base).

ALTER TABLE card_collections
ADD COLUMN IF NOT EXISTS dashboard_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_card_collections_dashboard_token
ON card_collections(dashboard_token);

COMMENT ON COLUMN card_collections.dashboard_token IS
'Token único (UUID v4) para acesso ao painel via /painel/[token] — magic link sem expiração, gerado no webhook MP após pagamento';
