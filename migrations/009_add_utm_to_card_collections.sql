-- Migration: Add UTM tracking columns to card_collections
-- Description: Captura UTM parameters da primeira visita do usuário ao editor/LP.
-- Permite atribuir cada venda ao criativo/campanha de Meta/Google que a originou.
-- Capturado no client (sessionStorage), enviado na criação da collection.

ALTER TABLE card_collections
ADD COLUMN IF NOT EXISTS utm_source   TEXT,
ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_content  TEXT,
ADD COLUMN IF NOT EXISTS utm_term     TEXT;

-- Índices para filtrar relatórios de funil por campanha sem full table scan
CREATE INDEX IF NOT EXISTS idx_card_collections_utm_campaign
  ON card_collections(utm_campaign)
  WHERE utm_campaign IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_card_collections_utm_source
  ON card_collections(utm_source)
  WHERE utm_source IS NOT NULL;

COMMENT ON COLUMN card_collections.utm_source IS
'utm_source da primeira visita (ex.: meta, google, instagram)';

COMMENT ON COLUMN card_collections.utm_medium IS
'utm_medium da primeira visita (ex.: cpc, organic, paid_social)';

COMMENT ON COLUMN card_collections.utm_campaign IS
'utm_campaign da primeira visita (ex.: dn26, vob-romance)';

COMMENT ON COLUMN card_collections.utm_content IS
'utm_content da primeira visita (ex.: video-quadro-qrcode-v1)';

COMMENT ON COLUMN card_collections.utm_term IS
'utm_term da primeira visita (ex.: keyword da busca)';
