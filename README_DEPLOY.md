# 🚀 Deploy em Produção - Paper Bloom

## 📖 Documentação de Deploy

Este diretório contém toda a documentação necessária para fazer o deploy da aplicação Paper Bloom em produção usando Coolify e Docker.

---

## 🎯 Início Rápido

### Para quem tem pressa (5 minutos):
👉 **[DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)**

### Para quem quer entender tudo (20 minutos):
👉 **[DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)**

### Para acompanhar o progresso:
👉 **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)**

---

## 📚 Documentos Disponíveis

### 🎯 Guias de Deploy
1. **[DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)**
   - Guia express de 5 minutos
   - Comandos essenciais
   - Checklist rápido

2. **[DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)**
   - Guia detalhado passo a passo
   - Explicações completas
   - Troubleshooting extensivo

3. **[DEPLOY_RESUMO_EXECUTIVO.md](./DEPLOY_RESUMO_EXECUTIVO.md)**
   - Visão geral do deploy
   - Status e próximos passos
   - Resumo de arquivos criados

### ✅ Checklists
4. **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)**
   - Checklist completo de deploy
   - Pré-deploy, deploy e pós-deploy
   - Verificações e testes

### 🛠️ Ferramentas
5. **[COMANDOS_COOLIFY.md](./COMANDOS_COOLIFY.md)**
   - Comandos Docker úteis
   - Debugging no servidor
   - Manutenção e monitoramento

### 📋 Configuração
6. **[.env.production.example](./.env.production.example)**
   - Template de variáveis de ambiente
   - Todas as variáveis necessárias
   - Comentários explicativos

### 🔍 Verificação
7. **[verificar-pre-deploy.js](./verificar-pre-deploy.js)**
   - Script de verificação automática
   - Valida arquivos e configurações
   - Executa antes do deploy

---

## 🏗️ Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                      GitHub                              │
│                   (Código Fonte)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ git push
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     Coolify                              │
│              (Orquestrador de Deploy)                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Docker Build                         │  │
│  │  1. Instalar dependências                        │  │
│  │  2. Build Next.js                                │  │
│  │  3. Criar imagem otimizada                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Container em Execução                   │  │
│  │  - Node.js 20 Alpine                             │  │
│  │  - Next.js Standalone                            │  │
│  │  - Porta 3000                                    │  │
│  │  - Health Check                                  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Conecta com:
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
        ▼            ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌────────┐  ┌─────────┐
   │PostgreSQL│ │Stripe   │  │R2      │  │Resend   │
   │Database │  │Payments │  │Storage │  │Email    │
   └────────┘  └─────────┘  └────────┘  └─────────┘
```

---

## 🔧 Tecnologias Utilizadas

### Build & Deploy
- **Docker** - Containerização
- **Coolify** - Orquestração e deploy
- **GitHub** - Controle de versão
- **Next.js Standalone** - Build otimizado

### Runtime
- **Node.js 20 Alpine** - Runtime leve
- **Next.js 14** - Framework React
- **PostgreSQL** - Banco de dados
- **Cloudflare R2** - Armazenamento de imagens
- **Stripe** - Processamento de pagamentos
- **Resend** - Envio de emails

---

## 📋 Pré-requisitos

### Serviços Necessários
- [ ] VPS com Coolify instalado
- [ ] PostgreSQL configurado
- [ ] Cloudflare R2 configurado
- [ ] Conta Stripe (produção)
- [ ] Conta Resend (domínio verificado)
- [ ] Domínio configurado

### Conhecimentos Necessários
- Git básico
- Docker básico (opcional)
- Coolify básico
- Linha de comando

---

## 🚀 Processo de Deploy

### 1. Preparação (5 min)
```bash
# Verificar se está tudo pronto
node verificar-pre-deploy.js
```

### 2. Commit e Push (1 min)
```bash
git add .
git commit -m "feat: preparar para deploy em produção"
git push origin main
```

### 3. Configurar Coolify (3 min)
- Criar novo Application
- Conectar ao GitHub
- Configurar Dockerfile
- Adicionar variáveis de ambiente

### 4. Deploy (10 min)
- Clicar em "Deploy"
- Aguardar build
- Verificar logs

### 5. Verificação (5 min)
- Testar health check
- Testar homepage
- Configurar webhook Stripe
- Testar fluxo completo

**Total: ~25 minutos**

---

## 🔍 Verificações Essenciais

### Antes do Deploy
```bash
# Verificar preparação
node verificar-pre-deploy.js

# Build local
npm run build

# Testes
npm test
```

### Depois do Deploy
```bash
# Health check
curl https://seu-dominio.com.br/api/health

# Homepage
curl https://seu-dominio.com.br

# Logs
docker logs -f <container-id>
```

---

## 🆘 Troubleshooting

### Problemas Comuns

**Build falha:**
- Verificar logs do Coolify
- Verificar Dockerfile
- Verificar dependências

**Container não inicia:**
- Verificar variáveis de ambiente
- Verificar conexão com banco
- Verificar logs: `docker logs <container-id>`

**Erro 502:**
- Verificar se container está rodando
- Verificar porta 3000
- Reiniciar container

**Webhook não funciona:**
- Verificar STRIPE_WEBHOOK_SECRET
- Recriar webhook no Stripe
- Verificar logs de webhook

👉 **Mais detalhes:** [DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md#troubleshooting)

---

## 📊 Monitoramento

### Health Check
```bash
# Endpoint de saúde
GET https://seu-dominio.com.br/api/health

# Resposta esperada
{
  "status": "healthy",
  "timestamp": "2026-01-28T...",
  "uptime": 123.45
}
```

### Logs
```bash
# Logs em tempo real
docker logs -f <container-id>

# Últimas 100 linhas
docker logs --tail 100 <container-id>

# Filtrar erros
docker logs <container-id> 2>&1 | grep -i error
```

### Métricas
```bash
# CPU, Memória, Rede
docker stats <container-id>
```

---

## 🔄 Atualizações

### Deploy de Nova Versão
```bash
# 1. Fazer alterações no código
# 2. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 3. Coolify faz deploy automático (se configurado)
# Ou clicar em "Redeploy" no Coolify
```

### Rollback
```bash
# No Coolify:
# 1. Deployments → Histórico
# 2. Selecionar versão anterior
# 3. Redeploy
```

---

## 🔐 Segurança

### Boas Práticas
- ✅ Usar HTTPS (SSL/TLS)
- ✅ Variáveis de ambiente seguras
- ✅ Chaves de produção do Stripe
- ✅ Webhook secrets configurados
- ✅ Firewall configurado
- ✅ Backups regulares
- ✅ Monitoramento ativo

### Nunca Fazer
- ❌ Commitar arquivos .env
- ❌ Expor secrets no código
- ❌ Usar chaves de teste em produção
- ❌ Desabilitar SSL
- ❌ Ignorar logs de erro

---

## 📞 Suporte

### Documentação Oficial
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)
- [Coolify Documentation](https://coolify.io/docs)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

### Contatos
- **Stripe:** https://support.stripe.com
- **Cloudflare:** https://support.cloudflare.com
- **Resend:** https://resend.com/support

---

## 📝 Notas Importantes

1. **Sempre teste localmente antes de fazer deploy**
2. **Use chaves de PRODUÇÃO do Stripe**
3. **Configure backups automáticos**
4. **Monitore logs regularmente**
5. **Documente todas as mudanças**
6. **Tenha um plano de rollback**

---

## ✅ Status Atual

- ✅ Dockerfile criado e otimizado
- ✅ .dockerignore configurado
- ✅ next.config.mjs atualizado
- ✅ Health check implementado
- ✅ Documentação completa
- ✅ Scripts de verificação prontos
- ✅ **PRONTO PARA DEPLOY!**

---

## 🎯 Próximos Passos

1. ✅ Ler este README
2. ⬜ Executar `node verificar-pre-deploy.js`
3. ⬜ Seguir [DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md) ou [DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)
4. ⬜ Fazer deploy no Coolify
5. ⬜ Verificar com [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)
6. ⬜ Celebrar! 🎉

---

**Bom deploy! 🚀**

---

## 📄 Licença

Este projeto é privado e proprietário.

---

**Última atualização:** 28/01/2026
