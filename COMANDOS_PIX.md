# Comandos Rápidos - PIX

## 🚀 Iniciar ambiente de desenvolvimento

```powershell
# Terminal 1: Iniciar aplicação Next.js
npm run dev

# Terminal 2: Iniciar webhook listener do Stripe
.\iniciar-webhook.ps1
```

## 🧪 Testar PIX em desenvolvimento

### Opção 1: Teste automatizado
```powershell
node testar-pix.js
```

Este script vai:
1. Criar uma mensagem de teste
2. Criar checkout session
3. Mostrar URL do checkout
4. Dar instruções de como simular pagamento

### Opção 2: Teste manual

1. **Criar mensagem** no editor
2. **Ir para checkout** e escolher PIX
3. **Simular pagamento bem-sucedido**:
```powershell
stripe trigger checkout.session.async_payment_succeeded
```

4. **Simular pagamento falhado**:
```powershell
stripe trigger checkout.session.async_payment_failed
```

## 📊 Monitorar eventos

### Ver eventos do Stripe em tempo real
```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Ver logs do webhook
```powershell
# No terminal onde o webhook está rodando
# Procure por logs com [Webhook PIX]
```

### Verificar eventos no Stripe Dashboard
```
https://dashboard.stripe.com/test/events
```

## 🔍 Verificar status da mensagem

```javascript
// No console do navegador ou Node.js
const response = await fetch('/api/messages/id/[MESSAGE_ID]');
const message = await response.json();
console.log('Status:', message.status);
console.log('QR Code:', message.qrCodeUrl);
console.log('Slug:', message.slug);
```

## 🎯 Eventos do Stripe para PIX

### checkout.session.completed
- **Quando**: QR code PIX gerado
- **Status**: `payment_status: 'unpaid'`
- **Ação**: Sistema aguarda pagamento

### checkout.session.async_payment_succeeded
- **Quando**: PIX pago pelo cliente
- **Status**: `payment_status: 'paid'`
- **Ação**: Sistema processa e envia email

### checkout.session.async_payment_failed
- **Quando**: PIX expirou ou falhou
- **Status**: `payment_status: 'unpaid'`
- **Ação**: Sistema loga falha

## 🔧 Comandos úteis do Stripe CLI

### Listar eventos recentes
```powershell
stripe events list --limit 10
```

### Ver detalhes de um evento
```powershell
stripe events retrieve evt_xxxxx
```

### Listar checkout sessions
```powershell
stripe checkout sessions list --limit 10
```

### Ver detalhes de uma session
```powershell
stripe checkout sessions retrieve cs_xxxxx
```

### Simular eventos específicos
```powershell
# Pagamento PIX bem-sucedido
stripe trigger checkout.session.async_payment_succeeded

# Pagamento PIX falhado
stripe trigger checkout.session.async_payment_failed

# Checkout completado (QR code gerado)
stripe trigger checkout.session.completed
```

## 🐛 Debug

### Verificar se PIX está habilitado
```powershell
stripe payment_methods list
```

### Verificar configuração do webhook
```powershell
stripe webhook_endpoints list
```

### Ver logs detalhados
```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook --print-json
```

## 📱 Testar em produção

1. **Ativar PIX no Dashboard**:
   - https://dashboard.stripe.com/settings/payment_methods
   - Ativar "PIX"

2. **Configurar webhook em produção**:
   - https://dashboard.stripe.com/webhooks
   - Adicionar endpoint: `https://seu-dominio.com/api/checkout/webhook`
   - Selecionar eventos:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`

3. **Fazer pagamento real**:
   - Criar mensagem no site
   - Escolher PIX no checkout
   - Escanear QR code com app do banco
   - Pagar
   - Verificar email

## 💡 Dicas

1. **PIX expira em 1 hora** - Configure isso no StripeService
2. **Eventos são assíncronos** - PIX não é instantâneo
3. **Teste com valores baixos** - R$ 0,50 é suficiente em produção
4. **Monitore logs** - Procure por `[Webhook PIX]`
5. **Verifique email** - Só é enviado após pagamento confirmado

## 🆘 Problemas comuns

### PIX não aparece no checkout
- Verifique se está ativado no Dashboard
- Confirme que `payment_method_types` inclui `'pix'`
- Verifique se a moeda é `'brl'`

### Webhook não recebe eventos
- Confirme que o listener está rodando
- Verifique a URL do webhook
- Teste com `stripe trigger`

### Email não é enviado
- Verifique logs com `[Webhook PIX]`
- Confirme que evento `async_payment_succeeded` foi recebido
- Verifique se email está no metadata da session

### Pagamento não é processado
- Verifique se `payment_status` é `'paid'`
- Confirme que messageId está no metadata
- Verifique logs do webhook
