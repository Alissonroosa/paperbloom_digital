# 🚀 Como Iniciar o Webhook do Stripe

## ⚠️ PROBLEMA IDENTIFICADO

Quando você faz um pagamento real no Stripe, o status da mensagem não muda de "pending" para "paid" porque **o webhook do Stripe não está rodando**.

## 📋 O que você precisa fazer:

### 1️⃣ Instalar o Stripe CLI (se ainda não tiver)

Escolha um método:

**Opção A - Scoop (Recomendado):**
```powershell
scoop install stripe
```

**Opção B - Chocolatey:**
```powershell
choco install stripe-cli
```

**Opção C - Download Manual:**
1. Baixe em: https://github.com/stripe/stripe-cli/releases/latest
2. Extraia o arquivo `stripe.exe`
3. Adicione ao PATH do Windows

### 2️⃣ Fazer Login no Stripe

```powershell
stripe login
```

Isso abrirá o navegador para você autorizar o acesso.

### 3️⃣ Iniciar o Webhook Listener

Execute o script que já está pronto:

```powershell
.\stripe-dev.ps1
```

**OU** execute manualmente:

```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### 4️⃣ Copiar o Webhook Secret

Quando o listener iniciar, você verá algo assim:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

**COPIE** esse valor `whsec_xxxxxxxxxxxxxxxxxxxxx`

### 5️⃣ Atualizar o .env.local

Abra o arquivo `.env.local` e adicione/atualize:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 6️⃣ Reiniciar o Servidor Next.js

No terminal onde o Next.js está rodando:
- Pressione `Ctrl+C` para parar
- Execute novamente: `npm run dev`

## ✅ Pronto!

Agora quando você fizer um pagamento:

1. ✅ O Stripe processa o pagamento
2. ✅ O webhook é acionado automaticamente
3. ✅ O status muda para "paid"
4. ✅ O QR Code é gerado
5. ✅ O email é enviado
6. ✅ Os botões ficam clicáveis

## 🔍 Como Testar

1. Mantenha o `stripe listen` rodando em um terminal
2. Mantenha o `npm run dev` rodando em outro terminal
3. Faça um pagamento de teste
4. Veja os logs no terminal do Stripe CLI
5. Verifique se o status mudou no banco de dados

## 📝 Comandos Úteis

**Ver eventos do Stripe:**
```powershell
stripe events list
```

**Simular um webhook manualmente:**
```powershell
stripe trigger checkout.session.completed
```

**Ver logs do webhook:**
```powershell
stripe listen --print-json
```

## 🆘 Problemas Comuns

### "Stripe CLI não encontrado"
- Instale usando um dos métodos acima
- Reinicie o PowerShell após instalar

### "Not authenticated"
- Execute: `stripe login`
- Autorize no navegador

### "Connection refused"
- Certifique-se que o Next.js está rodando em `localhost:3000`
- Verifique se não há firewall bloqueando

### "Invalid webhook signature"
- Copie o novo `whsec_...` do terminal
- Atualize no `.env.local`
- Reinicie o Next.js

## 🎯 Resumo Rápido

```powershell
# Terminal 1 - Stripe Webhook
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Terminal 2 - Next.js
npm run dev

# Agora faça um pagamento de teste!
```

---

**Importante:** O Stripe CLI precisa estar rodando SEMPRE que você quiser testar pagamentos localmente!
