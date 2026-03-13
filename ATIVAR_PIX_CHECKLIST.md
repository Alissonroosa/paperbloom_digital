# ✅ Checklist para Ativar PIX

## 📋 Pré-requisitos

- [ ] Conta Stripe ativa
- [ ] Aplicação rodando em produção
- [ ] Webhook configurado e funcionando
- [ ] Código atualizado com suporte a PIX (✅ já feito!)

## 🔧 Configuração no Stripe Dashboard

### 1. Ativar PIX como método de pagamento

- [ ] Acessar: https://dashboard.stripe.com/settings/payment_methods
- [ ] Encontrar "PIX" na lista
- [ ] Clicar em "Enable" (Ativar)
- [ ] Confirmar ativação

### 2. Configurar conta bancária brasileira

- [ ] Acessar: https://dashboard.stripe.com/settings/payouts
- [ ] Clicar em "Add bank account"
- [ ] Selecionar "Brazil"
- [ ] Preencher dados bancários:
  - [ ] Nome do banco
  - [ ] Agência
  - [ ] Conta
  - [ ] Tipo de conta (Corrente/Poupança)
  - [ ] CPF/CNPJ
- [ ] Verificar conta (pode levar 1-2 dias úteis)

### 3. Verificar webhook em produção

- [ ] Acessar: https://dashboard.stripe.com/webhooks
- [ ] Verificar se endpoint está configurado: `https://seu-dominio.com/api/checkout/webhook`
- [ ] Confirmar eventos selecionados:
  - [ ] `checkout.session.completed`
  - [ ] `checkout.session.async_payment_succeeded`
  - [ ] `checkout.session.async_payment_failed`
- [ ] Verificar que webhook está "Active"

### 4. Configurar variáveis de ambiente

- [ ] Verificar `.env.local` ou `.env.production`:
  ```
  STRIPE_SECRET_KEY=sk_live_xxxxx (não sk_test_!)
  STRIPE_WEBHOOK_SECRET=whsec_xxxxx
  NEXT_PUBLIC_BASE_URL=https://seu-dominio.com
  ```

## 🧪 Testes

### Teste em ambiente de desenvolvimento

- [ ] Iniciar aplicação: `npm run dev`
- [ ] Iniciar webhook: `.\iniciar-webhook.ps1`
- [ ] Executar teste: `node testar-pix.js`
- [ ] Simular pagamento: `stripe trigger checkout.session.async_payment_succeeded`
- [ ] Verificar logs do webhook
- [ ] Confirmar email enviado

### Teste em produção (com valor baixo)

- [ ] Acessar site em produção
- [ ] Criar mensagem de teste
- [ ] Ir para checkout
- [ ] Selecionar PIX
- [ ] Verificar se QR code é exibido
- [ ] Escanear QR code com app bancário
- [ ] Fazer pagamento de teste (R$ 0,50 ou R$ 1,00)
- [ ] Aguardar confirmação (geralmente instantâneo)
- [ ] Verificar se email foi recebido
- [ ] Verificar se mensagem está acessível
- [ ] Verificar logs no servidor

## 📊 Monitoramento pós-ativação

### Primeiras 24 horas

- [ ] Monitorar logs do webhook
- [ ] Verificar eventos no Stripe Dashboard
- [ ] Confirmar que emails estão sendo enviados
- [ ] Verificar taxa de conversão PIX vs Cartão
- [ ] Monitorar tempo de confirmação de pagamentos

### Primeira semana

- [ ] Analisar taxa de abandono no checkout
- [ ] Verificar se há pagamentos expirados (1 hora)
- [ ] Coletar feedback dos usuários
- [ ] Comparar taxas: PIX vs Cartão
- [ ] Verificar se há erros nos logs

## 🐛 Troubleshooting

### PIX não aparece no checkout

- [ ] Verificar se PIX está ativado no Dashboard
- [ ] Confirmar que código está atualizado em produção
- [ ] Verificar se moeda é BRL
- [ ] Limpar cache do navegador

### Pagamento não é processado

- [ ] Verificar logs do webhook
- [ ] Confirmar que evento `async_payment_succeeded` foi recebido
- [ ] Verificar se messageId está no metadata
- [ ] Testar webhook manualmente com Stripe CLI

### Email não é enviado

- [ ] Verificar logs com `[Webhook PIX]`
- [ ] Confirmar que email está no metadata da session
- [ ] Verificar configuração do Resend
- [ ] Testar envio de email manualmente

### Webhook não recebe eventos

- [ ] Verificar URL do webhook no Dashboard
- [ ] Confirmar que webhook secret está correto
- [ ] Testar com `stripe trigger` em desenvolvimento
- [ ] Verificar firewall/proxy em produção

## 📈 Métricas para acompanhar

- [ ] Taxa de conversão PIX vs Cartão
- [ ] Tempo médio de confirmação de pagamento
- [ ] Taxa de abandono no checkout
- [ ] Taxa de expiração de PIX (1 hora)
- [ ] Economia em taxas de transação
- [ ] Feedback dos usuários

## 🎯 Otimizações futuras (opcional)

- [ ] Adicionar notificação de expiração de PIX
- [ ] Implementar retry automático para PIX expirado
- [ ] Adicionar analytics de método de pagamento preferido
- [ ] Criar dashboard de métricas de pagamento
- [ ] Implementar desconto para pagamento via PIX
- [ ] Adicionar opção de lembrete de pagamento pendente

## ✅ Checklist de lançamento

Antes de anunciar PIX para os usuários:

- [ ] Todos os testes passaram
- [ ] Webhook está funcionando em produção
- [ ] Email está sendo enviado corretamente
- [ ] Logs estão sendo monitorados
- [ ] Equipe está ciente do novo método
- [ ] Documentação está atualizada
- [ ] Suporte está preparado para dúvidas

## 🎉 Pronto para lançar!

Quando todos os itens estiverem marcados, você está pronto para aceitar pagamentos via PIX!

---

**Dica**: Comece com um soft launch (anúncio discreto) e monitore por alguns dias antes de fazer um anúncio maior.
