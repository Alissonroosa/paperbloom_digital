# ⚡ Início Rápido - PIX em 5 Minutos

## 🎯 Objetivo

Testar o PIX em desenvolvimento em menos de 5 minutos.

## 📋 Pré-requisitos

- ✅ Node.js instalado
- ✅ Stripe CLI instalado
- ✅ Aplicação rodando

## 🚀 Passo a Passo

### 1️⃣ Abrir 3 terminais

```
Terminal 1: Aplicação Next.js
Terminal 2: Webhook Stripe
Terminal 3: Testes
```

### 2️⃣ Terminal 1 - Iniciar aplicação

```powershell
npm run dev
```

Aguarde até ver:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

### 3️⃣ Terminal 2 - Iniciar webhook

```powershell
.\iniciar-webhook.ps1
```

Aguarde até ver:
```
✓ Webhook listening on http://localhost:3000/api/checkout/webhook
```

### 4️⃣ Terminal 3 - Executar teste

```powershell
node testar-pix.js
```

Você verá:
```
🧪 Testando fluxo de pagamento PIX...

1️⃣ Criando mensagem de teste...
✅ Mensagem criada: abc-123-def

2️⃣ Criando checkout session...
✅ Checkout session criado: cs_test_xxxxx
   URL: https://checkout.stripe.com/c/pay/cs_test_xxxxx

3️⃣ Próximos passos:
   a) Abra a URL do checkout no navegador
   b) Escolha "PIX" como método de pagamento
   c) Você verá um QR code PIX
   d) Para simular pagamento em DEV, use:
      stripe trigger checkout.session.async_payment_succeeded
```

### 5️⃣ Abrir URL do checkout

Copie a URL e abra no navegador:
```
https://checkout.stripe.com/c/pay/cs_test_xxxxx
```

### 6️⃣ Escolher PIX

Na tela do Stripe Checkout:
1. Selecione "PIX"
2. Veja o QR code gerado
3. Veja o código "Pix Copia e Cola"

### 7️⃣ Simular pagamento (Terminal 3)

```powershell
stripe trigger checkout.session.async_payment_succeeded
```

### 8️⃣ Verificar logs (Terminal 2)

Procure por:
```
[Webhook PIX] Starting email send process for message: abc-123-def
[Webhook PIX] ✅ Successfully sent QR code email
PIX payment succeeded for session cs_test_xxxxx
```

## ✅ Sucesso!

Se você viu os logs acima, o PIX está funcionando perfeitamente!

## 🎯 O que aconteceu?

1. ✅ Mensagem criada no banco de dados
2. ✅ Checkout session criado com suporte a PIX
3. ✅ QR code PIX gerado pelo Stripe
4. ✅ Pagamento simulado com sucesso
5. ✅ Webhook recebeu evento `async_payment_succeeded`
6. ✅ Status da mensagem atualizado para 'paid'
7. ✅ QR code da mensagem gerado
8. ✅ Email enviado com link da mensagem

## 🔍 Verificar resultado

### Opção 1: Verificar no banco de dados

```javascript
// No console do navegador ou Node.js
const response = await fetch('/api/messages/id/abc-123-def');
const message = await response.json();
console.log('Status:', message.status); // 'paid'
console.log('QR Code:', message.qrCodeUrl); // '/qrcodes/...'
console.log('Slug:', message.slug); // '/mensagem/...'
```

### Opção 2: Verificar no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/test/events
2. Procure por `checkout.session.async_payment_succeeded`
3. Veja os detalhes do evento

### Opção 3: Verificar email

Se você configurou um email real no teste, verifique sua caixa de entrada.

## 🎨 Testar interface visual

### 1. Criar mensagem real

1. Acesse: http://localhost:3000/editor/mensagem
2. Preencha todos os campos
3. Clique em "Finalizar e Pagar"

### 2. Ver checkout com PIX

Você verá:
```
┌─────────────────────────────────────┐
│  Escolha o método de pagamento:    │
│                                     │
│  ○ Cartão de crédito               │
│  ○ PIX                             │ ← Novo!
│                                     │
└─────────────────────────────────────┘
```

### 3. Selecionar PIX

Você verá:
```
┌─────────────────────────────────────┐
│  ● PIX                              │
│                                     │
│  [QR CODE]                          │
│                                     │
│  Ou copie o código:                │
│  00020126580014br.gov...            │
│  [Copiar código]                    │
│                                     │
│  Expira em: 59:45                  │
│  Aguardando pagamento...           │
└─────────────────────────────────────┘
```

## 🧪 Testar cenários diferentes

### Pagamento bem-sucedido
```powershell
stripe trigger checkout.session.async_payment_succeeded
```

### Pagamento falhado
```powershell
stripe trigger checkout.session.async_payment_failed
```

### Ver eventos em tempo real
```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook --print-json
```

## 📊 Comandos úteis

### Ver últimos eventos
```powershell
stripe events list --limit 5
```

### Ver checkout sessions
```powershell
stripe checkout sessions list --limit 5
```

### Ver logs detalhados
```powershell
# No Terminal 2 (webhook)
# Procure por [Webhook PIX]
```

## 🐛 Problemas?

### PIX não aparece no checkout
- Verifique se o código foi atualizado
- Reinicie a aplicação (Terminal 1)
- Limpe o cache do navegador

### Webhook não recebe eventos
- Verifique se o webhook está rodando (Terminal 2)
- Confirme a URL: http://localhost:3000/api/checkout/webhook
- Reinicie o webhook

### Erro ao simular pagamento
- Verifique se o Stripe CLI está instalado
- Execute: `stripe --version`
- Faça login: `stripe login`

## ✨ Próximos passos

Agora que testou em desenvolvimento:

1. ✅ Leia [ATIVAR_PIX_CHECKLIST.md](ATIVAR_PIX_CHECKLIST.md)
2. ✅ Ative PIX no Stripe Dashboard
3. ✅ Configure conta bancária
4. ✅ Teste em produção
5. ✅ Lance para os usuários!

## 🎉 Parabéns!

Você testou o PIX com sucesso em desenvolvimento!

---

**Tempo total**: ~5 minutos
**Dificuldade**: Fácil
**Resultado**: PIX funcionando perfeitamente! 🚀
