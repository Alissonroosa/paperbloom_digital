# Guia Rápido: Stripe CLI para Paper Bloom

## 🚀 Setup Rápido

### 1. Instalar Stripe CLI

**Windows (PowerShell como Administrador):**
```powershell
# Opção 1: Usando Scoop (recomendado)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Opção 2: Usando Chocolatey
choco install stripe-cli

# Opção 3: Download direto
# https://github.com/stripe/stripe-cli/releases/latest
```

**Verificar instalação:**
```bash
stripe --version
```

### 2. Fazer Login no Stripe

```bash
stripe login
```

Isso abrirá seu navegador. Clique em "Allow access" para autorizar.

### 3. Iniciar o Listener de Webhooks

⚠️ **IMPORTANTE:** Use a porta 3000 e o endpoint correto do Paper Bloom:

```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

**Saída esperada:**
```
> Ready! Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz (copy this to your .env.local)
> Listening for events...
```

### 4. Copiar o Webhook Secret

Copie o valor `whsec_...` e adicione no arquivo `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

### 5. Testar Webhooks

Em outro terminal, você pode disparar eventos de teste:

```bash
# Testar pagamento bem-sucedido
stripe trigger checkout.session.completed

# Testar outros eventos
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## 🔄 Workflow de Desenvolvimento

### Terminal 1: Servidor Next.js
```bash
npm run dev
```

### Terminal 2: Stripe CLI Listener
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Terminal 3: Testes (opcional)
```bash
# Disparar eventos de teste
stripe trigger checkout.session.completed
```

## 📋 Comandos Úteis

### Ver eventos em tempo real
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook --print-json
```

### Ver logs de eventos
```bash
stripe events list
```

### Ver detalhes de um evento específico
```bash
stripe events retrieve evt_1234567890
```

### Testar um pagamento completo
```bash
stripe trigger checkout.session.completed
```

### Ver webhooks configurados
```bash
stripe webhooks list
```

## 🎯 Eventos Importantes para Paper Bloom

O Paper Bloom usa principalmente este evento:

- **`checkout.session.completed`** - Quando um pagamento é concluído com sucesso

Você pode testar este evento com:
```bash
stripe trigger checkout.session.completed
```

## 🔍 Verificar se está funcionando

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Em outro terminal, inicie o listener:**
   ```bash
   stripe listen --forward-to localhost:3000/api/checkout/webhook
   ```

3. **Você verá algo assim:**
   ```
   > Ready! Your webhook signing secret is whsec_...
   > 2024-01-15 10:30:00   --> checkout.session.completed [evt_...]
   > 2024-01-15 10:30:00   <-- [200] POST http://localhost:3000/api/checkout/webhook [evt_...]
   ```

4. **O `[200]` indica que seu webhook está funcionando!**

## ⚠️ Problemas Comuns

### Erro: "command not found: stripe"
- Reinstale o Stripe CLI
- Verifique se está no PATH do sistema
- Reinicie o terminal

### Erro: "Connection refused"
- Certifique-se de que o servidor Next.js está rodando (`npm run dev`)
- Verifique se a porta é 3000
- Verifique se não há firewall bloqueando

### Erro: "Invalid webhook signature"
- Certifique-se de usar o `whsec_...` do comando `stripe listen`
- Não use o webhook secret do dashboard do Stripe (são diferentes!)
- Reinicie o servidor após alterar o `.env.local`

### Webhook retorna 404
- Verifique se o endpoint está correto: `/api/checkout/webhook`
- Certifique-se de que a rota foi criada (Task 13)

## 🔐 Diferença: CLI vs Dashboard

### Stripe CLI (Desenvolvimento Local)
- Use o `whsec_...` fornecido pelo comando `stripe listen`
- Funciona apenas enquanto o CLI está rodando
- Perfeito para desenvolvimento local

### Stripe Dashboard (Produção)
- Configure um webhook endpoint no dashboard
- Use o `whsec_...` do dashboard
- Funciona em produção

## 📚 Recursos

- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Stripe Events](https://stripe.com/docs/api/events)

## 🎉 Próximos Passos

Depois de configurar o Stripe CLI:

1. ✅ Obtenha suas chaves de API do dashboard
2. ✅ Configure o `.env.local` com as chaves
3. ✅ Inicie o Stripe CLI listener
4. ⏭️ Implemente as rotas de checkout (Task 12)
5. ⏭️ Implemente o webhook handler (Task 13)
6. ⏭️ Teste o fluxo completo de pagamento

---

**Dica:** Mantenha o Stripe CLI rodando em um terminal separado durante todo o desenvolvimento! 🚀
