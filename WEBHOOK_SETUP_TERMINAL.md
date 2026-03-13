# 🔔 Configurar Webhook do Stripe via Terminal

Guia baseado na documentação oficial: https://docs.stripe.com/webhooks/quickstart?lang=node

## 📋 Pré-requisitos

Antes de começar, você precisa ter:
- ✅ Conta no Stripe
- ✅ Chaves de API configuradas no `.env.local`
- ✅ Stripe CLI instalado

---

## 🚀 Passo a Passo

### 1. Instalar o Stripe CLI (se ainda não tiver)

**Windows - PowerShell:**
```powershell
# Opção A: Via Scoop (recomendado)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Opção B: Via Chocolatey
choco install stripe-cli

# Opção C: Download manual
# https://github.com/stripe/stripe-cli/releases/latest
```

**Verificar instalação:**
```powershell
stripe --version
```

---

### 2. Fazer Login no Stripe CLI

```powershell
stripe login
```

**O que acontece:**
- Abre o navegador automaticamente
- Você autoriza o acesso
- O CLI fica conectado à sua conta

**Saída esperada:**
```
Your pairing code is: word-word-word
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser (^C to quit)
```

Pressione Enter e autorize no navegador.

---

### 3. Iniciar o Webhook Listener (Desenvolvimento Local)

Este é o comando principal para desenvolvimento:

```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

**O que este comando faz:**
- Escuta eventos do Stripe
- Encaminha para sua aplicação local na porta 3000
- Gera um webhook signing secret temporário

**Saída esperada:**
```
> Ready! Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz
> 2024-01-15 10:30:00   --> Listening for events...
```

⚠️ **IMPORTANTE:** Copie o `whsec_...` que apareceu!

---

### 4. Configurar o Webhook Secret

Copie o `whsec_...` e adicione no arquivo `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

**Salve o arquivo e reinicie o servidor Next.js:**
```powershell
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

---

### 5. Testar o Webhook

Em **outro terminal**, dispare um evento de teste:

```powershell
stripe trigger checkout.session.completed
```

**O que acontece:**
1. O Stripe CLI cria um evento de teste
2. Envia para sua aplicação local
3. Você vê os logs em ambos os terminais

**Saída esperada no terminal do listener:**
```
> 2024-01-15 10:35:00   --> checkout.session.completed [evt_1234567890]
> 2024-01-15 10:35:00   <-- [200] POST http://localhost:3000/api/checkout/webhook [evt_1234567890]
```

O `[200]` indica sucesso! ✅

---

## 🔄 Workflow de Desenvolvimento Completo

### Terminal 1: Servidor Next.js
```powershell
npm run dev
```

### Terminal 2: Stripe Webhook Listener
```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Terminal 3: Testes (opcional)
```powershell
# Disparar eventos de teste
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

---

## 📝 Comandos Úteis do Stripe CLI

### Ver eventos em tempo real com detalhes
```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook --print-json
```

### Ver lista de eventos recentes
```powershell
stripe events list --limit 10
```

### Ver detalhes de um evento específico
```powershell
stripe events retrieve evt_1234567890
```

### Disparar eventos específicos
```powershell
# Pagamento bem-sucedido
stripe trigger checkout.session.completed

# Pagamento falhou
stripe trigger payment_intent.payment_failed

# Reembolso criado
stripe trigger charge.refunded
```

### Ver webhooks configurados no dashboard
```powershell
stripe webhooks list
```

---

## 🎯 Eventos Importantes para Paper Bloom

O Paper Bloom usa principalmente este evento:

### `checkout.session.completed`
Disparado quando um pagamento é concluído com sucesso.

**Testar:**
```powershell
stripe trigger checkout.session.completed
```

**O que o webhook deve fazer:**
1. Receber o evento
2. Verificar a assinatura
3. Extrair o `messageId` dos metadados
4. Atualizar o status da mensagem para "paid"
5. Gerar o slug e QR code
6. Retornar 200 OK

---

## 🔍 Verificar se Está Funcionando

### 1. Verificar o Listener
Quando você executa `stripe listen`, deve ver:
```
> Ready! Your webhook signing secret is whsec_...
> Listening for events...
```

### 2. Disparar um Evento de Teste
```powershell
stripe trigger checkout.session.completed
```

### 3. Verificar os Logs
**No terminal do listener:**
```
> 2024-01-15 10:35:00   --> checkout.session.completed [evt_...]
> 2024-01-15 10:35:00   <-- [200] POST http://localhost:3000/api/checkout/webhook
```

**No terminal do Next.js:**
Você deve ver os logs da sua aplicação processando o webhook.

### 4. Códigos de Status
- `[200]` = Sucesso ✅
- `[404]` = Rota não encontrada (verifique o endpoint)
- `[400]` = Erro de validação
- `[500]` = Erro no servidor

---

## ⚠️ Problemas Comuns

### Erro: "command not found: stripe"
**Solução:** Instale o Stripe CLI (veja passo 1)

### Erro: "Connection refused"
**Solução:** 
- Certifique-se de que o servidor Next.js está rodando
- Verifique se a porta é 3000
- Execute `npm run dev` primeiro

### Erro: "Invalid signature"
**Solução:**
- Use o `whsec_...` do comando `stripe listen` (não do dashboard!)
- Reinicie o servidor após alterar o `.env.local`
- Certifique-se de que o webhook secret está correto

### Webhook retorna [404]
**Solução:**
- Verifique se o endpoint está correto: `/api/checkout/webhook`
- Certifique-se de que a rota foi criada (Task 13)
- Verifique a estrutura de pastas: `src/app/api/checkout/webhook/route.ts`

### Listener para de funcionar
**Solução:**
- O listener precisa ficar rodando continuamente
- Se você fechar o terminal, precisa executar `stripe listen` novamente
- Você receberá um novo `whsec_...` cada vez que reiniciar

---

## 🔐 Diferença: Desenvolvimento vs Produção

### Desenvolvimento Local (Stripe CLI)
- Use: `stripe listen --forward-to localhost:3000/api/checkout/webhook`
- Webhook secret: O `whsec_...` fornecido pelo CLI
- Funciona apenas enquanto o CLI está rodando
- Perfeito para testar localmente

### Produção (Stripe Dashboard)
- Configure um webhook endpoint no dashboard do Stripe
- URL: `https://seu-dominio.com/api/checkout/webhook`
- Webhook secret: O `whsec_...` do dashboard (diferente do CLI!)
- Funciona 24/7 em produção

---

## 📚 Recursos Adicionais

- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Webhooks Quickstart](https://docs.stripe.com/webhooks/quickstart?lang=node)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Webhook Events Reference](https://stripe.com/docs/api/events/types)

---

## ✅ Checklist Final

Antes de continuar para a implementação das rotas:

- [ ] Stripe CLI instalado e funcionando
- [ ] Login no Stripe CLI realizado
- [ ] Listener rodando (`stripe listen`)
- [ ] Webhook secret copiado para `.env.local`
- [ ] Servidor Next.js reiniciado
- [ ] Teste com `stripe trigger` funcionando
- [ ] Resposta `[200]` no listener

---

## 🎉 Próximos Passos

Agora que o webhook está configurado, você pode:

1. ✅ Implementar a rota de checkout (Task 12)
2. ✅ Implementar o webhook handler (Task 13)
3. ✅ Testar o fluxo completo de pagamento

**Mantenha o Stripe listener rodando durante todo o desenvolvimento!** 🚀
