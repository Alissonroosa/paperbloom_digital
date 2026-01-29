# 🚀 RESOLVER PROBLEMA DO QR CODE AGORA

## 🎯 Problema
- QR Code não aparece na página de delivery
- Botões não ficam clicáveis
- Status fica em "pending" mesmo após pagamento

## ✅ Solução Imediata (2 minutos)

### Passo 1: Verificar se Next.js está rodando

```powershell
# Se não estiver rodando, execute:
npm run dev
```

### Passo 2: Processar mensagens pendentes

```powershell
# Listar e processar a mensagem mais recente:
node processar-mensagem-pendente.js

# OU processar uma mensagem específica:
node processar-mensagem-pendente.js SEU_MESSAGE_ID_AQUI
```

Isso vai:
- ✅ Mudar status para "paid"
- ✅ Gerar o QR Code
- ✅ Criar o slug
- ✅ Enviar o email
- ✅ Habilitar os botões

### Passo 3: Acessar a página de delivery

O script vai mostrar o link, algo como:
```
http://localhost:3000/delivery/SEU_MESSAGE_ID
```

Abra esse link no navegador e pronto! 🎉

---

## 🔧 Para Pagamentos Futuros Funcionarem Automaticamente

Você precisa do Stripe CLI rodando. Siga este guia:

### Instalar Stripe CLI

**Opção A - Scoop (Recomendado):**
```powershell
# Instalar Scoop (se não tiver)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Instalar Stripe CLI
scoop install stripe
```

**Opção B - Chocolatey:**
```powershell
choco install stripe-cli
```

**Opção C - Download Manual:**
https://github.com/stripe/stripe-cli/releases/latest

### Configurar e Iniciar

```powershell
# 1. Fazer login
stripe login

# 2. Iniciar webhook listener (Terminal 1)
stripe listen --forward-to localhost:3000/api/checkout/webhook

# 3. Copiar o webhook secret que aparecer (whsec_...)
# 4. Colar no .env.local como STRIPE_WEBHOOK_SECRET

# 5. Reiniciar Next.js (Terminal 2)
npm run dev
```

---

## 📝 Scripts Úteis

```powershell
# Verificar configuração
.\check-stripe.ps1

# Processar mensagem pendente
node processar-mensagem-pendente.js

# Testar fluxo completo
node testar-fluxo-completo-com-email.js

# Simular webhook
node simular-webhook.js
```

---

## 🎯 Resumo

**AGORA (para resolver mensagens existentes):**
```powershell
npm run dev
node processar-mensagem-pendente.js
```

**DEPOIS (para pagamentos futuros):**
```powershell
# Terminal 1
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Terminal 2
npm run dev
```

---

## 🆘 Problemas?

1. **"Cannot find module"**: Execute `npm install`
2. **"Connection refused"**: Certifique-se que Next.js está rodando
3. **"Message not found"**: Verifique o ID da mensagem no banco de dados
4. **QR Code ainda não aparece**: Limpe o cache do navegador (Ctrl+Shift+R)

---

Pronto! Execute os comandos acima e seu problema estará resolvido! 🚀
