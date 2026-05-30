-- Migration 010: Tabela `physical_orders`
-- Pedidos físicos cadastrados manualmente pelo admin (vendas via WhatsApp).
-- Usa order_number sequencial para referência humana ("Seu pedido é o #042").

CREATE TYPE delivery_type_enum AS ENUM ('entrega-canoas', 'mercado-envios', 'retirada', 'outro');
CREATE TYPE payment_status_enum AS ENUM ('pago', 'reserva-30', 'pendente');
CREATE TYPE order_status_enum AS ENUM ('novo', 'em-producao', 'pronto', 'entregue', 'cancelado');

CREATE SEQUENCE IF NOT EXISTS physical_orders_number_seq START 1;

CREATE TABLE IF NOT EXISTS physical_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number integer NOT NULL UNIQUE DEFAULT nextval('physical_orders_number_seq'),

  -- Cliente
  customer_name text NOT NULL,
  customer_phone text,
  customer_city text,

  -- Produto (FK opcional pra produtos avulsos)
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL, -- snapshot do nome no momento do pedido
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),

  -- Valores em centavos
  cost_cents integer NOT NULL DEFAULT 0, -- custo unitário
  price_cents integer NOT NULL DEFAULT 0, -- venda unitária

  -- Prazos
  production_days integer,
  order_date date NOT NULL DEFAULT current_date,
  delivery_date date,

  -- Status
  delivery_type delivery_type_enum NOT NULL DEFAULT 'outro',
  payment_status payment_status_enum NOT NULL DEFAULT 'pendente',
  order_status order_status_enum NOT NULL DEFAULT 'novo',

  -- Outros
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes pra filtros comuns
CREATE INDEX IF NOT EXISTS idx_physical_orders_order_number ON physical_orders (order_number DESC);
CREATE INDEX IF NOT EXISTS idx_physical_orders_product_id ON physical_orders (product_id);
CREATE INDEX IF NOT EXISTS idx_physical_orders_payment_status ON physical_orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_physical_orders_order_status ON physical_orders (order_status);
CREATE INDEX IF NOT EXISTS idx_physical_orders_delivery_date ON physical_orders (delivery_date);
CREATE INDEX IF NOT EXISTS idx_physical_orders_created_at ON physical_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_physical_orders_customer_name ON physical_orders (lower(customer_name));
