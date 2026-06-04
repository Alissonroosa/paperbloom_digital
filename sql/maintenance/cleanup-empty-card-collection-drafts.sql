-- Limpeza pontual: collections de "12 Cartas" abandonadas com placeholders
--
-- Motivação:
-- /editor/12-cartas cria uma collection no banco assim que a página monta,
-- com placeholders "Destinatário"/"Remetente". Tráfego pago gerou muitas
-- linhas vazias que nunca foram editadas. Esta query remove esse lixo.
--
-- Critérios de "lixo":
--   - status = 'pending' (nunca foi paga)
--   - recipient_name E sender_name ainda nos placeholders padrão
--   - sem email de contato preenchido
--   - sem mensagem de abertura (intro_message)
--   - sem foto coringa (cover_image_url)
--   - sem música (youtube_video_id)
--   - criada há mais de 24h (não pega rascunho ativo recente)
--   - nenhuma das 12 cartas teve título OU mensagem alterada do padrão
--
-- RECOMENDAÇÃO: rode primeiro o SELECT (passo 1) pra ver o que será deletado.
-- Só depois rode o DELETE (passo 2) dentro de uma transação.

-- ──────────────────────────────────────────────────────────────────────────────
-- PASSO 1 — Audita o que seria deletado
-- ──────────────────────────────────────────────────────────────────────────────
SELECT
  cc.id,
  cc.recipient_name,
  cc.sender_name,
  cc.created_at,
  cc.status,
  cc.contact_email,
  cc.intro_message IS NOT NULL                                   AS has_intro,
  cc.cover_image_url IS NOT NULL                                 AS has_cover,
  cc.youtube_video_id IS NOT NULL                                AS has_music,
  (
    SELECT COUNT(*)
    FROM cards c
    WHERE c.collection_id = cc.id
      AND (c.image_url IS NOT NULL OR c.title <> '' )
  )                                                              AS cards_with_content
FROM card_collections cc
WHERE cc.status = 'pending'
  AND cc.recipient_name = 'Destinatário'
  AND cc.sender_name = 'Remetente'
  AND (cc.contact_email IS NULL OR cc.contact_email = '')
  AND cc.intro_message IS NULL
  AND cc.cover_image_url IS NULL
  AND cc.youtube_video_id IS NULL
  AND cc.created_at < NOW() - INTERVAL '24 hours'
  AND NOT EXISTS (
    SELECT 1 FROM cards c
    WHERE c.collection_id = cc.id
      AND (c.image_url IS NOT NULL)
  )
ORDER BY cc.created_at DESC;

-- ──────────────────────────────────────────────────────────────────────────────
-- PASSO 2 — Deleta (dentro de uma transação, com COMMIT no fim)
-- ──────────────────────────────────────────────────────────────────────────────
-- BEGIN;
--
-- WITH targets AS (
--   SELECT cc.id
--   FROM card_collections cc
--   WHERE cc.status = 'pending'
--     AND cc.recipient_name = 'Destinatário'
--     AND cc.sender_name = 'Remetente'
--     AND (cc.contact_email IS NULL OR cc.contact_email = '')
--     AND cc.intro_message IS NULL
--     AND cc.cover_image_url IS NULL
--     AND cc.youtube_video_id IS NULL
--     AND cc.created_at < NOW() - INTERVAL '24 hours'
--     AND NOT EXISTS (
--       SELECT 1 FROM cards c
--       WHERE c.collection_id = cc.id
--         AND (c.image_url IS NOT NULL)
--     )
-- )
-- DELETE FROM cards WHERE collection_id IN (SELECT id FROM targets);
--
-- WITH targets AS (
--   SELECT cc.id
--   FROM card_collections cc
--   WHERE cc.status = 'pending'
--     AND cc.recipient_name = 'Destinatário'
--     AND cc.sender_name = 'Remetente'
--     AND (cc.contact_email IS NULL OR cc.contact_email = '')
--     AND cc.intro_message IS NULL
--     AND cc.cover_image_url IS NULL
--     AND cc.youtube_video_id IS NULL
--     AND cc.created_at < NOW() - INTERVAL '24 hours'
--     AND NOT EXISTS (
--       SELECT 1 FROM cards c
--       WHERE c.collection_id = cc.id
--         AND (c.image_url IS NOT NULL)
--     )
-- )
-- DELETE FROM card_collections WHERE id IN (SELECT id FROM targets);
--
-- -- Confira a contagem antes de commitar
-- COMMIT;
-- -- ou ROLLBACK; se algo parecer estranho
