# 🚀 Quick Start - Editor 12 Cartas

## ⚡ Início Rápido (5 minutos)

### 1. Database Migration
```bash
psql $DATABASE_URL -c "ALTER TABLE card_collections ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(255), ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);"
```

### 2. Iniciar Servidor
```bash
npm run dev
```

### 3. Testar Editor
```
http://localhost:3000/editor/12-cartas
```

### 4. Testar Webhook (opcional)
```bash
# Terminal separado
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

## 📋 Checklist Rápido

- [ ] Migration executada
- [ ] Servidor rodando
- [ ] Editor carrega sem erros
- [ ] Consegue editar cartas
- [ ] Preview funciona
- [ ] Checkout funciona (teste)
- [ ] Página pública carrega

## 🔗 URLs Importantes

- **Editor:** `/editor/12-cartas`
- **Página Pública:** `/c/[slug]` (após pagamento)
- **Demo:** `/demo/card-collection`

## 🎯 Fluxo Básico

```
Editor → Editar → Preview → Checkout → Webhook → Email → Página Pública
```

## 📚 Documentação Completa

- `STATUS_FINAL_IMPLEMENTACAO.md` - Status detalhado
- `TESTE_COMPLETO_12_CARTAS.md` - Roteiro de teste completo
- `IMPLEMENTACAO_COMPLETA_RESUMO.md` - Resumo da implementação

## 🐛 Troubleshooting

### Erro: "Colunas não existem"
```sql
ALTER TABLE card_collections 
ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
```

### Erro: "Cannot find module CardCollectionViewer"
- Ignorar - é cache do TypeScript
- Código compila corretamente
- Verificar: `npm run build`

### Webhook não processa
```bash
# Verificar Stripe CLI está rodando
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Verificar STRIPE_WEBHOOK_SECRET no .env.local
```

## ✅ Tudo Funcionando?

Se conseguir:
1. ✅ Criar coleção
2. ✅ Editar cartas
3. ✅ Ver preview
4. ✅ Fazer checkout (teste)

**Está pronto para produção!** 🎉

---

**Criado:** 10/01/2025
**Tempo estimado:** 5 minutos

