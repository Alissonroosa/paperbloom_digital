# 🌐 Configuração DNS - Cloudflare para Coolify

## 📋 Visão Geral

Você precisa configurar os registros DNS para apontar seu domínio `paperbloom.com.br` para o servidor VPS onde o Coolify está rodando.

---

## 🎯 Registros DNS Necessários

### 1️⃣ Registro A Principal (Domínio Raiz)

**Tipo:** `A`  
**Nome:** `@` (ou `paperbloom.com.br`)  
**Conteúdo:** `IP_DO_SEU_SERVIDOR_VPS`  
**Proxy status:** 🟠 **DNS only** (desligado)  
**TTL:** `Auto`

**Exemplo:**
```
Tipo: A
Nome: paperbloom.com.br
Conteúdo: 123.456.789.10 (substitua pelo IP da sua VPS)
Proxy: DNS only (nuvem cinza)
TTL: Auto
```

### 2️⃣ Registro A para WWW

**Tipo:** `A`  
**Nome:** `www`  
**Conteúdo:** `IP_DO_SEU_SERVIDOR_VPS`  
**Proxy status:** 🟠 **DNS only** (desligado)  
**TTL:** `Auto`

**Exemplo:**
```
Tipo: A
Nome: www
Conteúdo: 123.456.789.10 (mesmo IP da VPS)
Proxy: DNS only (nuvem cinza)
TTL: Auto
```

### 3️⃣ Registro A para Subdomínio de Imagens (R2)

**Tipo:** `A`  
**Nome:** `imagem`  
**Conteúdo:** `IP_DO_SEU_SERVIDOR_VPS`  
**Proxy status:** 🟠 **DNS only** (desligado)  
**TTL:** `Auto`

**OU se estiver usando R2 com domínio customizado:**

**Tipo:** `CNAME`  
**Nome:** `imagem`  
**Conteúdo:** `seu-bucket.r2.cloudflarestorage.com`  
**Proxy status:** 🟠 **DNS only** (desligado)  
**TTL:** `Auto`

---

## 🔧 Passo a Passo na Cloudflare

### 1. Acessar Painel DNS

1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio: `paperbloom.com.br`
3. Vá em **DNS** → **Registros**

### 2. Verificar/Editar Registros A Existentes

Você já tem 2 registros A:
- `paperbloom.com.br` → `13.248.243.5`
- `paperbloom.com.br` → `76.223.105.230`

**⚠️ IMPORTANTE:** Você precisa **SUBSTITUIR** esses IPs pelo IP da sua VPS onde o Coolify está rodando.

#### Como Editar:

1. Clique em **"Editar"** no primeiro registro A
2. Em **"Conteúdo"**, substitua pelo IP da sua VPS
3. Certifique-se de que **"Status do proxy"** está em **"DNS only"** (nuvem cinza 🟠)
4. Clique em **"Salvar"**
5. **DELETE** o segundo registro A (duplicado)

### 3. Verificar/Editar Registro CNAME www

Você já tem:
- `www` → `paperbloom.com.br`

Isso está **CORRETO**, mas verifique:
1. Clique em **"Editar"**
2. Certifique-se de que **"Status do proxy"** está em **"DNS only"** (nuvem cinza 🟠)
3. Clique em **"Salvar"**

### 4. Configurar Subdomínio de Imagens

Você já tem:
- `imagem.paperbloom.com.br` (R2)

Se estiver usando R2 com domínio customizado:
1. Clique em **"Editar"** no registro R2
2. Verifique se aponta para o bucket R2 correto
3. **"Status do proxy"** pode ficar **"Proxied"** (nuvem laranja 🟧) para R2

**OU** se quiser servir imagens pela VPS:
1. Delete o registro R2 existente
2. Adicione novo registro:
   - **Tipo:** `A`
   - **Nome:** `imagem`
   - **Conteúdo:** `IP_DA_SUA_VPS`
   - **Proxy:** DNS only

---

## 📝 Configuração Final Recomendada

Após as alterações, seus registros DNS devem ficar assim:

```
┌──────────┬─────────────────────────┬──────────────────────────┬─────────────┬──────┐
│ Tipo     │ Nome                    │ Conteúdo                 │ Proxy       │ TTL  │
├──────────┼─────────────────────────┼──────────────────────────┼─────────────┼──────┤
│ A        │ paperbloom.com.br       │ 123.456.789.10 (VPS IP)  │ DNS only 🟠 │ Auto │
│ A        │ www                     │ 123.456.789.10 (VPS IP)  │ DNS only 🟠 │ Auto │
│ CNAME    │ imagem                  │ bucket.r2.cloudflarestorage.com │ Proxied 🟧 │ Auto │
│ MX       │ send.email              │ (manter existente)       │ DNS only    │ 1h   │
│ NS       │ paperbloom.com.br       │ (manter existente)       │ DNS only    │ Auto │
│ TXT      │ (manter todos)          │ (manter existente)       │ DNS only    │ Auto │
└──────────┴─────────────────────────┴──────────────────────────┴─────────────┴──────┘
```

---

## ⚠️ IMPORTANTE: Proxy Status

### DNS Only (Nuvem Cinza 🟠)
- Use para: Domínio principal e www
- Permite que o Coolify gerencie o SSL
- Necessário para Let's Encrypt funcionar

### Proxied (Nuvem Laranja 🟧)
- Use para: Subdomínio de imagens R2 (opcional)
- Cloudflare faz proxy e cache
- SSL gerenciado pela Cloudflare

**Para o Coolify funcionar corretamente, o domínio principal DEVE estar em "DNS only"!**

---

## 🔍 Como Descobrir o IP da sua VPS

### Opção 1: Painel do Coolify
1. Acesse o painel do Coolify
2. Vá em **Settings** ou **Server**
3. O IP estará listado lá

### Opção 2: Provedor de VPS
1. Acesse o painel do seu provedor (DigitalOcean, Hetzner, etc.)
2. Veja os detalhes do servidor
3. Copie o IP público

### Opção 3: SSH
```bash
# Conecte via SSH e execute:
curl ifconfig.me
```

---

## ✅ Verificar Configuração

### 1. Verificar Propagação DNS

Aguarde 5-10 minutos após fazer as alterações, depois teste:

```bash
# Windows (PowerShell)
nslookup paperbloom.com.br

# Linux/Mac
dig paperbloom.com.br
```

Deve retornar o IP da sua VPS.

### 2. Testar Conectividade

```bash
# Testar se o servidor está acessível
ping paperbloom.com.br

# Testar porta HTTP
curl -I http://paperbloom.com.br

# Testar porta HTTPS (após deploy)
curl -I https://paperbloom.com.br
```

---

## 🚀 Após Configurar DNS

### 1. Configurar no Coolify

No Coolify, ao criar a aplicação:
1. **Domain:** `paperbloom.com.br`
2. **SSL:** Ativar (Let's Encrypt automático)
3. O Coolify vai gerar o certificado SSL automaticamente

### 2. Aguardar Propagação

- **Tempo mínimo:** 5-10 minutos
- **Tempo máximo:** 24-48 horas (raro)
- **Tempo médio:** 1-2 horas

### 3. Verificar SSL

Após o deploy, acesse:
```
https://paperbloom.com.br
```

Deve mostrar o cadeado verde 🔒

---

## 🆘 Troubleshooting

### Erro: "DNS_PROBE_FINISHED_NXDOMAIN"

**Causa:** DNS ainda não propagou ou configuração incorreta

**Solução:**
1. Aguarde mais tempo (até 24h)
2. Verifique se o IP está correto
3. Limpe o cache DNS:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### Erro: "ERR_CONNECTION_REFUSED"

**Causa:** Servidor não está respondendo na porta 80/443

**Solução:**
1. Verifique se o Coolify está rodando
2. Verifique firewall da VPS:
   ```bash
   # Permitir portas 80 e 443
   sudo ufw allow 80
   sudo ufw allow 443
   ```

### Erro: "SSL_ERROR_BAD_CERT_DOMAIN"

**Causa:** Certificado SSL não foi gerado ou está incorreto

**Solução:**
1. Certifique-se de que o DNS está apontando corretamente
2. No Coolify, force a regeneração do SSL
3. Aguarde alguns minutos

### Proxy Status Incorreto

**Problema:** Coolify não consegue gerar SSL

**Solução:**
1. Vá na Cloudflare
2. Edite o registro A do domínio principal
3. Mude para **"DNS only"** (nuvem cinza 🟠)
4. Aguarde 5 minutos
5. Tente gerar o SSL novamente no Coolify

---

## 📊 Checklist de Configuração

- [ ] IP da VPS identificado
- [ ] Registro A principal atualizado com IP da VPS
- [ ] Registro A www atualizado com IP da VPS
- [ ] Proxy status em "DNS only" para domínio principal
- [ ] Registros duplicados removidos
- [ ] Aguardado 10 minutos para propagação
- [ ] DNS testado com nslookup/dig
- [ ] Ping funcionando
- [ ] Domínio configurado no Coolify
- [ ] SSL habilitado no Coolify
- [ ] Site acessível via HTTPS

---

## 🔐 Configurações de Segurança (Opcional)

### SSL/TLS na Cloudflare

1. Vá em **SSL/TLS** → **Visão geral**
2. Modo de criptografia: **"Full"** ou **"Full (strict)"**
3. Isso garante criptografia end-to-end

### Always Use HTTPS

1. Vá em **SSL/TLS** → **Edge Certificates**
2. Ative **"Always Use HTTPS"**
3. Redireciona automaticamente HTTP → HTTPS

---

## 📝 Resumo Rápido

1. **Edite** os registros A existentes com o IP da VPS
2. **Mude** proxy status para "DNS only" (nuvem cinza)
3. **Aguarde** 10 minutos
4. **Configure** no Coolify
5. **Ative** SSL no Coolify
6. **Teste** https://paperbloom.com.br

---

**Pronto! Seu DNS estará configurado! 🎉**

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas sobre:
- Qual é o IP da sua VPS
- Como editar registros na Cloudflare
- Problemas de propagação DNS

Me avise que te ajudo! 😊
