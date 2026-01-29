# 🚀 Deploy em Produção - Configuração do Stripe

## ⚠️ IMPORTANTE: Stripe CLI é APENAS para desenvolvimento local!

Em produção (Coolify/VPS), você **NÃO precisa** do Stripe CLI.

---

## 🎯 Como Funciona em Produção

### Desenvolvimento Local (agora):
```
Stripe → Stripe CLI → localhost:3000/api/checkout/webhook
```

### Produção (Coolify/VPS):
```
Stripe → seudominio.com/api/checkout/webhook
```

O Stripe envia webhooks **diretamente** para seu domínio!

---

## 📋 Configuração em Produção

### Passo 1: Deploy no Coolify

1. Faça o deploy normal da aplicação
2. Configure as variáveis de ambiente:
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx (você vai gerar isso no passo 2)
   NEXT_PUBLIC_BASE_URL=https://seudominio.com
   ```

### Passo 2: Configurar Webhook no Dashboard do Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. Configure:
   - **URL do endpoint**: `https://seudominio.com/api/checkout/webhook`
   - **Eventos a escutar**: Selecione `checkout.session.completed`
   - **Versão da API**: Use a mais recente
4. Clique em "Add endpoint"
5. **COPIE o Webhook Signing Secret** (whsec_...)
6. Adicione nas variáveis de ambiente do Coolify como `STRIPE_WEBHOOK_SECRET`

### Passo 3: Testar

1. Faça um pagamento de teste em produção
2. Veja os logs do webhook no dashboard do Stripe
3. Verifique se o QR Code foi gerado
4. Verifique se o email foi enviado

---

## 🔧 Configuração no Coolify

### Variáveis de Ambiente Necessárias:

```env
# Stripe (Produção)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Base URL
NEXT_PUBLIC_BASE_URL=https://seudominio.com

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Cloudflare R2 (Storage)
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=paperbloom
R2_PUBLIC_URL=https://cdn.seudominio.com
```

---

## 🎯 Diferenças: Desenvolvimento vs Produção

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Stripe CLI** | ✅ Necessário | ❌ Não usa |
| **Webhook URL** | localhost:3000 | seudominio.com |
| **Stripe Keys** | Test mode (sk_test_) | Live mode (sk_live_) |
| **Webhook Secret** | Do Stripe CLI | Do Dashboard |
| **Configuração** | Manual (terminal) | Automática |

---

## 📝 Checklist de Deploy

### Antes do Deploy:
- [ ] Código commitado no Git
- [ ] Variáveis de ambiente configuradas no Coolify
- [ ] Domínio configurado e apontando para o servidor
- [ ] SSL/HTTPS configurado (obrigatório para webhooks)

### Após o Deploy:
- [ ] Webhook configurado no dashboard do Stripe
- [ ] Webhook secret adicionado nas variáveis de ambiente
- [ ] Teste de pagamento realizado
- [ ] QR Code gerado corretamente
- [ ] Email enviado com sucesso

---

## 🔍 Verificar se Webhook está Funcionando

### No Dashboard do Stripe:

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique no seu endpoint
3. Veja a aba "Events"
4. Faça um pagamento de teste
5. Veja se o evento `checkout.session.completed` aparece
6. Verifique o status (deve ser "Succeeded")

### Logs do Webhook:

O Stripe mostra:
- ✅ Request enviado
- ✅ Response recebido (200 OK)
- ✅ Payload do evento
- ❌ Erros (se houver)

---

## 🆘 Troubleshooting em Produção

### Webhook não está sendo chamado:
- Verifique se a URL está correta
- Certifique-se que HTTPS está funcionando
- Verifique se não há firewall bloqueando

### Webhook retorna erro 400/500:
- Verifique o `STRIPE_WEBHOOK_SECRET` nas variáveis de ambiente
- Veja os logs da aplicação no Coolify
- Teste o endpoint manualmente

### QR Code não é gerado:
- Verifique se a pasta `public/uploads/qrcodes` existe
- Verifique permissões de escrita
- Veja os logs da aplicação

---

## 💡 Dica: Testar Webhook em Produção

Use o recurso "Send test webhook" do Stripe:

1. Acesse o webhook no dashboard
2. Clique em "Send test webhook"
3. Selecione `checkout.session.completed`
4. Clique em "Send test webhook"
5. Veja se funciona!

---

## 🎯 Resumo

**Para desenvolvimento local:**
- ✅ Use Stripe CLI
- ✅ Coloque na pasta do projeto (mais simples)
- ✅ Execute: `.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook`

**Para produção (Coolify/VPS):**
- ❌ NÃO use Stripe CLI
- ✅ Configure webhook no dashboard do Stripe
- ✅ Use HTTPS (obrigatório)
- ✅ Adicione webhook secret nas variáveis de ambiente

---

**Conclusão:** Coloque o `stripe.exe` na pasta do projeto para desenvolvimento. Em produção, você não vai precisar dele! 🚀
