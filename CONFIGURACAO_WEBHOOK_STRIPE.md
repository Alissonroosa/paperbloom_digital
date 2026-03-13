# 🔗 Configuração do Webhook Stripe

## 📋 Informações para Preencher no Stripe Dashboard

Quando você criar o webhook no Stripe Dashboard, preencha assim:

### 1️⃣ URL do Endpoint
```
https://paperbloom.com.br/api/checkout/webhook
```

### 2️⃣ Descrição (opcional)
```
Paper Bloom - Webhook de Produção
```

### 3️⃣ Eventos para Escutar

Selecione estes eventos:

- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`

### 4️⃣ Versão da API
```
2025-11-17.clover
```
(ou a versão mais recente disponível)

### 5️⃣ Estilo do Conteúdo
```
Instantâneo
```

---

## 🎯 Passo a Passo Completo

### 1. Acessar Dashboard do Stripe
1. Acesse: https://dashboard.stripe.com/webhooks
2. Certifique-se de estar no modo **PRODUÇÃO** (não teste)
3. Clique em **"Add endpoint"** ou **"Adicionar destino"**

### 2. Configurar o Endpoint

**Nome do destino:**
```
paperbloom-production
```

**URL do endpoint:**
```
https://paperbloom.com.br/api/checkout/webhook
```

**Descrição (opcional):**
```
Webhook de produção para processar pagamentos do Paper Bloom
```

### 3. Selecionar Eventos

Na seção "Eventos de" ou "Events to send":

1. Clique em **"Select events"** ou **"Selecionar eventos"**
2. Procure e marque:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
3. Clique em **"Add events"** ou **"Adicionar eventos"**

### 4. Configurações Avançadas (Opcional)

**Versão da API:**
- Deixe como padrão ou selecione: `2025-11-17.clover`

**Estilo do conteúdo:**
- Selecione: **"Instantâneo"**

### 5. Criar o Webhook

1. Clique em **"Add endpoint"** ou **"Adicionar destino"**
2. Aguarde a criação

### 6. Copiar o Webhook Secret

Após criar o webhook:

1. Você verá uma tela com o **Signing secret**
2. Clique em **"Reveal"** ou **"Revelar"**
3. Copie o valor que começa com `whsec_...`
4. **IMPORTANTE:** Guarde este valor em local seguro!

### 7. Atualizar no Coolify

1. Acesse o painel do Coolify
2. Vá em **Environment Variables**
3. Encontre a variável `STRIPE_WEBHOOK_SECRET`
4. Cole o valor copiado (whsec_...)
5. Clique em **"Save"** ou **"Salvar"**
6. **Redeploy** a aplicação

---

## ✅ Verificar se Está Funcionando

### Teste Manual

1. No Stripe Dashboard, vá para o webhook criado
2. Clique em **"Send test webhook"** ou **"Enviar webhook de teste"**
3. Selecione o evento: `checkout.session.completed`
4. Clique em **"Send test webhook"**

### Verificar Logs

No Coolify:
```bash
docker logs -f <container-id> | grep webhook
```

Você deve ver algo como:
```
✅ Webhook signature verified
✅ Processing checkout.session.completed
✅ Email sent successfully
```

---

## 🆘 Troubleshooting

### Erro: "Webhook signature verification failed"

**Causa:** `STRIPE_WEBHOOK_SECRET` incorreto

**Solução:**
1. Volte ao Stripe Dashboard
2. Copie novamente o Signing Secret
3. Atualize no Coolify
4. Redeploy

### Erro: "Endpoint returned 404"

**Causa:** URL do webhook incorreta

**Solução:**
1. Verifique se a URL é: `https://paperbloom.com.br/api/checkout/webhook`
2. Verifique se o deploy foi concluído
3. Teste o endpoint: `curl https://paperbloom.com.br/api/health`

### Erro: "Endpoint timeout"

**Causa:** Container não está respondendo

**Solução:**
1. Verifique se o container está rodando: `docker ps`
2. Verifique os logs: `docker logs <container-id>`
3. Reinicie o container: `docker restart <container-id>`

---

## 📊 Monitoramento

### Ver Eventos Recebidos

No Stripe Dashboard:
1. Vá para o webhook criado
2. Clique na aba **"Events"** ou **"Eventos"**
3. Você verá todos os eventos enviados e suas respostas

### Status dos Eventos

- ✅ **Succeeded** - Webhook processado com sucesso
- ❌ **Failed** - Webhook falhou (veja os logs)
- ⏳ **Pending** - Aguardando resposta

---

## 🔐 Segurança

### Boas Práticas

1. ✅ Sempre use HTTPS (nunca HTTP)
2. ✅ Mantenha o Webhook Secret seguro
3. ✅ Não compartilhe o secret publicamente
4. ✅ Rotacione o secret periodicamente
5. ✅ Monitore eventos suspeitos

### Rotacionar Webhook Secret

Se você suspeitar que o secret foi comprometido:

1. No Stripe Dashboard, vá para o webhook
2. Clique em **"Roll signing secret"** ou **"Rotacionar secret"**
3. Copie o novo secret
4. Atualize no Coolify
5. Redeploy

---

## 📝 Resumo

**URL do Webhook:**
```
https://paperbloom.com.br/api/checkout/webhook
```

**Eventos:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

**Variável no Coolify:**
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

**Pronto! Seu webhook está configurado! 🎉**
