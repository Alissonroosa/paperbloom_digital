# ✅ Checklist de Deploy - Paper Bloom

## 📋 Pré-Deploy

### Código
- [ ] Todos os testes passando localmente
- [ ] Build local funcionando (`npm run build`)
- [ ] Sem erros no console
- [ ] Sem warnings críticos

### Arquivos
- [ ] `Dockerfile` criado
- [ ] `.dockerignore` criado
- [ ] `next.config.mjs` com `output: 'standalone'`
- [ ] Health check endpoint criado
- [ ] `.env.production.example` preenchido

### Verificação
- [ ] Executar: `node verificar-pre-deploy.js`
- [ ] Resultado: ✅ PRONTO PARA DEPLOY

---

## 🔐 Credenciais de Produção

### Stripe (PRODUÇÃO)
- [ ] `STRIPE_SECRET_KEY` (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- [ ] Webhook configurado no Dashboard

### Banco de Dados
- [ ] PostgreSQL criado na VPS
- [ ] `DATABASE_URL` configurado
- [ ] Conexão testada
- [ ] Migrations executadas

### Cloudflare R2
- [ ] Bucket criado
- [ ] API Token criado
- [ ] Domínio customizado configurado (opcional)
- [ ] CORS configurado
- [ ] Todas as variáveis R2 preenchidas

### Resend
- [ ] Conta criada
- [ ] Domínio verificado
- [ ] API Key gerada
- [ ] Email de envio configurado

### Domínio
- [ ] DNS apontando para VPS
- [ ] SSL configurado (Let's Encrypt)
- [ ] Subdomínio para imagens (opcional)

---

## 🚀 Deploy no Coolify

### Configuração Inicial
- [ ] Novo Resource criado
- [ ] Tipo: Application
- [ ] Source: GitHub
- [ ] Repositório selecionado
- [ ] Branch: `main`

### Build Settings
- [ ] Build Type: **Dockerfile**
- [ ] Dockerfile Path: `./Dockerfile`
- [ ] Port: **3000**
- [ ] Protocol: HTTP

### Domain
- [ ] Domain configurado
- [ ] SSL habilitado
- [ ] Redirecionamento HTTP → HTTPS

### Environment Variables
- [ ] Todas as variáveis adicionadas
- [ ] Valores de PRODUÇÃO (não de teste)
- [ ] Sem espaços extras
- [ ] Sem aspas desnecessárias

### Deploy
- [ ] Clicar em "Deploy"
- [ ] Aguardar build (5-10 min)
- [ ] Build concluído com sucesso
- [ ] Container rodando

---

## 🔍 Verificações Pós-Deploy

### Health Check
- [ ] `curl https://seu-dominio.com.br/api/health`
- [ ] Retorna: `{"status":"healthy"}`
- [ ] Status code: 200

### Homepage
- [ ] Acessar: `https://seu-dominio.com.br`
- [ ] Página carrega corretamente
- [ ] Sem erros no console
- [ ] SSL funcionando (cadeado verde)

### Funcionalidades
- [ ] Upload de imagens funciona
- [ ] Imagens aparecem corretamente
- [ ] Checkout Stripe funciona
- [ ] Webhook Stripe recebe eventos
- [ ] Emails são enviados
- [ ] QR codes são gerados
- [ ] Páginas de visualização funcionam

### Logs
- [ ] Sem erros críticos nos logs
- [ ] Conexão com banco OK
- [ ] Conexão com R2 OK
- [ ] Conexão com Stripe OK
- [ ] Conexão com Resend OK

---

## 🔧 Configurações Finais

### Stripe Webhook
- [ ] Acessar: https://dashboard.stripe.com/webhooks
- [ ] Adicionar endpoint: `https://seu-dominio.com.br/api/checkout/webhook`
- [ ] Eventos selecionados:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
- [ ] Webhook Secret copiado
- [ ] Webhook Secret atualizado no Coolify
- [ ] Teste realizado: `stripe trigger checkout.session.completed`

### Monitoramento
- [ ] Health check configurado
- [ ] Alertas de downtime configurados
- [ ] Logs sendo monitorados
- [ ] Métricas de performance configuradas

### Backups
- [ ] Backup automático do banco configurado
- [ ] Backup das imagens R2 configurado
- [ ] Procedimento de restore documentado

### Segurança
- [ ] Firewall configurado
- [ ] Apenas portas necessárias abertas
- [ ] SSL/TLS funcionando
- [ ] Headers de segurança configurados
- [ ] Rate limiting configurado (opcional)

---

## 🧪 Testes de Produção

### Fluxo Completo
- [ ] Criar nova mensagem
- [ ] Upload de fotos
- [ ] Selecionar tema
- [ ] Adicionar música
- [ ] Ir para checkout
- [ ] Pagar com Stripe (teste real)
- [ ] Receber email de confirmação
- [ ] Acessar link da mensagem
- [ ] Visualizar mensagem completa

### Testes de Carga (Opcional)
- [ ] Múltiplos usuários simultâneos
- [ ] Upload de múltiplas imagens
- [ ] Tempo de resposta aceitável
- [ ] Sem erros de memória

---

## 📊 Métricas de Sucesso

### Performance
- [ ] Tempo de carregamento < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Lighthouse Score > 90

### Disponibilidade
- [ ] Uptime > 99.9%
- [ ] Health check sempre verde
- [ ] Sem erros 500

### Funcionalidade
- [ ] Taxa de sucesso de pagamentos > 95%
- [ ] Taxa de entrega de emails > 98%
- [ ] Taxa de sucesso de uploads > 99%

---

## 📝 Documentação

### Documentar
- [ ] URL de produção
- [ ] Credenciais (em local seguro)
- [ ] Procedimentos de deploy
- [ ] Procedimentos de rollback
- [ ] Contatos de suporte
- [ ] Runbook de incidentes

### Compartilhar
- [ ] Equipe informada sobre deploy
- [ ] Documentação acessível
- [ ] Procedimentos de emergência claros

---

## 🎉 Go Live!

### Anúncio
- [ ] Stakeholders informados
- [ ] Usuários notificados (se aplicável)
- [ ] Marketing informado

### Monitoramento Ativo
- [ ] Primeira hora: monitoramento constante
- [ ] Primeiro dia: verificações frequentes
- [ ] Primeira semana: monitoramento diário

### Feedback
- [ ] Coletar feedback de usuários
- [ ] Monitorar métricas de uso
- [ ] Identificar melhorias

---

## 🆘 Plano de Contingência

### Se algo der errado:

1. **Rollback Imediato**
   - [ ] Coolify → Deployments → Versão anterior
   - [ ] Redeploy

2. **Investigar**
   - [ ] Verificar logs: `docker logs <container-id>`
   - [ ] Verificar health check
   - [ ] Verificar variáveis de ambiente

3. **Corrigir**
   - [ ] Identificar problema
   - [ ] Aplicar correção
   - [ ] Testar localmente
   - [ ] Redeploy

4. **Comunicar**
   - [ ] Informar stakeholders
   - [ ] Atualizar status
   - [ ] Documentar incidente

---

## 📞 Contatos de Emergência

- **Coolify Support:** [link do suporte]
- **Stripe Support:** https://support.stripe.com
- **Cloudflare Support:** https://support.cloudflare.com
- **Resend Support:** https://resend.com/support

---

## ✅ Deploy Concluído!

Data: ___/___/______
Hora: ___:___
Responsável: _________________
Status: ⬜ Sucesso ⬜ Com problemas ⬜ Falhou

Observações:
_________________________________________________
___________________________