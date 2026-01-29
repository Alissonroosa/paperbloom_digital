# 🚀 Guia Completo de Deploy em Produção - Coolify

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Preparação do Código](#preparação-do-código)
3. [Configuração no GitHub](#configuração-no-github)
4. [Configuração no Coolify](#configuração-no-coolify)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Deploy](#deploy)
7. [Pós-Deploy](#pós-deploy)
8. [Troubleshooting](#troubleshooting)

---

## 1️⃣ Pré-requisitos

### ✅ Checklist Antes do Deploy

- [ ] Código testado localmente
- [ ] Todas as variáveis de ambiente documentadas
- [ ] Banco de dados PostgreSQL configurado na VPS
- [ ] Cloudflare R2 configurado
- [ ] Stripe configurado (chaves de produção)
- [ ] Resend configurado (domínio verificado)
- [ ] Domínio configurado e apontando para a VPS

### 🔧 Serviços Necessários

1. **PostgreSQL** - Banco de dados
2. **Cloudflare R2** - Armazenamento de imagens
3. **Stripe** - Pagamentos
4. **Resend** - Envio de emails
5. **Domínio** - DNS configurado

---

## 2️⃣ Preparação do Código

### Arquivos Criados

Os seguintes arquivos foram criados automaticamente:

1. ✅ `Dockerfile` - Configuração Docker otimizada
2. ✅ `.dockerignore` - Arquivos excluídos do build
3. ✅ `next.config.mjs` - Atualizado com `output: 'standalone'`
4. ✅ `src/app/api/health/route.ts` - Health check endpoint

### Commit e Push para GitHub

```bash
# 1. Adicionar os novos arquivos
git add Dockerfile .dockerignore next.config.mjs src/app/api/health/route.ts

# 2. Commit
git commit -m "feat: adicionar configuração Docker para produção"

# 3. Push para o GitHub
git push origin main
```

---

## 3️⃣ Configuração no GitHub

### Verificar Branch Principal

Certifique-se de que seu código está na branch `main` ou `master`:

```bash
git branch
```

### Verificar Remote

```bash
git remote -v
```

Deve mostrar algo como:
```
origin  https://github.com/seu-usuario/seu-repositorio.git (fetch)
origin  https://github.com/seu-usuario/seu-repositorio.git (push)
```

---

## 4️⃣ Configuração no Coolify

### Passo 1: Criar Novo Projeto

1. Acesse o painel do Coolify
2. Clique em **"New Resource"** ou **"Add New"**
3. Selecione **"Application"**

### Passo 2: Conectar ao GitHub

1. Escolha **"GitHub"** como fonte
2. Selecione seu repositório
3. Escolha a branch: `main` ou `master`

### Passo 3: Configurar Build

**Tipo de Build:**
- Selecione: **"Dockerfile"**
- Dockerfile path: `./Dockerfile` (padrão)

**Build Settings:**
- Build Command: (deixe vazio, o Dockerfile cuida disso)
- Start Command: (deixe vazio, o Dockerfile cuida disso)

### Passo 4: Configurar Porta

- **Port:** `3000`
- **Protocol:** `HTTP`

### Passo 5: Configurar Domínio

- **Domain:** `paperbloom.com.br` (ou seu domínio)
- **SSL:** Ativar (Let's Encrypt automático)

---

## 5️⃣ Variáveis de Ambiente

### No Coolify, adicione as seguintes variáveis:

#### 🗄️ Database
```env
DATABASE_URL=postgres://usuario:senha@host:5432/paperbloom
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
```

#### 💳 Stripe (PRODUÇÃO)
```env
STRIPE_SECRET_KEY=sk_live_seu_secret_key_de_producao
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_de_producao
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_seu_publishable_key_de_producao
```

⚠️ **IMPORTANTE:** Use as chaves de **PRODUÇÃO** (sk_live_, pk_live_)

#### 🌐 Application
```env
NEXT_PUBLIC_BASE_URL=https://paperbloom.com.br
NODE_ENV=production
```

#### ☁️ Cloudflare R2
```env
R2_ACCOUNT_ID=seu_account_id
R2_ACCESS_KEY_ID=seu_access_key_id
R2_SECRET_ACCESS_KEY=seu_secret_access_key
R2_BUCKET_NAME=paperbloom-images
R2_ENDPOINT=https://seu_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://imagem.paperbloom.com.br
```

#### 📧 Resend
```env
RESEND_API_KEY=re_seu_api_key_de_producao
RESEND_FROM_EMAIL=noreply@paperbloom.com.br
RESEND_FROM_NAME=Paper Bloom
```

#### 📤 Upload (Opcional)
```env
MAX_IMAGE_SIZE=10485760
MAX_IMAGE_WIDTH=1920
MAX_IMAGE_HEIGHT=1080
```

---

## 6️⃣ Deploy

### Iniciar Deploy

1. No Coolify, clique em **"Deploy"**
2. Aguarde o build (pode levar 5-10 minutos)
3. Acompanhe os logs em tempo real

### Logs do Build

O Coolify mostrará:
```
Building Docker image...
[+] Building 234.5s
 => [deps 1/3] FROM node:20-alpine
 => [builder 2/5] COPY --from=deps /app/node_modules ./node_modules
 => [builder 3/5] COPY . .
 => [builder 4/5] RUN npm ci
 => [builder 5/5] RUN npm run build
 => [runner] COPY --from=builder /app/.next/standalone ./
Successfully built!
```

### Verificar Deploy

Após o deploy, verifique:

1. **Health Check:**
   ```bash
   curl https://paperbloom.com.br/api/health
   ```
   
   Deve retornar:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-01-28T...",
     "uptime": 123.45
   }
   ```

2. **Homepage:**
   ```bash
   curl https://paperbloom.com.br
   ```

---

## 7️⃣ Pós-Deploy

### 1. Configurar Webhook do Stripe

No [Stripe Dashboard](https://dashboard.stripe.com/webhooks):

1. Clique em **"Add endpoint"**
2. URL: `https://paperbloom.com.br/api/checkout/webhook`
3. Eventos para escutar:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copie o **Webhook Secret** e atualize no Coolify

### 2. Testar Webhook

```bash
stripe trigger checkout.session.completed --api-key sk_live_...
```

### 3. Executar Migrations

Se necessário, execute as migrations no banco de produção:

```bash
# Conectar ao container
docker exec -it <container-id> sh

# Executar migrations
npm run db:migrate
```

### 4. Verificar Logs

No Coolify, monitore os logs:
- Erros de conexão com banco
- Erros de upload R2
- Erros de pagamento Stripe
- Erros de envio de email

### 5. Configurar Monitoramento

Adicione monitoramento para:
- Uptime (use o endpoint `/api/health`)
- Erros 500
- Tempo de resposta
- Uso de memória/CPU

---

## 8️⃣ Troubleshooting

### ❌ Erro: "Cannot connect to database"

**Solução:**
1. Verifique `DATABASE_URL` no Coolify
2. Teste conexão do container ao PostgreSQL:
   ```bash
   docker exec -it <container-id> sh
   nc -zv <db-host> 5432
   ```

### ❌ Erro: "Stripe webhook signature verification failed"

**Solução:**
1. Verifique `STRIPE_WEBHOOK_SECRET` no Coolify
2. Certifique-se de usar o secret do webhook de **produção**
3. Recrie o webhook no Stripe Dashboard

### ❌ Erro: "R2 upload failed"

**Solução:**
1. Verifique credenciais R2 no Coolify
2. Teste acesso ao bucket:
   ```bash
   curl https://imagem.paperbloom.com.br/test.png
   ```
3. Verifique CORS no R2

### ❌ Erro: "Email sending failed"

**Solução:**
1. Verifique `RESEND_API_KEY` no Coolify
2. Confirme que o domínio está verificado no Resend
3. Verifique logs do Resend Dashboard

### ❌ Build muito lento

**Solução:**
1. Verifique se `.dockerignore` está correto
2. Use cache do Docker no Coolify
3. Considere aumentar recursos da VPS

### ❌ Container reiniciando constantemente

**Solução:**
1. Verifique logs: `docker logs <container-id>`
2. Verifique health check: `curl http://localhost:3000/api/health`
3. Verifique memória disponível: `docker stats`

---

## 🎯 Checklist Final

Após o deploy, verifique:

- [ ] Site acessível via HTTPS
- [ ] SSL funcionando (cadeado verde)
- [ ] Health check retornando 200
- [ ] Homepage carregando corretamente
- [ ] Upload de imagens funcionando
- [ ] Checkout Stripe funcionando
- [ ] Webhook Stripe recebendo eventos
- [ ] Emails sendo enviados
- [ ] Logs sem erros críticos
- [ ] Monitoramento configurado

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Coolify
2. Teste cada serviço individualmente
3. Consulte a documentação:
   - [Next.js Deployment](https://nextjs.org/docs/deployment)
   - [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
   - [Coolify Documentation](https://coolify.io/docs)

---

## 🔄 Atualizações Futuras

Para fazer deploy de novas versões:

1. Faça commit e push das alterações
2. No Coolify, clique em **"Redeploy"**
3. Ou configure **Auto Deploy** no Coolify para deploy automático a cada push

---

**Bom deploy! 🚀**
