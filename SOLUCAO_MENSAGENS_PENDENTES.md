# Solução para Mensagens Pendentes

## Problema
Todas as mensagens no banco de dados estão com status "pending" porque o webhook do Stripe não está processando os pagamentos.

## Solução Rápida (Para Mensagens Existentes)

### Passo 1: Acessar a Ferramenta de Teste

Abra no navegador:
```
http://localhost:3000/test/update-message-status
```

### Passo 2: Pegar o ID da Mensagem

Execute no banco de dados:
```sql
SELECT id, recipient_name, sender_name, status, created_at 
FROM messages 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Passo 3: Atualizar a Mensagem

1. Copie o `id` (UUID) da mensagem
2. Cole na ferramenta web
3. Clique em "Atualizar para 'Paid' e Gerar QR Code"
4. Aguarde o processamento
5. Clique em "Ver Página de Entrega"

✅ **Pronto!** A mensagem agora tem:
- Status: `paid`
- QR Code gerado
- Slug criado
- Página de entrega funcionando

## Solução Permanente (Para Novos Pagamentos)

### Configurar Webhook do Stripe

#### Opção A: Desenvolvimento Local (Stripe CLI)

1. **Instalar Stripe CLI**
   ```bash
   # Windows (Scoop)
   scoop install stripe
   
   # macOS (Homebrew)
   brew install stripe/stripe-cli/stripe
   ```

2. **Fazer login**
   ```bash
   stripe login
   ```

3. **Iniciar webhook forwarding**
   ```bash
   stripe listen --forward-to localhost:3000/api/checkout/webhook
   ```

4. **Copiar o webhook secret**
   O comando acima vai mostrar algo como:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
   ```

5. **Adicionar no .env.local**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

6. **Reiniciar o servidor Next.js**
   ```bash
   npm run dev
   ```

7. **Testar um pagamento**
   - Preencha o wizard completo
   - Use cartão de teste: `4242 4242 4242 4242`
   - Complete o pagamento
   - Verifique os logs do Stripe CLI
   - Confirme que o status mudou para `paid` no banco

#### Opção B: Produção (Stripe Dashboard)

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/checkout/webhook`
4. Eventos: Selecione `checkout.session.completed`
5. Copie o "Signing secret"
6. Adicione no `.env.local` ou variáveis de ambiente do servidor

## Tabela de Clientes (Nova Funcionalidade)

### Por que criar?

- ✅ Rastrear histórico de compras por cliente
- ✅ Evitar duplicatas de clientes
- ✅ Registrar todos os pedidos
- ✅ Auditar envios de email
- ✅ Gerar relatórios de vendas
- ✅ Facilitar remarketing

### Como aplicar

1. **Executar a migration**
   ```bash
   psql -U seu_usuario -d seu_banco -f migrations/004_create_customers_table.sql
   ```

2. **Verificar se funcionou**
   ```sql
   \dt
   -- Deve mostrar: customers, orders, email_logs
   ```

3. **Ver estrutura**
   ```sql
   \d customers
   \d orders
   \d email_logs
   ```

### Tabelas Criadas

#### 1. `customers`
- Armazena dados de contato dos clientes
- Email único (não permite duplicatas)
- Relacionamento com orders e messages

#### 2. `orders`
- Rastreia todas as compras
- Status: pending, paid, failed, refunded
- Valor em centavos
- IDs do Stripe

#### 3. `email_logs`
- Registra todos os emails enviados
- Status: pending, sent, failed, bounced
- Mensagens de erro
- ID do provedor (Resend)

### Queries Úteis

**Ver últimos clientes:**
```sql
SELECT id, name, email, created_at 
FROM customers 
ORDER BY created_at DESC 
LIMIT 10;
```

**Ver pedidos pagos:**
```sql
SELECT 
  o.id,
  c.name as customer_name,
  m.recipient_name,
  o.amount_cents / 100.0 as amount_brl,
  o.paid_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN messages m ON o.message_id = m.id
WHERE o.status = 'paid'
ORDER BY o.paid_at DESC;
```

**Estatísticas de vendas:**
```sql
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
  SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) / 100.0 as total_revenue_brl
FROM orders;
```

## Checklist de Verificação

### Mensagens Pendentes Corrigidas
- [ ] Acessei `/test/update-message-status`
- [ ] Peguei o ID da mensagem no banco
- [ ] Atualizei a mensagem
- [ ] Verifiquei que o status mudou para `paid`
- [ ] Acessei a página de entrega
- [ ] Vi o preview completo da mensagem
- [ ] Vi o QR Code gerado

### Webhook Configurado
- [ ] Instalei Stripe CLI
- [ ] Executei `stripe listen`
- [ ] Copiei o webhook secret
- [ ] Adicionei no `.env.local`
- [ ] Reiniciei o servidor
- [ ] Testei um pagamento completo
- [ ] Vi o webhook sendo chamado nos logs
- [ ] Confirmei que o status mudou automaticamente

### Tabelas de Clientes Criadas
- [ ] Executei a migration
- [ ] Verifiquei que as 3 tabelas foram criadas
- [ ] Testei as queries de exemplo
- [ ] Vi a coluna `customer_id` na tabela `messages`

## Arquivos Criados

### Migrations
- `migrations/004_create_customers_table.sql` - Cria tabelas de customers, orders, email_logs

### Types
- `src/types/customer.ts` - Tipos TypeScript para Customer, Order, EmailLog

### Services
- `src/services/CustomerService.ts` - CRUD de clientes
- `src/services/OrderService.ts` - Gestão de pedidos
- `src/services/EmailLogService.ts` - Registro de emails

### Ferramentas de Teste
- `src/app/(marketing)/test/update-message-status/page.tsx` - Interface web
- `src/app/api/test/update-message-status/route.ts` - API de teste

### Documentação
- `CUSTOMER_TABLES_SETUP.md` - Guia completo das novas tabelas
- `WEBHOOK_TESTING_GUIDE.md` - Guia de teste do webhook
- `DELIVERY_PAGE_IMPLEMENTATION_SUMMARY.md` - Resumo da implementação

## Próximos Passos

1. ✅ **Corrigir mensagens pendentes** - Use a ferramenta de teste
2. ✅ **Aplicar migration** - Criar tabelas de clientes
3. ⏳ **Configurar webhook** - Para novos pagamentos funcionarem
4. ⏳ **Atualizar webhook** - Para criar customer e order automaticamente
5. ⏳ **Atualizar EmailService** - Para registrar logs de email
6. ⏳ **Criar dashboard admin** - Para visualizar clientes e vendas

## Suporte

Se tiver dúvidas:
1. Consulte `WEBHOOK_TESTING_GUIDE.md` para problemas com webhook
2. Consulte `CUSTOMER_TABLES_SETUP.md` para problemas com as tabelas
3. Verifique os logs do servidor Next.js
4. Verifique os logs do Stripe CLI (se estiver usando)
5. Verifique os logs do PostgreSQL

## Comandos Rápidos

```bash
# Ver mensagens pendentes
psql -d seu_banco -c "SELECT COUNT(*) FROM messages WHERE status = 'pending';"

# Aplicar migration
psql -d seu_banco -f migrations/004_create_customers_table.sql

# Iniciar webhook local
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Ver logs do servidor
npm run dev

# Testar email
curl http://localhost:3000/api/test/send-qrcode-email
```
