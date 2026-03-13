# 🌐 Configuração de Custom Domain para R2

## Seu Cenário: Domínio já gerenciado pela Cloudflare ✅

Isso facilita MUITO! A Cloudflare vai configurar tudo automaticamente.

---

## 📋 Passo a Passo Completo

### 1️⃣ Adicionar Custom Domain no R2

1. **Dashboard R2** > Bucket `paperbloom` > **Settings**
2. Seção **Custom Domains** > Clique em **+ Adicionar**
3. Digite o subdomínio desejado:
   - Opção 1: `cdn.paperbloom.com.br` (recomendado)
   - Opção 2: `images.paperbloom.com.br`
   - Opção 3: `static.paperbloom.com.br`
4. Clique em **Continue**
5. ✅ A Cloudflare configura o DNS automaticamente!
6. Aguarde 2-5 minutos para propagar

### 2️⃣ Habilitar URL Pública (Temporário)

Enquanto o custom domain propaga:

1. **URL de desenvolvimento público** > **Habilitar**
2. Isso permite acesso via URL padrão do R2
3. Você pode desabilitar depois que o custom domain funcionar

### 3️⃣ Configurar CORS

**MUITO IMPORTANTE** para as imagens carregarem no navegador!

1. **Política de CORS** > **+ Adicionar**
2. Cole esta configuração:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

3. **Salvar**

**Para Produção** (depois), restrinja os origins:
```json
[
  {
    "AllowedOrigins": [
      "https://paperbloom.com.br",
      "https://www.paperbloom.com.br"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4️⃣ Atualizar .env.local

Depois que o custom domain estiver ativo, atualize:

```env
# Antes
R2_PUBLIC_URL=https://paperbloom.d530cc8eb0c15580ff8e33ba5f7d80c6.r2.cloudflarestorage.com

# Depois
R2_PUBLIC_URL=https://cdn.paperbloom.com.br
```

### 5️⃣ Testar

```bash
# 1. Reiniciar servidor
npm run dev

# 2. Fazer upload de imagem
# Acesse: http://localhost:3000/editor/mensagem

# 3. Verificar URL gerada
# Deve ser: https://cdn.paperbloom.com.br/images/uuid.jpg
```

---

## 🔍 Verificar se Custom Domain Está Ativo

### Método 1: Dashboard
1. R2 > paperbloom > Settings > Custom Domains
2. Status deve mostrar: ✅ **Active**

### Método 2: Teste de URL
```bash
# Substitua pelo seu custom domain
curl -I https://cdn.paperbloom.com.br/test/connection-test-1764431341967.txt
```

Deve retornar `200 OK`

### Método 3: DNS Lookup
```bash
nslookup cdn.paperbloom.com.br
```

Deve resolver para um IP da Cloudflare

---

## 🎨 Sugestões de Subdomínios

| Subdomínio | Uso | Exemplo |
|------------|-----|---------|
| `cdn.paperbloom.com.br` | ✅ Recomendado | Genérico para assets |
| `images.paperbloom.com.br` | ✅ Específico | Só para imagens |
| `static.paperbloom.com.br` | ✅ Alternativa | Assets estáticos |
| `media.paperbloom.com.br` | ✅ Alternativa | Mídia em geral |

**Minha recomendação**: `cdn.paperbloom.com.br`
- Mais profissional
- Permite adicionar outros assets no futuro
- Padrão da indústria

---

## ⚙️ Configurações Avançadas (Opcional)

### Cache Control

As imagens já estão configuradas com cache de 1 ano:
```typescript
CacheControl: 'public, max-age=31536000, immutable'
```

### Transform Rules (Cloudflare)

Você pode adicionar regras de transformação:
1. Dashboard Cloudflare > seu domínio > **Rules** > **Transform Rules**
2. Criar regra para otimizar imagens automaticamente
3. Exemplo: Converter para WebP, redimensionar, etc.

### Analytics

Monitore o uso:
1. R2 > paperbloom > **Analytics**
2. Veja requisições, bandwidth, custos

---

## 🐛 Troubleshooting

### Custom Domain não ativa

**Problema**: Domain fica em "Pending"

**Soluções**:
1. Verifique se o domínio está ativo na Cloudflare
2. Aguarde até 15 minutos
3. Tente remover e adicionar novamente
4. Verifique se não há conflito de DNS

### Imagens não carregam (403 Forbidden)

**Problema**: CORS não configurado

**Solução**:
1. Configure CORS (passo 3 acima)
2. Aguarde 1-2 minutos
3. Limpe cache do navegador (Ctrl+Shift+R)

### Imagens não carregam (404 Not Found)

**Problema**: URL incorreta ou arquivo não existe

**Solução**:
1. Verifique se o arquivo existe no R2
2. Confirme que `R2_PUBLIC_URL` está correto
3. Teste a URL diretamente no navegador

### SSL/TLS Error

**Problema**: Certificado SSL não configurado

**Solução**:
- A Cloudflare configura SSL automaticamente
- Aguarde alguns minutos
- Verifique em: Cloudflare > SSL/TLS > Edge Certificates

---

## 📊 Monitoramento

### Métricas para Acompanhar

1. **Requisições/dia**: Quantas imagens são acessadas
2. **Bandwidth**: Tráfego de dados
3. **Storage**: Espaço usado
4. **Custos**: Quanto está gastando

### Alertas Recomendados

Configure em: R2 > paperbloom > **Notifications**

- Storage > 50GB
- Requisições > 1M/mês
- Custos > $5/mês

---

## 💰 Impacto nos Custos

**Custom Domain**: GRÁTIS! 🎉

Não há custo adicional para usar custom domain no R2.

---

## 🚀 Próximos Passos

1. ✅ Adicionar custom domain no R2
2. ✅ Configurar CORS
3. ✅ Habilitar URL pública (temporário)
4. ⏳ Aguardar propagação (2-5 min)
5. ✅ Atualizar `.env.local`
6. ✅ Testar upload
7. ✅ Verificar imagem no navegador

---

## 📝 Checklist

- [ ] Custom domain adicionado no R2
- [ ] CORS configurado
- [ ] URL pública habilitada (temporário)
- [ ] Custom domain ativo (status: Active)
- [ ] `.env.local` atualizado
- [ ] Servidor reiniciado
- [ ] Upload testado
- [ ] Imagem carrega no navegador
- [ ] URL usa custom domain

---

## 💡 Dica Pro

Depois que tudo funcionar, você pode:

1. **Desabilitar URL pública padrão**
   - Mais seguro
   - Força uso do custom domain

2. **Configurar CDN Cache**
   - Cloudflare > Cache > Configuration
   - Aumenta performance
   - Reduz custos

3. **Adicionar Image Optimization**
   - Cloudflare > Speed > Optimization
   - Polish: Lossless ou Lossy
   - WebP automático

---

**Configurado por**: Kiro AI Assistant  
**Data**: 29/11/2024  
**Tempo estimado**: 5-10 minutos
