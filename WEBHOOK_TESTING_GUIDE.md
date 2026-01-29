# Guia de Teste do Webhook do Stripe

## Problema Identificado

As mensagens no banco de dados estão ficando com status "pending" porque o webhook do Stripe não está sendo acionado ou processado corretamente após o pagamento.

## Causas Possíveis

1. **Webhook não configurado** - O webhook não foi registrado no Stripe Dashboard
2. **Webhook secret incorreto** - A variável `STRIPE_WEBHOOK_SECRET` está incorreta ou ausente
3. **Webhook não está sendo chamado** - O Stripe não consegue alcançar a URL do webhook
4. **Erro no processamento** - O webhook está sendo chamado mas há erro no código

## Solução Implementada

### 1. Página de Sucesso Criada

Criamos `/success` que:
- Recebe o `session_id` do Stripe
- Busca os dados da sessão via API
- Redireciona para `/delivery/[messageId]`

### 2. API de Sessão Criada

Criamos `/api/checkout/session` que:
- Recebe o `session_id` como query param
- Busca a sessão no Stripe
- Retorna o `messageId` do metadata

### 3. Metadata Expandido

Atualizamos o `StripeService.createCheckoutSession` para incluir:
- `messageId` (já existia)
- `contactName` (novo)
- `contactEmail` (novo)
- `contactPhone` (novo)

Isso permite que o webhook envie o email com as informações corretas.

## Como Testar Localmente

### Opção 1: Usar Stripe CLI (Recomendado)

1. **Instalar Stripe CLI**
   ```bash
   # Windows (via Scoop)
   scoop install stripe
   
   # macOS (via Homebrew)
   brew install stripe/stripe-cli/stripe
   
   # Ou baixar de: https://stripe.com/docs/stripe-cli
   ```

2. **Fazer login no Stripe**
   ```bash
   stripe login
   ```

3. **Iniciar o webhook forwarding**
   ```bash
   stripe listen --forward-to localhost:3000/api/checkout/webhook
   ```

4. **Copiar o webhook secret**
   O comando acima vai exibir algo como:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
   ```
   
   Copie esse secret e adicione no `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **Testar um pagamento**
   - Acesse o editor: `http://localhost:3000/editor/mensagem`
   - Preencha todos os campos
   - Clique em "Prosseguir para Pagamento"
   - Use o cartão de teste: `4242 4242 4242 4242`
   - Data: qualquer data futura
   - CVC: qualquer 3 dígitos
   - Complete o pagamento

6. **Verificar os logs**
   No terminal onde o `stripe listen` está rodando, você verá:
   ```
   2024-03-15 10:30:45   --> checkout.session.completed [evt_xxxxx]
   2024-03-15 10:30:45  <--  [200] POST http://localhost:3000/api/checkout/webhook
   ```

### Opção 2: Simular Webhook Manualmente

1. **Criar um evento de teste**
   ```bash
   stripe trigger checkout.session.completed
   ```

2. **Ou usar a API diretamente**
   ```bash
   curl -X POST http://localhost:3000/api/checkout/webhook \
     -H "Content-Type: application/json" \
     -H "stripe-signature: whsec_test_secret" \
     -d @webhook-test-payload.json
   ```

### Opção 3: Usar Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/checkout/webhook`
4. Eventos: Selecione `checkout.session.completed`
5. Copie o "Signing secret" e adicione no `.env.local`

## Verificar se o Webhook Está Funcionando

### 1. Verificar Logs do Servidor

No terminal onde o Next.js está rodando, você deve ver:

```
Successfully processed payment for message abc-123-def
Successfully sent QR code email for message abc-123-def
```

### 2. Verificar no Banco de Dados

```sql
SELECT id, recipient_name, status, qr_code_url, slug, created_at 
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;
```

Após um pagamento bem-sucedido, você deve ver:
- `status` = `'paid'` (não mais 'pending')
- `qr_code_url` preenchido
- `slug` preenchido

### 3. Verificar no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique no seu webhook endpoint
3. Veja a aba "Recent deliveries"
4. Deve mostrar status 200 (sucesso)

## Problemas Comuns

### Webhook retorna 400 (Bad Request)

**Causa**: Signature inválida ou ausente

**Solução**: 
- Verifique se `STRIPE_WEBHOOK_SECRET` está correto no `.env.local`
- Use o secret fornecido pelo `stripe listen` ou pelo Dashboard

### Webhook retorna 404 (Not Found)

**Causa**: Mensagem não encontrada no banco

**Solução**:
- Verifique se a mensagem foi criada antes do pagamento
- Verifique se o `messageId` está no metadata da sessão

### Webhook retorna 500 (Internal Error)

**Causa**: Erro no código do webhook

**Solução**:
- Verifique os logs do servidor
- Verifique se todas as variáveis de ambiente estão configuradas:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_BASE_URL`

### Email não é enviado

**Causa**: Serviço Resend não configurado ou erro no envio

**Solução**:
- Verifique se `RESEND_API_KEY` está configurado
- Verifique se o email remetente está verificado no Resend
- O webhook continua funcionando mesmo se o email falhar (graceful degradation)

## Fluxo Completo Esperado

1. **Usuário preenche o wizard** → Dados salvos no localStorage
2. **Usuário clica em "Prosseguir para Pagamento"** → Mensagem criada no DB (status: pending)
3. **Sistema cria checkout session** → Stripe retorna URL de pagamento
4. **Usuário é redirecionado para Stripe** → Preenche dados do cartão
5. **Usuário completa o pagamento** → Stripe processa pagamento
6. **Stripe envia webhook** → POST para `/api/checkout/webhook`
7. **Webhook processa evento** → 
   - Atualiza status para 'paid'
   - Gera QR Code
   - Salva slug
   - Envia email com QR Code
8. **Stripe redireciona usuário** → Para `/success?session_id=xxx`
9. **Página de sucesso busca messageId** → Via `/api/checkout/session`
10. **Usuário é redirecionado** → Para `/delivery/[messageId]`
11. **Página de delivery exibe** → Preview completo + QR Code

## Comandos Úteis

### Verificar mensagens pendentes
```sql
SELECT COUNT(*) FROM messages WHERE status = 'pending';
```

### Atualizar manualmente para teste
```sql
UPDATE messages 
SET status = 'paid', 
    qr_code_url = '/qr-codes/test.png',
    slug = 'test-slug-123'
WHERE id = 'seu-message-id';
```

### Ver últimas mensagens criadas
```sql
SELECT id, recipient_name, status, created_at 
FROM messages 
ORDER BY created_at DESC 
LIMIT 10;
```

## Próximos Passos

1. **Configure o Stripe CLI** para testar localmente
2. **Faça um pagamento de teste** completo
3. **Verifique os logs** do servidor e do Stripe CLI
4. **Confirme no banco** que o status mudou para 'paid'
5. **Teste o email** verificando se chegou na caixa de entrada
6. **Acesse a página de delivery** e confirme que todos os dados aparecem

## Recursos Adicionais

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Stripe Webhooks](https://stripe.com/docs/webhooks/test)
- [Stripe Test Cards](https://stripe.com/docs/testing)
