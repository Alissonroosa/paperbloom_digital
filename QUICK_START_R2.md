# 🚀 Quick Start - Cloudflare R2

## ✅ Status: CONFIGURADO E TESTADO

---

## 🎯 Próximo Passo CRÍTICO

**As imagens ainda NÃO estão acessíveis publicamente!**

Você precisa configurar o acesso público no bucket:

### 📝 Passo a Passo (2 minutos)

1. **Acesse o Dashboard**
   - Vá para: https://dash.cloudflare.com
   - Clique em **R2**
   - Selecione o bucket **paperbloom**

2. **Ative Acesso Público**
   - Clique em **Settings**
   - Role até **Public Access**
   - Clique em **Allow Public Access**
   - Confirme a ação

3. **Teste**
   ```bash
   npm run dev
   ```
   - Acesse: http://localhost:3000/editor/mensagem
   - Faça upload de uma imagem
   - Verifique se a imagem aparece no preview

---

## 🧪 Testar Conexão R2

```bash
npm run r2:test
```

Deve mostrar:
```
✅ R2 is properly configured and working
✅ You can now upload images to R2
```

---

## 📊 Verificar Custos

Dashboard R2 > paperbloom > **Analytics**

Você verá:
- Total de objetos
- Espaço usado
- Requisições
- Custo estimado

---

## 🔧 Comandos Úteis

```bash
# Testar conexão R2
npm run r2:test

# Validar variáveis de ambiente
npm run validate:env

# Iniciar servidor
npm run dev

# Build para produção
npm run build
```

---

## 💡 Dicas

1. **Custom Domain** (Opcional, mas recomendado)
   - Configure `cdn.paperbloom.com` no R2
   - Melhora SEO e profissionalismo
   - Facilita migração futura

2. **Lifecycle Rules** (Opcional)
   - Configure para deletar imagens antigas
   - Economiza storage
   - Dashboard R2 > Settings > Lifecycle Rules

3. **Monitoramento**
   - Acompanhe custos no dashboard
   - Configure alertas para uso > 50GB
   - Verifique métricas semanalmente

---

## 📚 Documentação Completa

- **Setup Detalhado**: `R2_SETUP.md`
- **Resumo da Migração**: `R2_MIGRATION_SUMMARY.md`
- **Comparativo de Custos**: `STORAGE_COMPARISON.md`

---

## ❓ Problemas?

### Imagens não carregam
→ Configure acesso público (veja acima)

### Erro "Access Denied"
→ Verifique `.env.local`

### Upload falha
→ Execute `npm run r2:test`

---

## ✅ Checklist

- [x] R2 configurado
- [x] Testes passando
- [ ] **Acesso público ativado** ⚠️
- [ ] Upload testado no navegador
- [ ] Imagens visíveis no preview

---

**🎊 Você está quase lá! Só falta ativar o acesso público!**
