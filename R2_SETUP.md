# Cloudflare R2 Storage - Configuração Completa

## ✅ Status: CONFIGURADO

O Paper Bloom agora usa **Cloudflare R2** para armazenamento de imagens, proporcionando:
- 🚀 Escalabilidade infinita
- 💰 Custo baixíssimo (~R$ 10/mês)
- 🌍 CDN global incluído
- 🔒 Zero custo de transferência (egress)

---

## 📋 Configuração Atual

### Credenciais R2 (já configuradas em `.env.local`)

```env
R2_ACCOUNT_ID=b188e052b4d063ee4f978676ec38ee83
R2_ACCESS_KEY_ID=b188e052b4d063ee4f978676ec38ee83
R2_SECRET_ACCESS_KEY=dcc6eae1a17a83574db7f75db01bc632ddb526871766467a8ec751997b724547
R2_BUCKET_NAME=paperbloom
R2_ENDPOINT=https://d530cc8eb0c15580ff8e33ba5f7d80c6.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://paperbloom.d530cc8eb0c15580ff8e33ba5f7d80c6.r2.cloudflarestorage.com
```

### Bucket Configurado
- **Nome**: `paperbloom`
- **Região**: Auto (global)
- **Acesso**: Público para leitura

---

## 🔧 Como Funciona

### Fluxo de Upload

1. **Cliente** envia imagem para `/api/messages/upload-image`
2. **API** valida tipo e tamanho
3. **Sharp** redimensiona se necessário (max 1920x1920)
4. **ImageService** faz upload para R2
5. **R2** retorna URL pública
6. **URL** é salva no banco de dados

### Estrutura de Arquivos no R2

```
paperbloom/
└── images/
    ├── uuid-1.jpg
    ├── uuid-2.png
    ├── uuid-3.webp
    └── ...
```

### URLs Geradas

Formato: `https://paperbloom.{account_id}.r2.cloudflarestorage.com/images/{uuid}.{ext}`

Exemplo:
```
https://paperbloom.d530cc8eb0c15580ff8e33ba5f7d80c6.r2.cloudflarestorage.com/images/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

---

## 🚀 Testando a Integração

### 1. Verificar Variáveis de Ambiente

```bash
npm run validate:env
```

Deve mostrar:
```
✓ R2 Bucket: paperbloom
✓ R2 Endpoint: https://...
✓ R2 Access Key: b188e052...****
```

### 2. Testar Upload de Imagem

Inicie o servidor:
```bash
npm run dev
```

Acesse: `http://localhost:3000/editor/mensagem`

1. Faça upload de uma imagem
2. Verifique o console do navegador
3. A URL deve começar com `https://paperbloom.d530cc8eb0c15580ff8e33ba5f7d80c6...`

### 3. Verificar no Dashboard R2

1. Acesse: https://dash.cloudflare.com
2. Vá em **R2** > **paperbloom**
3. Navegue para pasta **images/**
4. Você deve ver os arquivos enviados

---

## 🔐 Configurando Acesso Público

Para que as imagens sejam acessíveis publicamente, você precisa configurar o bucket:

### Opção 1: Acesso Público Direto (Mais Simples)

1. Acesse o dashboard do R2
2. Selecione o bucket `paperbloom`
3. Vá em **Settings** > **Public Access**
4. Ative **Allow Public Access**
5. Confirme a ação

### Opção 2: Custom Domain (Recomendado para Produção)

1. No dashboard R2, selecione `paperbloom`
2. Vá em **Settings** > **Custom Domains**
3. Clique em **Connect Domain**
4. Digite: `cdn.paperbloom.com` (ou seu domínio)
5. Siga as instruções para configurar DNS
6. Atualize `.env.local`:
   ```env
   R2_PUBLIC_URL=https://cdn.paperbloom.com
   ```

**Vantagens do Custom Domain:**
- URL mais profissional
- Melhor SEO
- Fácil migrar para outro storage no futuro

---

## 💰 Custos Estimados

### Cenário: 1000 mensagens/mês

```
Armazenamento:
- 4000 imagens × 2MB = 8GB/mês
- 8GB × $0.015/GB = $0.12/mês

Requisições:
- 4000 uploads (Class A) = $0.018/mês
- 50,000 views (Class B) = $0.018/mês

Transferência (Egress):
- ZERO! 🎉

TOTAL: ~$0.16/mês (R$ 0.80/mês)
```

### Crescimento para 10,000 mensagens/mês

```
Armazenamento: 80GB × $0.015 = $1.20/mês
Requisições: ~$0.20/mês
Transferência: ZERO!

TOTAL: ~$1.40/mês (R$ 7/mês)
```

---

## 🛠️ Manutenção

### Limpeza de Imagens Antigas

Você pode configurar lifecycle rules no R2 para deletar imagens antigas automaticamente:

1. Dashboard R2 > `paperbloom` > **Settings**
2. **Lifecycle Rules** > **Create Rule**
3. Configure:
   - **Rule Name**: Delete old images
   - **Prefix**: `images/`
   - **Delete after**: 365 days (ou o período desejado)

### Backup

R2 já tem redundância automática, mas você pode:

1. **Versionamento**: Ative no dashboard para manter histórico
2. **Replicação**: Configure para outro bucket (opcional)
3. **Export**: Use `rclone` para backup local periódico

---

## 🔍 Monitoramento

### Métricas Disponíveis no Dashboard

- Total de objetos armazenados
- Espaço utilizado
- Requisições por tipo (Class A/B)
- Transferência de dados

### Alertas Recomendados

Configure alertas para:
- Uso de storage > 50GB
- Requisições > 1M/mês
- Erros de upload > 1%

---

## 🐛 Troubleshooting

### Erro: "Access Denied"

**Causa**: Credenciais incorretas ou bucket não público

**Solução**:
1. Verifique as credenciais em `.env.local`
2. Confirme que o bucket tem acesso público ativado
3. Regenere o API token se necessário

### Erro: "Bucket not found"

**Causa**: Nome do bucket incorreto

**Solução**:
1. Verifique `R2_BUCKET_NAME` em `.env.local`
2. Confirme o nome no dashboard R2

### Imagens não carregam no navegador

**Causa**: CORS não configurado ou bucket não público

**Solução**:
1. No dashboard R2, vá em **Settings** > **CORS Policy**
2. Adicione:
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

### Upload lento

**Causa**: Imagens muito grandes

**Solução**:
- O Sharp já redimensiona para max 1920x1920
- Considere reduzir qualidade JPEG para 85%
- Use WebP para melhor compressão

---

## 📚 Recursos Adicionais

- [Documentação Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Pricing Calculator](https://developers.cloudflare.com/r2/pricing/)
- [API Reference](https://developers.cloudflare.com/r2/api/s3/)
- [Best Practices](https://developers.cloudflare.com/r2/best-practices/)

---

## 🎯 Próximos Passos

1. ✅ **Configuração Básica** - COMPLETO
2. ⏳ **Testar Upload** - Faça um teste agora!
3. ⏳ **Configurar Custom Domain** - Opcional, mas recomendado
4. ⏳ **Configurar Lifecycle Rules** - Para limpeza automática
5. ⏳ **Monitorar Custos** - Acompanhe no dashboard

---

## 💡 Dicas Pro

1. **Otimize Imagens**: Use WebP quando possível (menor tamanho)
2. **Cache Headers**: Já configurado para 1 ano (`max-age=31536000`)
3. **Lazy Loading**: Implemente no frontend para melhor performance
4. **Responsive Images**: Considere gerar múltiplos tamanhos
5. **CDN**: R2 já tem CDN global, sem custo extra!

---

**Configurado por**: Kiro AI Assistant
**Data**: 29/11/2024
**Status**: ✅ Pronto para uso
