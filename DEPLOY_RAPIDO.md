# 🚀 Deploy Rápido - Coolify

## ⚡ Guia Express (5 minutos)

### 1️⃣ Verificar Preparação

```bash
node verificar-pre-deploy.js
```

### 2️⃣ Commit e Push

```bash
git add .
git commit -m "feat: preparar para deploy em produção"
git push origin main
```

### 3️⃣ Configurar no Coolify

1. **New Resource** → **Application**
2. **Source:** GitHub → Selecione seu repositório
3. **Branch:** `main`
4. **Build Type:** Dockerfile
5. **Port:** 3000
6. **Domain:** seu-dominio.com.br

### 4️⃣ Variáveis de Ambiente (Copie e Cole)

```env
# Database
DATABASE_URL=postgres://usuario:senha@host:5432/paperbloom

# Stripe (PRODUÇÃO - sk_live_ e pk_live_)
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

### 5️⃣ Deploy

Clique em **"Deploy"** no Coolify e aguarde 5-10 minutos.

### 6️⃣ Verificar

```bash
# Health check
curl https://seu-dominio.com.br/api/health

# Homepage
curl https://seu-dominio.com.br
```

### 7️⃣ Configurar Webhook Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. **Add endpoint:** `https://seu-dominio.com.br/api/checkout/webhook`
3. **Eventos:** `checkout.session.completed`
4. Copie o **Webhook Secret** e atualize no Coolify

---

## ✅ Checklist Rápido

- [ ] Código no GitHub
- [ ] Coolify configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy concluído
- [ ] Health check OK
- [ ] Webhook Stripe configurado
- [ ] Teste de compra realizado

---

## 🆘 Problemas?

Consulte: **DEPLOY_PRODUCAO_GUIA_COMPLETO.md**

---

**Pronto! Seu app está no ar! 🎉**
