# 📋 Guia Passo a Passo - Variáveis de Ambiente

## 🎯 Checklist de Variáveis

Use este guia para pegar cada valor necessário.

---

## 1️⃣ DATABASE_URL

### Onde Pegar:
- Painel do seu provedor de PostgreSQL
- Ou no Coolify se você criou o banco lá

### Formato:
```
postgres://usuario:senha@host:5432/nome_do_banco
```

### Exemplo:
```
postgres://paperbloom_user:SenhaSegura123@db.exemplo.com:5432/paperbloom_db
```

### Como Adicionar no Coolify:
```
Name: DATABASE_URL
Value: postgres://seu_usuario:sua_senha@seu_host:5432/paperbloom
Available at Buildtime: ✅
Available at Runtime: ✅
```

---

## 2️⃣ STRIPE (3 variáveis)

### 2.1 STRIPE_SECRET_KEY

**Onde Pegar:**
1. Acesse: https://dashboard.stripe.com/apikeys
2. Certifique-se de estar em modo **PRODUÇÃO** (não teste)
3. Procure por "Secret key"
4. Clique em "Reveal test key" ou "Reveal live key"
5. Copie a chave que começa com `sk_live_`

**No Coolify:**
```
Name: STRIPE_SECRET_KEY
Value: sk_live_51ABC...XYZ
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 2.2 STRIPE_WEBHOOK_SECRET

**⚠️ IMPORTANTE:** Deixe vazio por enquanto!

Você vai pegar isso DEPOIS de:
1. Fazer o deploy
2. Criar o webhook no Stripe Dashboard
3. Ver o arquivo: `CONFIGURACAO_WEBHOOK_STRIPE.md`

**No Coolify (por enquanto):**
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_temporario
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 2.3 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**Onde Pegar:**
1. Acesse: https://dashboard.stripe.com/apikeys
2. Certifique-se de estar em modo **PRODUÇÃO**
3. Procure por "Publishable key"
4. Copie a chave que começa com `pk_live_`

**No Coolify:**
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_51ABC...XYZ
Available at Buildtime: ✅
Available at Runtime: ✅
```

---

## 3️⃣ APPLICATION (2 variáveis)

### 3.1 NEXT_PUBLIC_BASE_URL

**Valor:** `https://paperbloom.com.br`

**No Coolify:**
```
Name: NEXT_PUBLIC_BASE_URL
Value: https://paperbloom.com.br
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 3.2 NODE_ENV

**Valor:** `production`

**No Coolify:**
```
Name: NODE_ENV
Value: production
Available at Buildtime: ✅
Available at Runtime: ✅
```

---

## 4️⃣ CLOUDFLARE R2 (6 variáveis)

### 4.1 R2_ACCOUNT_ID

**Onde Pegar:**
1. Acesse: https://dash.cloudflare.com
2. Clique em **R2** no menu lateral
3. O Account ID aparece no canto superior direito
4. Copie o ID (formato: abc123def456)

**No Coolify:**
```
Name: R2_ACCOUNT_ID
Value: abc123def456
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 4.2 e 4.3 R2_ACCESS_KEY_ID e R2_SECRET_ACCESS_KEY

**Onde Pegar:**
1. Acesse: https://dash.cloudflare.com → R2
2. Clique em **"Manage R2 API Tokens"**
3. Clique em **"Create API Token"**
4. Nome: `Paper Bloom Production`
5. Permissões: **"Object Read & Write"**
6. Clique em **"Create API Token"**
7. Copie **Access Key ID** e **Secret Access Key**
8. ⚠️ **IMPORTANTE:** Guarde o Secret Access Key, ele só aparece uma vez!

**No Coolify:**
```
Name: R2_ACCESS_KEY_ID
Value: (cole o Access Key ID)
Available at Buildtime: ✅
Available at Runtime: ✅

Name: R2_SECRET_ACCESS_KEY
Value: (cole o Secret Access Key)
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 4.4 R2_BUCKET_NAME

**Onde Pegar:**
1. Acesse: https://dash.cloudflare.com → R2
2. Se já tem um bucket, copie o nome
3. Se não tem, crie um:
   - Clique em **"Create bucket"**
   - Nome: `paperbloom-images`
   - Location: Automatic
   - Clique em **"Create bucket"**

**No Coolify:**
```
Name: R2_BUCKET_NAME
Value: paperbloom-images
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 4.5 R2_ENDPOINT

**Como Montar:**
- Formato: `https://SEU_ACCOUNT_ID.r2.cloudflarestorage.com`
- Substitua `SEU_ACCOUNT_ID` pelo Account ID do item 4.1

**Exemplo:**
Se seu Account ID é `abc123def456`, então:
```
https://abc123def456.r2.cloudflarestorage.com
```

**No Coolify:**
```
Name: R2_ENDPOINT
Value: https://abc123def456.r2.cloudflarestorage.com
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 4.6 R2_PUBLIC_URL

**Opção 1: Domínio Customizado (Recomendado)**
```
https://imagem.paperbloom.com.br
```

**Opção 2: URL Pública do R2**
1. Acesse o bucket no R2
2. Vá em **Settings** → **Public Access**
3. Ative **"Allow Access"**
4. Copie a URL pública (formato: `https://pub-XXXXX.r2.dev`)

**No Coolify:**
```
Name: R2_PUBLIC_URL
Value: https://imagem.paperbloom.com.br
Available at Buildtime: ✅
Available at Runtime: ✅
```

---

## 5️⃣ RESEND EMAIL (3 variáveis)

### 5.1 RESEND_API_KEY

**Onde Pegar:**
1. Acesse: https://resend.com/api-keys
2. Clique em **"Create API Key"**
3. Nome: `Paper Bloom Production`
4. Permissões: **"Sending access"**
5. Clique em **"Create"**
6. Copie a chave (começa com `re_`)
7. ⚠️ **IMPORTANTE:** Guarde a chave, ela só aparece uma vez!

**No Coolify:**
```
Name: RESEND_API_KEY
Value: re_ABC123...XYZ
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 5.2 RESEND_FROM_EMAIL

**Onde Pegar:**
1. Acesse: https://resend.com/domains
2. Verifique se `paperbloom.com.br` está verificado
3. Se não estiver, adicione o domínio e verifique
4. Use: `noreply@paperbloom.com.br`

**⚠️ IMPORTANTE:** O domínio DEVE estar verificado no Resend!

**No Coolify:**
```
Name: RESEND_FROM_EMAIL
Value: noreply@paperbloom.com.br
Available at Buildtime: ✅
Available at Runtime: ✅
```

### 5.3 RESEND_FROM_NAME

**Valor:** `Paper Bloom`

**No Coolify:**
```
Name: RESEND_FROM_NAME
Value: Paper Bloom
Available at Buildtime: ✅
Available at Runtime: ✅
```

---

## 6️⃣ VARIÁVEIS OPCIONAIS (pode deixar assim)

### DB Pool
```
Name: DB_POOL_MAX
Value: 20

Name: DB_POOL_IDLE_TIMEOUT
Value: 30000

Name: DB_POOL_CONNECTION_TIMEOUT
Value: 2000
```

### Upload
```
Name: MAX_IMAGE_SIZE
Value: 10485760

Name: MAX_IMAGE_WIDTH
Value: 1920

Name: MAX_IMAGE_HEIGHT
Value: 1080
```

### Logging
```
Name: LOG_LEVEL
Value: info
```

---

## ✅ Checklist Final

Antes de fazer o deploy, verifique:

### Obrigatórias:
- [ ] DATABASE_URL configurado
- [ ] STRIPE_SECRET_KEY (sk_live_...)
- [ ] STRIPE_WEBHOOK_SECRET (pode ser temporário)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...)
- [ ] NEXT_PUBLIC_BASE_URL (https://paperbloom.com.br)
- [ ] NODE_ENV (production)
- [ ] R2_ACCOUNT_ID
- [ ] R2_ACCESS_KEY_ID
- [ ] R2_SECRET_ACCESS_KEY
- [ ] R2_BUCKET_NAME
- [ ] R2_ENDPOINT
- [ ] R2_PUBLIC_URL
- [ ] RESEND_API_KEY
- [ ] RESEND_FROM_EMAIL
- [ ] RESEND_FROM_NAME

### Opcionais (pode adicionar depois):
- [ ] DB_POOL_MAX
- [ ] DB_POOL_IDLE_TIMEOUT
- [ ] DB_POOL_CONNECTION_TIMEOUT
- [ ] MAX_IMAGE_SIZE
- [ ] MAX_IMAGE_WIDTH
- [ ] MAX_IMAGE_HEIGHT
- [ ] LOG_LEVEL

---

## 🎯 Ordem Recomendada

1. **Primeiro:** Configure DATABASE_URL
2. **Segundo:** Configure Stripe (3 variáveis)
3. **Terceiro:** Configure Application (2 variáveis)
4. **Quarto:** Configure R2 (6 variáveis)
5. **Quinto:** Configure Resend (3 variáveis)
6. **Sexto:** Configure opcionais (se quiser)

---

## 🆘 Problemas Comuns

### "Não encontro o Account ID do R2"
- Acesse: https://dash.cloudflare.com
- Clique em R2 no menu lateral
- O Account ID está no canto superior direito

### "Não consigo criar API Token do R2"
- Certifique-se de ter permissões de administrador
- Tente em modo anônimo do navegador
- Limpe cache e cookies

### "Domínio não verificado no Resend"
- Acesse: https://resend.com/domains
- Adicione o domínio
- Configure os registros DNS (TXT, MX, CNAME)
- Aguarde verificação (pode levar até 24h)

### "Não encontro as chaves do Stripe"
- Certifique-se de estar em modo PRODUÇÃO (não teste)
- Clique no toggle no canto superior direito
- As chaves de produção começam com `sk_live_` e `pk_live_`

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas sobre alguma variável específica, me avise! 😊
