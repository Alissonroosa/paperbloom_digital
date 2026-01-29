# 🎯 Deploy em Produção - Resumo Executivo

## ✅ Status: PRONTO PARA DEPLOY

Todos os arquivos necessários foram criados e verificados.

---

## 📦 Arquivos Criados

1. ✅ **Dockerfile** - Build otimizado multi-stage
2. ✅ **.dockerignore** - Exclusão de arquivos desnecessários
3. ✅ **next.config.mjs** - Configurado com `output: 'standalone'`
4. ✅ **src/app/api/health/route.ts** - Health check endpoint
5. ✅ **.env.production.example** - Template de variáveis de produção
6. ✅ **verificar-pre-deploy.js** - Script de verificação
7. ✅ **DEPLOY_PRODUCAO_GUIA_COMPLETO.md** - Guia detalhado
8. ✅ **DEPLOY_RAPIDO.md** - Guia express (5 min)
9. ✅ **COMANDOS_COOLIFY.md** - Comandos úteis

---

## 🚀 Próximos Passos (3 comandos)

### 1. Commit e Push
```bash
git add .
git commit -m "feat: preparar para deploy em produção"
git push origin main
```

### 2. Configurar no Coolify
- New Resource → Application
- GitHub → Seu repositório → Branch: main
- Build Type: **Dockerfile**
- Port: **3000**
- Domain: **seu-dominio.com.br**

### 3. Adicionar Variáveis de Ambiente
Copie de `.env.production.example` e cole no Coolify.

**⚠️ IMPORTANTE:** Use chaves de **PRODUÇÃO** do Stripe (sk_live_, pk_live_)

---

## 📋 Checklist de Variáveis Obrigatórias

Certifique-se de configurar no Coolify:

- [ ] `DATABASE_URL` - PostgreSQL
- [ ] `STRIPE_SECRET_KEY` - sk_live_...
- [ ] `STRIPE_WEBHOOK_SECRET` - whsec_...
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - pk_live_...
- [ ] `NEXT_PUBLIC_BASE_URL` - https://seu-dominio.com.br
- [ ] `R2_ACCOUNT_ID` - Cloudflare R2
- [ ] `R2_ACCESS_KEY_ID` - Cloudflare R2
- [ ] `R2_SECRET_ACCESS_KEY` - Cloudflare R2
- [ ] `R2_BUCKET_NAME` - Nome do bucket
- [ ] `R2_ENDPOINT` - URL do R2
- [ ] `R2_PUBLIC_URL` - URL pública das imagens
- [ ] `RESEND_API_KEY` - API key do Resend
- [ ] `RESEND_FROM_EMAIL` - Email verificado
- [ ] `RESEND_FROM_NAME` - Paper Bloom
- [ ] `NODE_ENV` - production

---

## ⏱️ Tempo Estimado

- **Commit e Push:** 1 minuto
- **Configurar Coolify:** 3 minutos
- **Build Docker:** 5-10 minutos
- **Configurar Webhook Stripe:** 2 minutos
- **Testes:** 5 minutos

**Total:** ~20 minutos

---

## 🔍 Verificações Pós-Deploy

### 1. Health Check
```bash
curl https://seu-dominio.com.br/api/health
```
Deve retornar: `{"status":"healthy",...}`

### 2. Homepage
```bash
curl https://seu-dominio.com.br
```
Deve retornar HTML da página

### 3. SSL
Verificar se o cadeado verde aparece no navegador

### 4. Webhook Stripe
1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione: `https://seu-dominio.com.br/api/checkout/webhook`
3. Eventos: `checkout.session.completed`
4. Teste com: `stripe trigger checkout.session.completed`

---

## 📚 Documentação

- **Guia Completo:** `DEPLOY_PRODUCAO_GUIA_COMPLETO.md`
- **Guia Rápido:** `DEPLOY_RAPIDO.md`
- **Comandos Úteis:** `COMANDOS_COOLIFY.md`
- **Variáveis de Ambiente:** `.env.production.example`

---

## 🆘 Suporte

### Problemas Comuns

**Container não inicia:**
```bash
docker logs <container-id>
```

**Erro de conexão com banco:**
- Verificar `DATABASE_URL` no Coolify
- Testar conexão: `nc -zv <db-host> 5432`

**Erro 502 Bad Gateway:**
- Verificar se container está rodando: `docker ps`
- Reiniciar: `docker restart <container-id>`

**Webhook Stripe não funciona:**
- Verificar `STRIPE_WEBHOOK_SECRET` no Coolify
- Recriar webhook no Stripe Dashboard

---

## 🎉 Após o Deploy

1. ✅ Testar fluxo completo de compra
2. ✅ Verificar envio de emails
3. ✅ Testar upload de imagens
4. ✅ Configurar monitoramento
5. ✅ Configurar backups automáticos
6. ✅ Documentar credenciais em local seguro

---

## 🔄 Atualizações Futuras

Para fazer deploy de novas versões:

```bash
git push origin main
```

O Coolify pode ser configurado para fazer **Auto Deploy** a cada push.

---

## 💡 Dicas Importantes

1. **Sempre use chaves de PRODUÇÃO do Stripe**
2. **Nunca commite arquivos .env no Git**
3. **Faça backup do banco antes de migrations**
4. **Teste em staging antes de produção**
5. **Configure alertas de monitoramento**
6. **Documente todas as mudanças**

---

## 📞 Contatos Importantes

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Cloudflare R2:** https://dash.cloudflare.com
- **Resend Dashboard:** https://resend.com/emails
- **Coolify:** Seu painel Coolify

---

**Tudo pronto! Bom deploy! 🚀**

---

## 🎯 Comando Único para Começar

```bash
# Verificar se está tudo OK
node verificar-pre-deploy.js

# Se OK, fazer commit e push
git add . && git commit -m "feat: preparar para deploy em produção" && git push origin main
```

Depois é só configurar no Coolify! 🎉
