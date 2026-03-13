# 🎯 Configuração DNS Exata - paperbloom.com.br

## 📋 IP da VPS Identificado

**IP:** `82.112.250.187`  
**Porta Coolify:** `8000`

---

## ✅ Configuração Exata na Cloudflare

### 1️⃣ Registro A Principal

**Ação:** EDITAR o registro A existente

```
Tipo: A
Nome: paperbloom.com.br (ou @)
Conteúdo: 82.112.250.187
Proxy status: DNS only (nuvem cinza 🟠)
TTL: Auto
```

**Como fazer:**
1. Clique em **"Editar"** no primeiro registro A
2. Substitua `13.248.243.5` por `82.112.250.187`
3. Clique na nuvem laranja para mudar para **"DNS only"** (nuvem cinza)
4. Salvar

---

### 2️⃣ Deletar Registro A Duplicado

**Ação:** DELETAR o segundo registro A

```
❌ DELETE: paperbloom.com.br → 76.223.105.230
```

**Como fazer:**
1. Marque a checkbox do registro com IP `76.223.105.230`
2. Clique em deletar/remover
3. Confirme

---

### 3️⃣ Registro CNAME www

**Ação:** EDITAR o registro CNAME existente

```
Tipo: CNAME
Nome: www
Conteúdo: paperbloom.com.br
Proxy status: DNS only (nuvem cinza 🟠)
TTL: Auto
```

**Como fazer:**
1. Clique em **"Editar"** no registro CNAME www
2. Verifique se o conteúdo é `paperbloom.com.br` (já está correto)
3. Clique na nuvem laranja para mudar para **"DNS only"** (nuvem cinza)
4. Salvar

---

### 4️⃣ Registro R2 (imagem)

**Ação:** MANTER como está (ou ajustar se necessário)

```
Tipo: R2 (ou CNAME)
Nome: imagem
Conteúdo: paperbloom (bucket R2)
Proxy status: Proxied (nuvem laranja 🟧) - OK para R2
TTL: Auto
```

**Como fazer:**
- Se estiver funcionando, deixe como está
- Se quiser usar a VPS para imagens, mude para:
  ```
  Tipo: A
  Nome: imagem
  Conteúdo: 82.112.250.187
  Proxy: DNS only
  ```

---

## 📊 Resultado Final

Após as alterações, seus registros DNS devem ficar assim:

```
┌──────────┬─────────────────────────┬──────────────────────┬─────────────┐
│ Tipo     │ Nome                    │ Conteúdo             │ Proxy       │
├──────────┼─────────────────────────┼──────────────────────┼─────────────┤
│ A        │ paperbloom.com.br       │ 82.112.250.187       │ DNS only 🟠 │
│ CNAME    │ www                     │ paperbloom.com.br    │ DNS only 🟠 │
│ R2/CNAME │ imagem                  │ (bucket R2)          │ Proxied 🟧  │
│ MX       │ send.email              │ (manter)             │ DNS only    │
│ NS       │ paperbloom.com.br       │ (manter)             │ DNS only    │
│ TXT      │ (todos)                 │ (manter)             │ DNS only    │
└──────────┴─────────────────────────┴──────────────────────┴─────────────┘
```

---

## ⏱️ Aguardar Propagação

Após fazer as alterações:
1. Aguarde **5-10 minutos**
2. Teste a propagação

---

## 🔍 Testar Propagação DNS

### Windows (PowerShell):
```powershell
nslookup paperbloom.com.br
```

**Resultado esperado:**
```
Nome:    paperbloom.com.br
Address: 82.112.250.187
```

### Testar Conectividade:
```powershell
# Testar se o servidor responde
ping 82.112.250.187

# Testar porta HTTP
curl http://82.112.250.187:8000
```

---

## 🚀 Configurar no Coolify

Após o DNS propagar, configure no Coolify:

### 1. Criar Aplicação

1. Acesse: http://82.112.250.187:8000
2. **New Resource** → **Application**
3. **Source:** GitHub
4. **Repository:** `Alissonroosa/paperbloom_digital`
5. **Branch:** `master`

### 2. Configurações de Build

```
Build Type: Dockerfile
Port: 3000
```

### 3. Domínio

```
Domain: paperbloom.com.br
```

**⚠️ IMPORTANTE:** Não use `http://` ou `https://`, apenas o domínio!

### 4. SSL

```
✅ Enable SSL (Let's Encrypt)
```

O Coolify vai gerar o certificado automaticamente após o DNS propagar.

### 5. Variáveis de Ambiente

Cole as variáveis do arquivo `VARIAVEIS_COOLIFY.txt`, substituindo pelos valores reais:

```env
DATABASE_URL=postgres://usuario:senha@host:5432/paperbloom
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (pegar depois de criar webhook)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_BASE_URL=https://paperbloom.com.br
NODE_ENV=production
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=paperbloom-images
R2_ENDPOINT=https://....r2.cloudflarestorage.com
R2_PUBLIC_URL=https://imagem.paperbloom.com.br
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@paperbloom.com.br
RESEND_FROM_NAME=Paper Bloom
```

### 6. Deploy

Clique em **"Deploy"** e aguarde 5-10 minutos.

---

## ✅ Verificar Deploy

### 1. Health Check
```bash
curl https://paperbloom.com.br/api/health
```

**Esperado:**
```json
{"status":"healthy","timestamp":"...","uptime":123.45}
```

### 2. Homepage
```bash
curl https://paperbloom.com.br
```

### 3. Verificar SSL

Acesse no navegador:
```
https://paperbloom.com.br
```

Deve mostrar o cadeado verde 🔒

---

## 📝 Checklist Passo a Passo

### Cloudflare DNS:
- [ ] Editar registro A: `paperbloom.com.br` → `82.112.250.187`
- [ ] Mudar proxy para "DNS only" (nuvem cinza)
- [ ] Deletar registro A duplicado (`76.223.105.230`)
- [ ] Editar registro CNAME www para "DNS only"
- [ ] Aguardar 10 minutos

### Testar DNS:
- [ ] `nslookup paperbloom.com.br` retorna `82.112.250.187`
- [ ] `ping paperbloom.com.br` funciona

### Coolify:
- [ ] Criar aplicação
- [ ] Conectar GitHub
- [ ] Configurar Dockerfile
- [ ] Adicionar domínio: `paperbloom.com.br`
- [ ] Habilitar SSL
- [ ] Adicionar variáveis de ambiente
- [ ] Deploy

### Verificar:
- [ ] Health check OK
- [ ] Homepage carrega
- [ ] SSL funcionando (cadeado verde)

---

## 🆘 Troubleshooting

### DNS não propaga

**Teste:**
```powershell
nslookup paperbloom.com.br
```

Se não retornar `82.112.250.187`:
1. Aguarde mais 10 minutos
2. Limpe cache DNS: `ipconfig /flushdns`
3. Teste novamente

### Coolify não gera SSL

**Causa:** DNS ainda não propagou ou proxy está ativado

**Solução:**
1. Verifique se DNS aponta para `82.112.250.187`
2. Verifique se proxy está em "DNS only" (nuvem cinza)
3. Aguarde 10 minutos
4. Tente gerar SSL novamente no Coolify

### Erro de conexão

**Teste:**
```powershell
ping 82.112.250.187
curl http://82.112.250.187:8000
```

Se não funcionar:
1. Verifique firewall da VPS
2. Certifique-se de que portas 80 e 443 estão abertas

---

## 🎯 Resumo Visual

**ANTES:**
```
paperbloom.com.br → 13.248.243.5 (Com proxy 🟧) ❌
paperbloom.com.br → 76.223.105.230 (Com proxy 🟧) ❌
www → paperbloom.com.br (Com proxy 🟧) ❌
```

**DEPOIS:**
```
paperbloom.com.br → 82.112.250.187 (DNS only 🟠) ✅
www → paperbloom.com.br (DNS only 🟠) ✅
imagem → bucket R2 (Proxied 🟧) ✅
```

---

## 📞 Próximos Passos

1. ✅ Configure o DNS na Cloudflare (use este guia)
2. ⏳ Aguarde 10 minutos
3. ✅ Configure no Coolify
4. ✅ Faça o deploy
5. ✅ Configure o webhook Stripe (use `CONFIGURACAO_WEBHOOK_STRIPE.md`)

---

**Tudo pronto! Siga este guia passo a passo! 🚀**
