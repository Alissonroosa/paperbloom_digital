# Customer Tables Setup Guide

## Visão Geral

Este guia explica como configurar as novas tabelas de clientes, pedidos e logs de email no banco de dados.

## Novas Tabelas

### 1. `customers` - Tabela de Clientes
Armazena informações de contato dos clientes.

**Campos:**
- `id` (UUID) - Identificador único
- `name` (VARCHAR) - Nome do cliente
- `email` (VARCHAR) - Email (único)
- `phone` (VARCHAR) - Telefone (opcional)
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### 2. `orders` - Tabela de Pedidos
Rastreia todas as transações de compra.

**Campos:**
- `id` (UUID) - Identificador único
- `customer_id` (UUID) - Referência ao cliente
- `message_id` (UUID) - Referência à mensagem
- `stripe_session_id` (VARCHAR) - ID da sessão do Stripe
- `stripe_payment_intent_id` (VARCHAR) - ID do pagamento do Stripe
- `amount_cents` (INTEGER) - Valor em centavos
- `currency` (VARCHAR) - Moeda (padrão: 'brl')
- `status` (VARCHAR) - Status: pending, paid, failed, refunded
- `paid_at` - Data do pagamento
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### 3. `email_logs` - Tabela de Logs de Email
Registra todas as tentativas de envio de email.

**Campos:**
- `id` (UUID) - Identificador único
- `customer_id` (UUID) - Referência ao cliente (opcional)
- `message_id` (UUID) - Referência à mensagem (opcional)
- `order_id` (UUID) - Referência ao pedido (opcional)
- `email_type` (VARCHAR) - Tipo: qrcode, confirmation, reminder, etc
- `recipient_email` (VARCHAR) - Email do destinatário
- `subject` (VARCHAR) - Assunto do email
- `status` (VARCHAR) - Status: pending, sent, failed, bounced
- `provider_message_id` (VARCHAR) - ID da mensagem do provedor (Resend)
- `error_message` (TEXT) - Mensagem de erro (se houver)
- `sent_at` - Data de envio
- `created_at` - Data de criação

## Como Aplicar a Migration

### Opção 1: Usando psql (Recomendado)

```bash
# Conectar ao banco de dados
psql -U seu_usuario -d seu_banco

# Executar a migration
\i migrations/004_create_customers_table.sql

# Verificar se as tabelas foram criadas
\dt

# Ver estrutura das tabelas
\d customers
\d orders
\d email_logs
```

### Opção 2: Usando ferramenta GUI (pgAdmin, DBeaver, etc)

1. Abra o arquivo `migrations/004_create_customers_table.sql`
2. Copie todo o conteúdo
3. Cole na janela de query da sua ferramenta
4. Execute

### Opção 3: Usando Node.js

```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const sql = fs.readFileSync('migrations/004_create_customers_table.sql', 'utf8');
  
  try {
    await pool.query(sql);
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
```

## Verificar Instalação

Execute estas queries para verificar se tudo foi criado corretamente:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('customers', 'orders', 'email_logs');

-- Verificar se customer_id foi adicionado à tabela messages
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND column_name = 'customer_id';

-- Contar registros (deve ser 0 inicialmente)
SELECT 
  (SELECT COUNT(*) FROM customers) as customers_count,
  (SELECT COUNT(*) FROM orders) as orders_count,
  (SELECT COUNT(*) FROM email_logs) as email_logs_count;
```

## Benefícios das Novas Tabelas

### 1. Rastreamento de Clientes
- Histórico completo de compras por cliente
- Email único para evitar duplicatas
- Facilita remarketing e comunicação

### 2. Gestão de Pedidos
- Rastreamento de status de pagamento
- Histórico de transações
- Integração com Stripe
- Suporte a reembolsos

### 3. Auditoria de Emails
- Log de todos os emails enviados
- Rastreamento de falhas
- Integração com provedor (Resend)
- Facilita debugging

## Queries Úteis

### Ver últimos clientes cadastrados
```sql
SELECT id, name, email, created_at 
FROM customers 
ORDER BY created_at DESC 
LIMIT 10;
```

### Ver pedidos pagos
```sql
SELECT 
  o.id,
  c.name as customer_name,
  c.email,
  m.recipient_name,
  o.amount_cents / 100.0 as amount_brl,
  o.paid_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN messages m ON o.message_id = m.id
WHERE o.status = 'paid'
ORDER BY o.paid_at DESC;
```

### Ver emails enviados com sucesso
```sql
SELECT 
  el.email_type,
  el.recipient_email,
  el.subject,
  el.sent_at,
  c.name as customer_name
FROM email_logs el
LEFT JOIN customers c ON el.customer_id = c.id
WHERE el.status = 'sent'
ORDER BY el.sent_at DESC
LIMIT 20;
```

### Ver emails que falharam
```sql
SELECT 
  el.email_type,
  el.recipient_email,
  el.error_message,
  el.created_at
FROM email_logs el
WHERE el.status = 'failed'
ORDER BY el.created_at DESC;
```

### Estatísticas de vendas
```sql
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
  SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) / 100.0 as total_revenue_brl
FROM orders;
```

### Clientes com mais compras
```sql
SELECT 
  c.name,
  c.email,
  COUNT(o.id) as order_count,
  SUM(o.amount_cents) / 100.0 as total_spent_brl
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.id, c.name, c.email
ORDER BY order_count DESC
LIMIT 10;
```

## Integração com o Sistema

As novas tabelas já estão integradas com:

- ✅ **CustomerService** - CRUD de clientes
- ✅ **OrderService** - Gestão de pedidos
- ✅ **EmailLogService** - Registro de emails
- ⏳ **Webhook do Stripe** - Precisa ser atualizado para usar as novas tabelas
- ⏳ **EmailService** - Precisa registrar logs ao enviar emails

## Próximos Passos

1. ✅ Aplicar a migration no banco de dados
2. ⏳ Atualizar o webhook do Stripe para criar customer e order
3. ⏳ Atualizar o EmailService para registrar logs
4. ⏳ Criar dashboard de admin para visualizar clientes e pedidos
5. ⏳ Implementar relatórios de vendas

## Rollback (Se Necessário)

Se precisar reverter as mudanças:

```sql
-- ATENÇÃO: Isso vai deletar todas as tabelas e dados!
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Remover coluna customer_id da tabela messages
ALTER TABLE messages DROP COLUMN IF EXISTS customer_id;
```

## Suporte

Se encontrar problemas:
1. Verifique os logs do PostgreSQL
2. Confirme que tem permissões adequadas
3. Verifique se não há conflitos de nomes de tabelas
4. Consulte a documentação do PostgreSQL
