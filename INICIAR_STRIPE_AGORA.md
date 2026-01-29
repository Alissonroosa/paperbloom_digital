# 🚀 Iniciar Stripe CLI - Guia Rápido

## ✅ Stripe CLI instalado com sucesso!

Agora siga estes passos:

---

## 📋 Passo 1: Fazer Login

Execute no PowerShell:

```powershell
.\stripe.exe login
```

Você verá algo como:
```
Your pairing code is: whooa-bonus-super-avid
Press Enter to open the browser...
```

**Pressione Enter** e autorize no navegador que abrir.

---

## 🚀 Passo 2: Iniciar o Webhook Listener

Após fazer login, execute:

```powershell
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
```

Você verá algo como:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANTE:** Copie esse valor `whsec_xxxxxxxxxxxxxxxxxxxxx`

---

## 🔧 Passo 3: Atualizar .env.local

Abra o arquivo `.env.local` e atualize:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

(Cole o valor que você copiou)

---

## 🔄 Passo 4: Reiniciar Next.js

No terminal onde o Next.js está rodando:
1. Pressione `Ctrl+C` para parar
2. Execute: `npm run dev`

---

## ✅ Passo 5: Testar!

Agora você tem 2 terminais rodando:

**Terminal 1 - Stripe Webhook:**
```powershell
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
```

**Terminal 2 - Next.js:**
```powershell
npm run dev
```

### Testar o fluxo:

1. Acesse: http://localhost:3000/editor/mensagem
2. Crie uma mensagem
3. Faça o pagamento (use cartão de teste: 4242 4242 4242 4242)
4. Veja os logs no terminal do Stripe
5. Acesse a página de delivery
6. Veja o QR Code! 🎉

---

## 📝 Comandos Úteis

```powershell
# Ver versão
.\stripe.exe --version

# Fazer login
.\stripe.exe login

# Iniciar webhook listener
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook

# Ver eventos
.\stripe.exe events list

# Simular um evento
.\stripe.exe trigger checkout.session.completed
```

---

## 🎯 Resumo Rápido

```powershell
# 1. Login (uma vez só)
.\stripe.exe login

# 2. Iniciar webhook (sempre que for desenvolver)
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook

# 3. Copiar o webhook secret e colar no .env.local

# 4. Reiniciar Next.js

# 5. Testar!
```

---

## 🆘 Problemas?

### "Not authenticated"
```powershell
.\stripe.exe login
```

### "Connection refused"
- Certifique-se que Next.js está rodando em localhost:3000

### "Invalid webhook signature"
- Verifique se copiou o webhook secret correto
- Reinicie o Next.js após atualizar o .env.local

---

**Próximo passo:** Execute `.\stripe.exe login` e autorize no navegador! 🚀
