# ✅ SOLUÇÃO: Email não chega após pagamento

## 🔍 Problema Identificado

O email não está chegando porque **o webhook do Stripe não está rodando**.

## ✅ O que está funcionando

- ✅ Resend configurado corretamente
- ✅ Código do webhook implementado
- ✅ Envio de email testado e funcionando
- ✅ Logs de debug adicionados

## ❌ O que está faltando

- ❌ Webhook listener do Stripe não está ativo
- ❌ Eventos do Stripe não estão chegando no servidor

## 🚀 SOLUÇÃO RÁPIDA (3 opções)

### Opção 1: Iniciar Webhook Automaticamente (RECOMENDADO)

```bash
.\iniciar-tudo.ps1
```

Este script irá:
- ✅ Verificar se o Stripe CLI está instalado
- ✅ Verificar se você está logado
- ✅ Liberar a porta 3000 se necessário
- ✅ Iniciar o servidor Next.js
- ✅ Iniciar o webhook listener
- ✅ Abrir 2 terminais automaticamente

### Opção 2: Iniciar Manualmente (2 Terminais)

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Opção 3: Enviar Emails das Mensagens Antigas

Se você já tem mensagens pagas que não receberam email:

```bash
node enviar-emails-pendentes.js
```

## 📋 Checklist Completo

### Antes de Testar
- [ ] Stripe CLI instalado (`stripe --version`)
- [ ] Logado no Stripe (`stripe login`)
- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Servidor Next.js rodando (`npm run dev`)
- [ ] Webhook listener rodando (`stripe listen...`)

### Durante o Teste
- [ ] Acessar http://localhost:3000/editor/mensagem
- [ ] Preencher TODOS os campos (especialmente o email!)
- [ ] Clicar em "Pagar"
- [ ] Usar cartão de teste: `4242 4242 4242 4242`
- [ ] Completar o pagamento

### Verificar Sucesso
- [ ] Terminal Next.js mostra: `[Webhook] ✅ Successfully sent QR code email`
- [ ] Terminal Stripe mostra: `[200] POST http://localhost:3000/api/checkout/webhook`
- [ ] Email chegou na caixa de entrada

## 🔧 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Iniciar Tudo | `.\iniciar-tudo.ps1` | Inicia servidor e webhook automaticamente |
| Testar Resend | `node testar-resend-config.js` | Testa configuração do Resend |
| Debug Webhook | `node debug-webhook-email.js` | Verifica mensagens e testa email |
| Enviar Pendentes | `node enviar-emails-pendentes.js` | Envia emails de mensagens antigas |
| Verificar Logs | `node verificar-webhook-logs.js` | Mostra configuração do webhook |

## 📝 Logs Esperados

### ✅ Sucesso (Terminal Next.js)
```
[Webhook] Starting email send process for message: abc-123...
[Webhook] Email delivery check: { finalEmail: 'usuario@email.com' }
[Webhook] Calling emailService.sendQRCodeEmail...
[EmailService] Attempting to send QR code email
[EmailService] Email sent successfully: { messageId: '...' }
[Webhook] ✅ Successfully sent QR code email
```

### ✅ Sucesso (Terminal Stripe)
```
2024-12-13 10:30:45   --> checkout.session.completed [evt_...]
2024-12-13 10:30:45  <--  [200] POST http://localhost:3000/api/checkout/webhook
```

### ❌ Problema: Email não preenchido
```
[Webhook] ⚠️ No contact email found for message abc-123
[Webhook] Available data: { sessionCustomerEmail: undefined, ... }
```

**Solução**: Preencher o campo de email no formulário

### ❌ Problema: Webhook não rodando
```
# Nenhum log aparece no terminal do Stripe
```

**Solução**: Executar `stripe listen --forward-to localhost:3000/api/checkout/webhook`

## 🎯 Teste Rápido (5 minutos)

1. **Iniciar** (1 min):
   ```bash
   .\iniciar-tudo.ps1
   ```

2. **Acessar** (1 min):
   - http://localhost:3000/editor/mensagem

3. **Preencher** (2 min):
   - Nome do remetente: Seu Nome
   - Nome do destinatário: Nome do Destinatário
   - Título: Teste
   - Mensagem: Mensagem de teste
   - **Email de contato: seu@email.com** ← IMPORTANTE!
   - Foto: qualquer imagem
   - Música: qualquer URL do YouTube

4. **Pagar** (1 min):
   - Cartão: 4242 4242 4242 4242
   - Data: 12/25
   - CVC: 123

5. **Verificar**:
   - Logs nos terminais
   - Email na caixa de entrada

## 🆘 Troubleshooting

### "stripe: command not found"
```bash
# Windows (com Scoop)
scoop install stripe

# Ou baixe de: https://stripe.com/docs/stripe-cli
```

### "Port 3000 already in use"
```bash
# Mate o processo
netstat -ano | findstr :3000
taskkill /PID [número] /F
```

### Webhook não recebe eventos
```bash
# Verifique login
stripe login

# Teste manualmente
stripe trigger checkout.session.completed
```

### Email não chega
1. Verifique se preencheu o email no formulário
2. Verifique logs: `[Webhook] Email delivery check`
3. Teste Resend: `node testar-resend-config.js`
4. Verifique spam/lixeira

## 📚 Documentação Completa

- `SOLUCAO_EMAIL_WEBHOOK.md` - Diagnóstico completo
- `INICIAR_WEBHOOK_AGORA.md` - Guia passo a passo
- `README.md` - Documentação geral do projeto

## 🎉 Próximos Passos

1. **Agora**: Execute `.\iniciar-tudo.ps1`
2. **Teste**: Faça um pagamento completo
3. **Emails antigos**: Execute `node enviar-emails-pendentes.js`
4. **Produção**: Configure webhook no Stripe Dashboard

---

**Dúvidas?** Verifique os logs nos terminais ou execute os scripts de debug.
