# Como Iniciar o Webhook AGORA

## Passo a Passo Rápido

### 1. Abra 2 Terminais

#### Terminal 1: Servidor Next.js
```bash
npm run dev
```

Aguarde até ver:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

#### Terminal 2: Stripe Webhook
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

Aguarde até ver:
```
Ready! You are using Stripe API Version [...]
> Ready! Your webhook signing secret is whsec_... (^C to quit)
```

### 2. Faça um Pagamento de Teste

1. Acesse: http://localhost:3000/editor/mensagem
2. Preencha o formulário (incluindo email de contato!)
3. Clique em "Pagar"
4. Use cartão de teste: `4242 4242 4242 4242`
5. Data: qualquer data futura
6. CVC: qualquer 3 dígitos

### 3. Verifique os Logs

**Terminal 1 (Next.js)** deve mostrar:
```
[Webhook] Starting email send process for message: ...
[Webhook] Email delivery check: { finalEmail: '...' }
[Webhook] Calling emailService.sendQRCodeEmail...
[EmailService] Attempting to send QR code email: ...
[EmailService] Email sent successfully: { messageId: '...' }
[Webhook] ✅ Successfully sent QR code email for message ...
```

**Terminal 2 (Stripe)** deve mostrar:
```
2024-12-13 10:30:45   --> checkout.session.completed [evt_...]
2024-12-13 10:30:45  <--  [200] POST http://localhost:3000/api/checkout/webhook
```

### 4. Verifique o Email

- Abra sua caixa de entrada
- Procure por email de: Paper Bloom <noreply@email.paperbloom.com.br>
- Assunto: "Sua mensagem especial para [nome] está pronta! 🎁"

## Se o Email Não Chegar

### Verificação 1: Webhook está rodando?
```bash
# No terminal do Stripe CLI, você deve ver:
> Ready! Your webhook signing secret is whsec_...
```

Se não estiver, execute:
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Verificação 2: Email foi preenchido?
Verifique nos logs do Next.js:
```
[Webhook] Email delivery check: { finalEmail: 'seu@email.com' }
```

Se aparecer `finalEmail: undefined`, o email não foi preenchido no formulário.

### Verificação 3: Resend está funcionando?
```bash
node testar-resend-config.js
```

Deve mostrar:
```
✅ Email de teste enviado com sucesso!
```

### Verificação 4: Enviar manualmente
Se já tem mensagens pagas sem email:
```bash
node enviar-emails-pendentes.js
```

## Comandos Úteis

### Parar tudo
- Terminal 1: `Ctrl + C`
- Terminal 2: `Ctrl + C`

### Reiniciar
```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Ver mensagens no banco
```bash
node debug-webhook-email.js
```

### Enviar emails pendentes
```bash
node enviar-emails-pendentes.js
```

## Troubleshooting

### "stripe: command not found"
Instale o Stripe CLI:
```bash
# Windows (com Scoop)
scoop install stripe

# Ou baixe de: https://stripe.com/docs/stripe-cli
```

### "Port 3000 already in use"
Mate o processo:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Ou use outra porta
PORT=3001 npm run dev
```

### Webhook não recebe eventos
1. Verifique se o Stripe CLI está logado:
   ```bash
   stripe login
   ```

2. Verifique se está usando a conta correta:
   ```bash
   stripe config --list
   ```

3. Teste manualmente:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Status Atual

✅ Resend configurado e funcionando
✅ Código do webhook correto
✅ Logs de debug adicionados
⚠️ Webhook precisa estar rodando para funcionar

## Próximos Passos

1. **Agora**: Inicie os 2 terminais conforme acima
2. **Teste**: Faça um pagamento e verifique os logs
3. **Emails antigos**: Execute `node enviar-emails-pendentes.js`
4. **Produção**: Configure webhook no Stripe Dashboard
