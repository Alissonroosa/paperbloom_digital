# 📚 Índice Completo - Documentação de Deploy

## 🎯 Por Onde Começar?

### Você tem 5 minutos?
👉 **[DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)** - Guia express

### Você tem 20 minutos?
👉 **[DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)** - Guia completo

### Primeira vez fazendo deploy?
👉 **[README_DEPLOY.md](./README_DEPLOY.md)** - Comece aqui

---

## 📖 Documentação Completa

### 🚀 Guias de Deploy

| Documento | Descrição | Tempo | Nível |
|-----------|-----------|-------|-------|
| **[README_DEPLOY.md](./README_DEPLOY.md)** | Visão geral e introdução | 5 min | Iniciante |
| **[DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)** | Guia express de deploy | 5 min | Intermediário |
| **[DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)** | Guia detalhado passo a passo | 20 min | Todos |
| **[DEPLOY_RESUMO_EXECUTIVO.md](./DEPLOY_RESUMO_EXECUTIVO.md)** | Resumo executivo | 3 min | Gerencial |

### ✅ Checklists e Verificação

| Documento | Descrição | Uso |
|-----------|-----------|-----|
| **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)** | Checklist completo de deploy | Durante deploy |
| **[verificar-pre-deploy.js](./verificar-pre-deploy.js)** | Script de verificação automática | Antes do deploy |

### 🛠️ Ferramentas e Scripts

| Arquivo | Descrição | Como Usar |
|---------|-----------|-----------|
| **[git-deploy.ps1](./git-deploy.ps1)** | Script automatizado de deploy | `./git-deploy.ps1` |
| **[verificar-pre-deploy.js](./verificar-pre-deploy.js)** | Verificação pré-deploy | `node verificar-pre-deploy.js` |
| **[COMANDOS_COOLIFY.md](./COMANDOS_COOLIFY.md)** | Comandos úteis Docker/Coolify | Referência |

### 📋 Configuração

| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| **[.env.production.example](./.env.production.example)** | Template de variáveis de produção | Copiar para Coolify |
| **[Dockerfile](./Dockerfile)** | Configuração Docker | Usado pelo Coolify |
| **[.dockerignore](./.dockerignore)** | Arquivos excluídos do build | Usado pelo Docker |
| **[next.config.mjs](./next.config.mjs)** | Configuração Next.js | Usado pelo build |

### 🏥 Monitoramento e Debug

| Recurso | Descrição | Endpoint |
|---------|-----------|----------|
| **Health Check** | Verificação de saúde | `/api/health` |
| **[COMANDOS_COOLIFY.md](./COMANDOS_COOLIFY.md)** | Comandos de debug | Referência |

---

## 🗺️ Fluxo de Deploy

```
1. Preparação
   ├── Ler: README_DEPLOY.md
   ├── Executar: verificar-pre-deploy.js
   └── Revisar: CHECKLIST_DEPLOY.md (Pré-Deploy)
   
2. Configuração
   ├── Preparar: .env.production.example
   ├── Verificar: Dockerfile e .dockerignore
   └── Confirmar: next.config.mjs
   
3. Deploy
   ├── Opção A: Executar git-deploy.ps1
   └── Opção B: Seguir DEPLOY_RAPIDO.md
   
4. Coolify
   ├── Configurar aplicação
   ├── Adicionar variáveis de ambiente
   └── Iniciar deploy
   
5. Verificação
   ├── Seguir: CHECKLIST_DEPLOY.md (Pós-Deploy)
   ├── Testar: Health check
   └── Configurar: Webhook Stripe
   
6. Monitoramento
   ├── Usar: COMANDOS_COOLIFY.md
   └── Verificar: Logs e métricas
```

---

## 📚 Documentação por Categoria

### 🎓 Para Iniciantes

1. **[README_DEPLOY.md](./README_DEPLOY.md)** - Comece aqui
2. **[DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)** - Guia simplificado
3. **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)** - Acompanhe o progresso

### 👨‍💻 Para Desenvolvedores

1. **[DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)** - Guia técnico
2. **[Dockerfile](./Dockerfile)** - Configuração Docker
3. **[COMANDOS_COOLIFY.md](./COMANDOS_COOLIFY.md)** - Comandos úteis
4. **[verificar-pre-deploy.js](./verificar-pre-deploy.js)** - Automação

### 👔 Para Gestores

1. **[DEPLOY_RESUMO_EXECUTIVO.md](./DEPLOY_RESUMO_EXECUTIVO.md)** - Visão geral
2. **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)** - Status do deploy
3. **[README_DEPLOY.md](./README_DEPLOY.md)** - Contexto geral

### 🔧 Para DevOps

1. **[Dockerfile](./Dockerfile)** - Build configuration
2. **[.dockerignore](./.dockerignore)** - Build optimization
3. **[COMANDOS_COOLIFY.md](./COMANDOS_COOLIFY.md)** - Operations
4. **[.env.production.example](./.env.production.example)** - Environment setup

---

## 🔍 Busca Rápida

### Preciso de...

**Fazer deploy rápido:**
→ [DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)

**Entender o processo completo:**
→ [DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)

**Verificar se está tudo pronto:**
→ `node verificar-pre-deploy.js`

**Acompanhar o progresso:**
→ [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)

**Configurar variáveis de ambiente:**
→ [.env.production.example](./.env.production.example)

**Comandos Docker/Coolify:**
→ [COMANDOS_COOLIFY.md](./COMANDOS_COOLIFY.md)

**Resolver problemas:**
→ [DEPLOY_PRODUCAO_GUIA_COMPLETO.md#troubleshooting](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md#troubleshooting)

**Automatizar o deploy:**
→ `./git-deploy.ps1`

---

## 📊 Matriz de Documentos

| Documento | Iniciante | Intermediário | Avançado | Tempo |
|-----------|-----------|---------------|----------|-------|
| README_DEPLOY.md | ✅ | ✅ | ✅ | 5 min |
| DEPLOY_RAPIDO.md | ✅ | ✅ | ⬜ | 5 min |
| DEPLOY_PRODUCAO_GUIA_COMPLETO.md | ✅ | ✅ | ✅ | 20 min |
| DEPLOY_RESUMO_EXECUTIVO.md | ✅ | ✅ | ✅ | 3 min |
| CHECKLIST_DEPLOY.md | ✅ | ✅ | ✅ | 15 min |
| COMANDOS_COOLIFY.md | ⬜ | ✅ | ✅ | Ref |
| Dockerfile | ⬜ | ✅ | ✅ | Ref |
| verificar-pre-deploy.js | ✅ | ✅ | ✅ | 1 min |
| git-deploy.ps1 | ✅ | ✅ | ⬜ | 2 min |

---

## 🎯 Cenários de Uso

### Cenário 1: Primeiro Deploy
1. Ler: [README_DEPLOY.md](./README_DEPLOY.md)
2. Seguir: [DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)
3. Usar: [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)

### Cenário 2: Deploy Rápido (já fez antes)
1. Executar: `node verificar-pre-deploy.js`
2. Seguir: [DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)
3. Verificar: Health check

### Cenário 3: Atualização de Produção
1. Executar: `./git-deploy.ps1`
2. Aguardar: Build no Coolify
3. Verificar: [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md) (Pós-Deploy)

### Cenário 4: Troubleshooting
1. Consultar: [COMANDOS_COOLIFY.md](./COMANDOS_COOLIFY.md)
2. Ver: [DEPLOY_PRODUCAO_GUIA_COMPLETO.md#troubleshooting](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md#troubleshooting)
3. Verificar: Logs do container

### Cenário 5: Configuração Inicial
1. Copiar: [.env.production.example](./.env.production.example)
2. Preencher: Variáveis de ambiente
3. Adicionar: No Coolify

---

## 🔗 Links Externos Úteis

### Documentação Oficial
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)
- [Coolify Documentation](https://coolify.io/docs)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Resend Documentation](https://resend.com/docs)

### Dashboards
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Resend Dashboard](https://resend.com/emails)

### Suporte
- [Stripe Support](https://support.stripe.com)
- [Cloudflare Support](https://support.cloudflare.com)
- [Resend Support](https://resend.com/support)

---

## 📝 Notas

- Todos os documentos estão em português
- Documentação atualizada em: 28/01/2026
- Versão da aplicação: Paper Bloom v1.0
- Plataforma de deploy: Coolify + Docker

---

## ✅ Status da Documentação

- ✅ Guias de deploy completos
- ✅ Checklists criados
- ✅ Scripts de automação prontos
- ✅ Comandos úteis documentados
- ✅ Troubleshooting extensivo
- ✅ Templates de configuração
- ✅ Exemplos práticos
- ✅ **DOCUMENTAÇÃO COMPLETA!**

---

## 🎉 Pronto para Deploy!

Escolha seu caminho:

- **Rápido:** [DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)
- **Completo:** [DEPLOY_PRODUCAO_GUIA_COMPLETO.md](./DEPLOY_PRODUCAO_GUIA_COMPLETO.md)
- **Automatizado:** `./git-deploy.ps1`

**Bom deploy! 🚀**
