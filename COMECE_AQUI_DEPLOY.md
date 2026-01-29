# 🚀 COMECE AQUI - Deploy em Produção

## ⚡ 3 Passos para Deploy

### 1️⃣ Execute o Script (2 minutos)
```powershell
.\git-deploy.ps1
```

Este script vai:
- ✅ Verificar se está tudo pronto
- ✅ Fazer commit das alterações
- ✅ Fazer push para o GitHub

---

### 2️⃣ Configure no Coolify (5 minutos)

#### A. Criar Aplicação
1. Acesse seu painel Coolify
2. Clique em **"New Resource"**
3. Selecione **"Application"**

#### B. Conectar GitHub
1. Source: **GitHub**
2. Repositório: **Selecione seu repositório**
3. Branch: **main**

#### C. Configurar Build
1. Build Type: **Dockerfile**
2. Port: **3000**
3. Domain: **seu-dominio.com.br**

#### D. Adicionar Variáveis de Ambiente

Copie e cole estas variáveis (substitua pelos seus valores):

```env
# Database
DATABASE_URL=postgres://usuario:senha@host:5432/paperbloom

# Stripe (PRODUÇÃO - use sk_live_ e pk_live_)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com.br
NODE_ENV=production

# R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=paperbloom-images
R2_ENDPOINT=https://....r2.cloudflarestorage.com
R2_PUBLIC_URL=https://imagem.seu-dominio.com.br

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@seu-dominio.com.br
RESEND_FROM_NAME=Paper Bloom
```

#### E. Deploy
1. Clique em **"Deploy"**
2. Aguarde 5-10 minutos
3. Acompanhe os logs

---

### 3️⃣ Verificar (3 minutos)

#### A. Health Check
```bash
curl https://seu-dominio.com.br/api/health
```

Deve retornar:
```json
{"status":"healthy","timestamp":"...","uptime":123.45}
```

#### B. Homepage
Acesse: `https://seu-dominio.com.br`

#### C. Configurar Webhook Stripe
1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"**
3. URL: `https://seu-dominio.com.br/api/checkout/webhook`
4. Eventos: `checkout.session.completed`
5. Copie o **Webhook Secret**
6. Atualize no Coolify

---

## ✅ Pronto!

Seu app está no ar! 🎉

---

## 📚 Precisa de Mais Detalhes?

### Guia Rápido (5 min)
👉 **[DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)**

### Guia Completo (20 min)
👉 **[DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)**

### Checklist Completo
👉 **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)**

### Comandos Úteis
👉 **[COMANDOS_COOLIFY.md](./COMANDOS_COOLIFY.md)**

### Índice Completo
👉 **[INDICE_DEPLOY.md](./INDICE_DEPLOY.md)**

---

## 🆘 Problemas?

### Container não inicia
```bash
docker logs <container-id>
```

### Erro de conexão com banco
Verifique `DATABASE_URL` no Coolify

### Erro 502
```bash
docker ps
docker restart <container-id>
```

### Webhook não funciona
Verifique `STRIPE_WEBHOOK_SECRET` no Coolify

---

## 💡 Dicas

- ✅ Use chaves de **PRODUÇÃO** do Stripe (sk_live_, pk_live_)
- ✅ Verifique se o domínio está apontando para a VPS
- ✅ Configure SSL no Coolify (automático)
- ✅ Monitore os logs após o deploy
- ✅ Teste o fluxo completo de compra

---

**Bom deploy! 🚀**
