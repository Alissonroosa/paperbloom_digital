# 🚀 COMEÇAR AGORA - 2 Comandos

## Status Atual

✅ Stripe CLI instalado e logado
✅ Servidor Next.js rodando
✅ Variáveis de ambiente configuradas
✅ Pastas criadas

**Você está PRONTO para testar!**

---

## Opção 1: Iniciar Tudo Automaticamente

### Comando Único:

```powershell
.\iniciar-desenvolvimento.ps1
```

**O que faz:**
1. Abre nova janela com Next.js
2. Inicia Stripe webhook listener

**Resultado:**
```
Ready! Your webhook signing secret is whsec_xxxxx
```

---

## Opção 2: Iniciar Manualmente (2 Terminais)

### Terminal 1: Stripe Webhook

```powershell
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
```

**Aguarde ver:**
```
Ready! Your webhook signing secret is whsec_xxxxx
```

### Terminal 2: Next.js (se não estiver rodando)

```powershell
npm run dev
```

**Aguarde ver:**
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

---

## 🧪 Testar Agora (1 minuto)

### 1. Abrir Navegador

```
http://localhost:3000/editor/12-cartas
```

### 2. Preencher Rápido

```
De: João
Para: Maria
Email: seu-email@exemplo.com
```

(Pode deixar as cartas vazias para teste rápido)

### 3. Finalizar

Clique em "Finalizar e Pagar"

### 4. Pagar com Cartão de Teste

```
Número: 4242 4242 4242 4242
Data: 12/34
CVC: 123
CEP: 12345
```

### 5. Verificar Logs

**Terminal do Stripe CLI deve mostrar:**
```
--> checkout.session.completed [evt_xxx]
<-- [200] POST http://localhost:3000/api/checkout/webhook
```

**Status 200 = Sucesso!** ✅

### 6. Ver Resultado

Você será redirecionado para:
```
http://localhost:3000/delivery/c/[id]
```

Deve ver:
- ✅ QR Code
- ✅ Link compartilhável
- ✅ Botões funcionando

---

## 🎯 Pronto!

O fluxo está funcionando! Agora você pode:

✅ Testar mensagens: `http://localhost:3000/editor/mensagem`
✅ Testar 12 cartas: `http://localhost:3000/editor/12-cartas`
✅ Ver webhooks processando em tempo real
✅ Verificar emails sendo enviados (logs)
✅ Testar QR Codes

---

## 📝 Comandos Úteis

### Ver status
```powershell
.\verificar-status-simples.ps1
```

### Ver eventos Stripe recentes
```powershell
.\stripe.exe events list --limit 5
```

### Testar webhook manualmente
```powershell
.\stripe.exe trigger checkout.session.completed
```

---

## 🔧 Se Algo Der Errado

### Webhook retorna 400?

1. Copie o `whsec_xxxxx` do terminal do Stripe
2. Abra `.env.local`
3. Atualize: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
4. Reinicie Next.js (Ctrl+C e `npm run dev`)

### Porta 3000 ocupada?

```powershell
# Matar processo
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Ou usar outra porta
npm run dev -- -p 3001
```

---

## 🎉 Tudo Funcionando!

Se você chegou até aqui e viu a página de delivery com o QR Code, **PARABÉNS!** 🎊

O sistema está 100% funcional:
- ✅ Checkout
- ✅ Pagamento
- ✅ Webhook
- ✅ QR Code
- ✅ Email
- ✅ Delivery

**Agora é só usar!** 🚀
