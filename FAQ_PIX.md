# ❓ FAQ - Perguntas Frequentes sobre PIX

## 🎯 Geral

### O que foi implementado?
Suporte completo ao PIX como método de pagamento via Stripe, mantendo 100% de compatibilidade com pagamentos por cartão.

### Preciso mudar algo no frontend?
**Não!** O Stripe Checkout cuida de toda a interface automaticamente. Zero mudanças necessárias.

### O pagamento por cartão ainda funciona?
**Sim!** Cartão continua funcionando exatamente como antes. PIX é uma opção adicional.

### Quanto tempo levou para implementar?
Aproximadamente 4 horas (código + testes + documentação).

## 💰 Custos e Taxas

### Quanto custa o PIX?
- **PIX**: 1.4% + R$ 0,40 por transação
- **Cartão**: 3.99% + R$ 0,40 por transação
- **Economia**: ~48% nas taxas

### Quanto vou economizar?
Para 100 transações de R$ 29,99:
- **Cartão**: R$ 160,00 em taxas
- **PIX**: R$ 82,00 em taxas
- **Economia**: R$ 78,00 (48%)

Se 50% escolherem PIX: ~R$ 39,00/mês de economia

### Há custo adicional para ativar PIX?
**Não!** Nenhum custo adicional. Apenas as taxas por transação.

## 🔧 Técnico

### Quais arquivos foram modificados?
Apenas 2 arquivos:
1. `src/services/StripeService.ts` (+24 linhas)
2. `src/app/api/checkout/webhook/route.ts` (+150 linhas)

### Houve breaking changes?
**Não!** Zero breaking changes. Tudo é retrocompatível.

### Preciso atualizar dependências?
**Não!** Usamos a mesma versão do Stripe SDK.

### Como funciona tecnicamente?
1. Stripe gera QR code PIX
2. Cliente paga no app do banco
3. Stripe envia evento `async_payment_succeeded`
4. Sistema processa e envia email

### Quais eventos do Stripe são usados?
- `checkout.session.completed` - QR code gerado
- `checkout.session.async_payment_succeeded` - Pagamento confirmado
- `checkout.session.async_payment_failed` - Pagamento falhou

## 🧪 Testes

### Como testar em desenvolvimento?
```powershell
# Terminal 1
npm run dev

# Terminal 2
.\iniciar-webhook.ps1

# Terminal 3
node testar-pix.js
```

### Como simular pagamento PIX?
```powershell
stripe trigger checkout.session.async_payment_succeeded
```

### Como testar em produção?
1. Ativar PIX no Stripe Dashboard
2. Fazer pagamento real de R$ 0,50
3. Verificar email e logs

### Preciso do Stripe CLI?
**Sim**, apenas para testes em desenvolvimento. Em produção não é necessário.

## 🚀 Ativação

### Como ativar PIX em produção?
1. Ativar PIX no Stripe Dashboard
2. Configurar conta bancária brasileira
3. Verificar webhook
4. Testar com pagamento real

Detalhes: [ATIVAR_PIX_CHECKLIST.md](ATIVAR_PIX_CHECKLIST.md)

### Quanto tempo leva para ativar?
Aproximadamente 30 minutos (se conta bancária já estiver verificada).

### Preciso de conta bancária brasileira?
**Sim!** O Stripe precisa de uma conta brasileira para transferir os valores recebidos via PIX.

### Posso usar conta PJ ou PF?
Ambas funcionam, mas verifique os requisitos do Stripe para cada tipo.

## ⏱️ Tempo e Expiração

### Quanto tempo o PIX leva para confirmar?
Geralmente instantâneo (5-30 segundos após pagamento).

### O PIX expira?
**Sim**, após 1 hora (máximo permitido pelo Stripe).

### O que acontece se o PIX expirar?
O cliente pode gerar um novo QR code ou escolher pagar com cartão.

### Posso mudar o tempo de expiração?
Sim, mas o máximo é 1 hora (3600 segundos). Configurado em `StripeService.ts`.

## 📧 Email

### Quando o email é enviado?
- **Cartão**: Imediatamente após aprovação
- **PIX**: Após confirmação do pagamento (5-30 segundos)

### E se o email não for enviado?
O sistema loga o erro mas não bloqueia o webhook. O cliente ainda pode acessar a mensagem pelo link.

### Como verificar se o email foi enviado?
Procure nos logs por `[Webhook PIX] ✅ Successfully sent QR code email`

## 🐛 Problemas

### PIX não aparece no checkout
**Causas possíveis**:
- PIX não ativado no Stripe Dashboard
- Código não atualizado em produção
- Moeda diferente de BRL

**Solução**: Verificar [ATIVAR_PIX_CHECKLIST.md](ATIVAR_PIX_CHECKLIST.md)

### Webhook não recebe eventos
**Causas possíveis**:
- Webhook não está rodando
- URL incorreta
- Eventos não selecionados no Dashboard

**Solução**: Verificar [COMANDOS_PIX.md](COMANDOS_PIX.md) - Debug

### Pagamento não é processado
**Causas possíveis**:
- messageId não está no metadata
- Erro no processamento
- Webhook signature inválida

**Solução**: Verificar logs com `[Webhook PIX]`

### Email não é enviado
**Causas possíveis**:
- Email não está no metadata
- Erro no serviço de email
- QR code não foi gerado

**Solução**: Verificar logs detalhados

## 🌍 Disponibilidade

### PIX funciona fora do Brasil?
**Não**. PIX é exclusivo do Brasil. Clientes internacionais devem usar cartão.

### Posso aceitar PIX de qualquer banco?
**Sim!** Todos os bancos brasileiros suportam PIX.

### Funciona 24/7?
**Sim!** PIX funciona 24 horas, 7 dias por semana, incluindo feriados.

## 📊 Métricas

### Como monitorar pagamentos PIX?
- Logs do webhook: `[Webhook PIX]`
- Stripe Dashboard: https://dashboard.stripe.com/events
- Banco de dados: status da mensagem

### Quais métricas devo acompanhar?
- Taxa de conversão PIX vs Cartão
- Taxa de expiração
- Tempo médio de confirmação
- Economia em taxas

### Como ver relatórios?
No Stripe Dashboard: https://dashboard.stripe.com/reports

## 🔒 Segurança

### PIX é seguro?
**Sim!** Mais seguro que cartão:
- Sem compartilhamento de dados sensíveis
- Autenticação no app do banco
- Confirmação instantânea
- Sem risco de chargeback

### Como o Stripe valida o webhook?
Via signature verification usando `STRIPE_WEBHOOK_SECRET`.

### Posso confiar nos eventos do Stripe?
**Sim**, desde que a signature seja validada (já implementado).

## 💡 Otimizações

### Posso oferecer desconto para PIX?
**Sim!** Você pode criar preços diferentes no Stripe ou aplicar desconto no checkout.

### Posso notificar quando o PIX expirar?
**Sim**, você pode implementar isso capturando o evento `async_payment_failed`.

### Posso permitir retry de PIX expirado?
**Sim**, basta gerar um novo checkout session.

### Posso adicionar analytics?
**Sim**, você pode adicionar tracking de qual método foi escolhido.

## 📱 Experiência do Usuário

### O usuário precisa fazer algo diferente?
**Não!** O Stripe Checkout mostra automaticamente a opção PIX.

### Como o usuário paga?
1. Escolhe PIX no checkout
2. Escaneia QR code com app do banco
3. Confirma pagamento
4. Recebe email com a mensagem

### E se o usuário não tiver app bancário?
Pode copiar o código "Pix Copia e Cola" e colar no internet banking.

### Funciona em mobile?
**Sim!** Totalmente responsivo. Em alguns casos, abre direto no app do banco.

## 🎯 Estratégia

### Devo anunciar o PIX?
**Sim!** É um diferencial competitivo importante no Brasil.

### Como anunciar?
- Banner no site: "Agora aceitamos PIX!"
- Email marketing
- Redes sociais
- Durante o checkout (automático)

### Devo fazer soft launch?
Recomendado. Teste com alguns usuários antes de anunciar amplamente.

### Quando lançar?
Após testar em produção e confirmar que tudo funciona.

## 📚 Documentação

### Onde encontro mais informações?
- [LEIA_ME_PIX.md](LEIA_ME_PIX.md) - Início
- [INDICE_PIX.md](INDICE_PIX.md) - Índice completo
- [IMPLEMENTACAO_PIX.md](IMPLEMENTACAO_PIX.md) - Detalhes técnicos

### Há exemplos de código?
**Sim!** Veja `testar-pix.js` para exemplo completo.

### Há guia de comandos?
**Sim!** Veja [COMANDOS_PIX.md](COMANDOS_PIX.md).

### Há checklist de ativação?
**Sim!** Veja [ATIVAR_PIX_CHECKLIST.md](ATIVAR_PIX_CHECKLIST.md).

## 🆘 Suporte

### Onde buscar ajuda?
1. Documentação neste repositório
2. Logs do sistema (`[Webhook PIX]`)
3. Stripe Dashboard
4. Documentação oficial do Stripe

### Como reportar problemas?
1. Verificar logs
2. Consultar troubleshooting
3. Verificar Stripe Dashboard
4. Contatar suporte do Stripe se necessário

### Stripe tem suporte em português?
**Sim!** O Stripe tem suporte em português para contas brasileiras.

## 🎉 Próximos Passos

### O que fazer agora?
1. Ler [INICIO_RAPIDO_PIX.md](INICIO_RAPIDO_PIX.md)
2. Testar em desenvolvimento
3. Seguir [ATIVAR_PIX_CHECKLIST.md](ATIVAR_PIX_CHECKLIST.md)
4. Ativar em produção
5. Monitorar e otimizar

### Há melhorias futuras planejadas?
Possíveis melhorias:
- Desconto para PIX
- Notificação de expiração
- Retry automático
- Analytics detalhado

### Como contribuir?
Sugestões e melhorias são bem-vindas! Documente e teste antes de implementar.

---

**Não encontrou sua pergunta?** Consulte [INDICE_PIX.md](INDICE_PIX.md) para mais documentação.
