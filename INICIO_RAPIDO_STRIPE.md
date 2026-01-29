# ⚡ Início Rápido - Stripe Local

## 🎯 Objetivo

Fazer o Stripe funcionar localmente em **3 passos simples**.

---

## 📋 Pré-requisitos

- ✅ Stripe CLI instalado (`stripe.exe` na pasta do projeto)
- ✅ Node.js instalado
- ✅ Arquivo `.env.local` configurado

---

## 🚀 3 Passos para Começar

### Passo 1: Verificar Status

```powershell
.\verificar-status.ps1
```

**O que faz:**
- Verifica se tudo está configurado
- Mostra o que está faltando
- Cria pastas necessárias automaticamente

**Resultado esperado:**
```
✅ Sistema pronto para desenvolvimento!
```

---

### Passo 2: Fazer Login no Stripe (Apenas 1ª vez)

```powershell
.\stripe.exe login
```

**O que faz:**
1. Abre navegador
2. Você faz login na conta Stripe
3. Autoriza o CLI
4. Pronto!

**Você só precisa fazer isso UMA VEZ.**

---

### Passo 3: Iniciar Desenvolvimento

```powershell
.\iniciar-desenvolvimento.ps1
```

**O que faz:**
1. Inicia servidor Next.js (nova janela)
2. Aguarda 10 segundos
3. Inicia Stripe webhook listener

**Resultado esperado:**
```
🚀 Iniciando Ambiente de Desenvolvimento
✅ Login verificado
✅ Servidor Next.js iniciado em nova janela
🎧 Iniciando Stripe CLI webhook listener...

> Ready! Your webhook signing secret is whsec_xxxxx
```

**⚠️ IMPORTANTE:** Copie o `whsec_xxxxx` se for diferente do `.env.local`

---

## 🧪 Testar

### Teste Rápido (1 minuto)

1. Abra o navegador: `http://localhost:3000/editor/12-cartas`

2. Preencha rapidamente:
   - De: Seu Nome
   - Para: Nome Teste
   - Email: seu-email@exemplo.com

3. Clique em "Finalizar e Pagar"

4. Use cartão de teste:
   ```
   Número: 4242 4242 4242 4242
   Data: 12/34
   CVC: 123
   ```

5. Verifique os logs no terminal do Stripe CLI:
   ```
   --> checkout.session.completed [evt_xxx]
   <-- [200] POST http://localhost:3000/api/checkout/webhook
   ```

6. Você será redirecionado para a página de delivery! 🎉

---

## 📺 O Que Você Verá

### Terminal 1 (Next.js)
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000

[Webhook] Processing card-collection payment
[Webhook] ✅ Successfully sent email
```

### Terminal 2 (Stripe CLI)
```
> Ready! Your webhook signing secret is whsec_xxxxx

2024-01-21 10:30:00   --> checkout.session.completed
2024-01-21 10:30:01   <-- [200] POST http://localhost:3000/api/checkout/webhook
```

### Navegador
```
✅ Suas 12 Cartas Estão Prontas!
[QR Code exibido]
[Link compartilhável]
```

---

## 🔧 Problemas Comuns

### ❌ "stripe.exe não é reconhecido"

**Solução:**
```powershell
# Use .\ antes do comando
.\stripe.exe login
```

---

### ❌ "You need to login first"

**Solução:**
```powershell
.\stripe.exe login
```

---

### ❌ Webhook retorna 400

**Causa:** Webhook secret incorreto

**Solução:**
1. Veja o secret no terminal do Stripe CLI: `whsec_xxxxx`
2. Abra `.env.local`
3. Atualize: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
4. Reinicie o servidor Next.js (Ctrl+C e `npm run dev`)

---

### ❌ "Port 3000 is already in use"

**Solução:**
```powershell
# Matar processo na porta 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Ou usar outra porta
npm run dev -- -p 3001
```

---

## 📝 Comandos Úteis

### Ver status
```powershell
.\verificar-status.ps1
```

### Iniciar tudo
```powershell
.\iniciar-desenvolvimento.ps1
```

### Apenas Stripe webhook
```powershell
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
```

### Apenas Next.js
```powershell
npm run dev
```

### Ver eventos Stripe
```powershell
.\stripe.exe events list --limit 10
```

### Testar webhook manualmente
```powershell
.\stripe.exe trigger checkout.session.completed
```

---

## ✅ Checklist Rápido

Antes de testar, verifique:

- [ ] `.\verificar-status.ps1` mostra tudo OK
- [ ] `.\stripe.exe login` foi executado
- [ ] Dois terminais abertos (Next.js + Stripe)
- [ ] Ambos mostram "Ready"
- [ ] Navegador em `localhost:3000`

---

## 🎉 Pronto!

Agora você pode:

✅ Criar mensagens e coleções
✅ Processar pagamentos de teste
✅ Ver webhooks funcionando
✅ Receber emails (se Resend configurado)
✅ Gerar QR Codes
✅ Testar fluxo completo

**Próximo passo:** Acesse `http://localhost:3000` e comece a testar! 🚀

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- `CONFIGURAR_STRIPE_LOCAL.md` - Guia completo
- `TESTAR_FLUXO_12_CARTAS_AGORA.md` - Teste detalhado
- `ARQUITETURA_BANCO_DADOS_COMPLETA.md` - Estrutura do banco
