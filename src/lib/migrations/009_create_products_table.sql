-- Migration 009: Tabela `products` (gerencial)
-- Catálogo de produtos para uso no admin (cadastro de pedidos físicos).
-- Independente de src/data/catalog/*.json (que serve o site público).
-- Seed inicial: produtos ativos da coleção Dia dos Namorados 2026.

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  default_cost_cents integer NOT NULL DEFAULT 0,
  default_price_cents integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (lower(name));

-- Seed inicial — preços de venda do catálogo DN 2026, custo = 0 (admin preenche depois).
-- ON CONFLICT por nome evita duplicar se a migration rodar 2x.
INSERT INTO products (name, default_cost_cents, default_price_cents, active) VALUES
  ('Verdade ou Beijo — Edição Romance', 0, 5500, true),
  ('Verdade ou Beijo — Edição HOT +18', 0, 6500, true),
  ('Baralho Personalizado com Fotos do Casal', 0, 6900, true),
  ('Caixa Explosão com Caneca Personalizada', 0, 6000, true),
  ('Quadro Personalizado', 0, 3900, true),
  ('Quadro com 9 Polaroids + Fio de Fada', 0, 5500, true),
  ('Caneca Personalizada', 0, 3500, true),
  ('Nossas Memórias — Livro Personalizado', 0, 6900, true),
  ('10 Motivos para Te Amar', 0, 1990, true),
  ('Caixinha com Polaroides Personalizadas', 0, 1590, true),
  ('Foto Ímãs Personalizados', 0, 1090, true),
  ('Vales do Amor — 12 Cupons Românticos', 0, 1590, true),
  ('Kit Presente Caixa Envelope — Dia dos Namorados', 0, 11990, true),
  ('Kit Presente Caixa MDF — Dia dos Namorados', 0, 12990, true),
  ('Kit Cesta Coração — Dia dos Namorados', 0, 9990, true)
ON CONFLICT DO NOTHING;
