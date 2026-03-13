# Solução: Email não chega após pagamento

## Problema Identificado

Após realizar o pagamento no checkout do Stripe, você é redirecionado para a página de delivery, mas o email com o QR Code não chega.

## Diagnóstico

✅ **Configuração do Resend**: OK
- API Key configurada corretamente
- Email de envio verificado
- Teste de envio funcionando

✅ **Código do Webhook**: OK
- Webhook implementado corretamente
- Lógica de envio de email presente
- Tratamento de erros adequado

❌ **Problema Real**: O webhook não está sendo chamado pelo Stripe

## Causa Raiz

O webhook do Stripe precisa estar **ativo e recebendo eventos** para que o email seja enviado. Existem duas formas de fazer isso funcionar:

### 1. Desenvolvimento Local (Stripe CLI)
O Stripe CLI precisa estar rodando para encaminhar webhooks para seu localhost.

### 2. Produção (Webhook no Dashboard)
O webhook precisa estar configurado no Stripe Dashboard apontando para sua URL de produção.

## Solução

### Opção 1: Usar Stripe CLI (Desenvolvimento)

1. **Certifique-se de que o Stripe CLI está instalado**:
   ```bash
   stripe --version
   ```

2. **Inicie o servidor Next.js**:
   ```bash
   npm run dev
   ```

3. **Em outro terminal, inicie o webhook listener**:
   ```bash
   stripe listen --forward-to localhost:3000/api/checkout/webhook
   ```

4. **Faça um pagamento de teste**

5. **Verifique os logs**:
   - Terminal do Next.js: deve mostrar logs do webhook
   - Terminal do Stripe CLI: deve mostrar eventos recebidos

### Opção 2: Enviar Emails Manualmente (Temporário)

Se você já tem mensagens pagas que não receberam email, use este script:

```bash
node enviar-emails-pendentes.js
```

Este script irá:
- Buscar todas as mensagens pagas com email de contato
- Enviar o email com QR Code para cada uma
- Mostrar um resumo dos emails enviados

### Opção 3: Configurar Webhook no Dashboard (Produção)

Para produção, configure o webhook diretamente no Stripe:

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/checkout/webhook`
4. Eventos: Selecione `checkout.session.completed`
5. Copie o "Signing secret" e adicione ao `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Scripts Úteis

### 1. Testar Configuração do Resend
```bash
node testar-resend-config.js
```
Verifica se o Resend está configurado e envia um email de teste.

### 2. Debug do Webhook
```bash
node debug-webhook-email.js
```
Verifica mensagens pagas e testa o envio de email.

### 3. Enviar Emails Pendentes
```bash
node enviar-emails-pendentes.js
```
Envia emails para todas as mensagens pagas que não receberam.

### 4. Verificar Logs do Webhook
```bash
node verificar-webhook-logs.js
```
Mostra informações sobre a configuração do webhook.

## Checklist de Verificação

- [ ] Servidor Next.js está rodando (`npm run dev`)
- [ ] Stripe CLI está rodando (`stripe listen --forward-to localhost:3000/api/checkout/webhook`)
- [ ] Variáveis de ambiente estão configuradas:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `RESEND_API_KEY`
  - [ ] `RESEND_FROM_EMAIL`
  - [ ] `RESEND_FROM_NAME`
- [ ] Domínio do email está verificado no Resend
- [ ] Fazer um pagamento de teste
- [ ] Verificar logs do servidor e do Stripe CLI

## Fluxo Correto

1. **Usuário cria mensagem** → Status: `pending`
2. **Usuário clica em "Pagar"** → Redireciona para Stripe Checkout
3. **Usuário completa pagamento** → Stripe dispara webhook
4. **Webhook recebe evento** → `checkout.session.completed`
5. **Webhook processa**:
   - Atualiza status para `paid`
   - Gera slug
   - Gera QR Code
   - **Envia email com QR Code**
6. **Usuário é redirecionado** → Página de sucesso
7. **Email chega** → Com QR Code e link

## Logs Importantes

### Servidor Next.js
```
[EmailService] Initialized with config: { fromEmail: '...', fromName: '...' }
[Webhook] Email delivery check: { sessionEmail: '...', finalEmail: '...' }
[EmailService] Attempting to send QR code email: { recipientEmail: '...' }
[EmailService] Email sent successfully: { messageId: '...' }
```

### Stripe CLI
```
2024-12-13 10:30:45   --> checkout.session.completed [evt_...]
2024-12-13 10:30:45  <--  [200] POST http://localhost:3000/api/checkout/webhook
```

## Próximos Passos

1. **Agora**: Execute `node enviar-emails-pendentes.js` para enviar emails das mensagens já pagas
2. **Para novos pagamentos**: Certifique-se de que o Stripe CLI está rodando
3. **Para produção**: Configure o webhook no Stripe Dashboard

## Suporte

Se o problema persistir, verifique:
- Logs do servidor Next.js
- Logs do Stripe CLI
- Dashboard do Resend (https://resend.com/emails)
- Dashboard do Stripe (https://dashboard.stripe.com/test/events)
