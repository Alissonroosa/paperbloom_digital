# ⚡ Comandos Rápidos - Paper Bloom

## 🚀 Iniciar Sistema

### Opção 1: Automático (Recomendado)
```powershell
.\iniciar-tudo.ps1
```
Inicia servidor Next.js e Stripe webhook automaticamente.

### Opção 2: Manual
```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

## 📧 Enviar Emails Pendentes

```bash
node enviar-emails-pendentes.js
```
Envia emails para todas as mensagens pagas que têm email cadastrado.

## 🔍 Diagnóstico

### Verificar Todo o Sistema
```bash
node diagnostico-completo.js
```
Verifica:
- Variáveis de ambiente
- Banco de dados
- Resend
- Servidor Next.js
- Stripe CLI

### Verificar Método de Pagamento
```bash
node verificar-metodo-pagamento.js
```
Mostra como cada mensagem foi paga (API de teste vs Webhook).

### Verificar Segurança
```bash
node testar-seguranca-pagamento.js
```
Testa se mensagens pendentes estão protegidas.

### Debug de Mensagens
```bash
node debug-webhook-email.js
```
Lista mensagens pagas e testa envio de email.

## 🧪 Testes

### Testar Resend
```bash
node testar-resend-config.js
```
Verifica configuração e envia email de teste.

### Testar Webhook Manualmente
```bash
stripe trigger checkout.session.completed
```
Dispara um evento de teste do Stripe.

## 📊 Consultas Úteis

### Ver Mensagens Pagas
```bash
node -e "const { Pool } = require('pg'); require('dotenv').config({ path: '.env.local' }); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT id, sender_name, recipient_name, contact_email, status FROM messages WHERE status = \\'paid\\' ORDER BY created_at DESC LIMIT 10').then(r => { console.table(r.rows); pool.end(); });"
```

### Ver Mensagens Pendentes
```bash
node -e "const { Pool } = require('pg'); require('dotenv').config({ path: '.env.local' }); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT id, sender_name, recipient_name, status FROM messages WHERE status = \\'pending\\' ORDER BY created_at DESC LIMIT 10').then(r => { console.table(r.rows); pool.end(); });"
```

## 🔧 Manutenção

### Limpar Cache do Next.js
```bash
rm -rf .next
npm run dev
```

### Reinstalar Dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Verificar Logs do Stripe
```bash
stripe logs tail
```

## 🌐 URLs Importantes

### Desenvolvimento
- **App**: http://localhost:3000
- **Editor**: http://localhost:3000/editor/mensagem
- **API Health**: http://localhost:3000/api/health

### Stripe
- **Dashboard**: https://dashboard.stripe.com/test
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Eventos**: https://dashboard.stripe.com/test/events
- **Pagamentos**: https://dashboard.stripe.com/test/payments

### Resend
- **Dashboard**: https://resend.com/emails
- **API Keys**: https://resend.com/api-keys
- **Domínios**: https://resend.com/domains

## 🎯 Fluxo de Teste Completo

```bash
# 1. Iniciar sistema
.\iniciar-tudo.ps1

# 2. Aguardar 5 segundos

# 3. Abrir navegador
start http://localhost:3000/editor/mensagem

# 4. Preencher formulário (não esquecer email no Step 7!)

# 5. Usar cartão de teste: 4242 4242 4242 4242

# 6. Verificar logs nos terminais

# 7. Verificar email
```

## 📝 Cartões de Teste do Stripe

| Cartão | Resultado |
|--------|-----------|
| 4242 4242 4242 4242 | ✅ Sucesso |
| 4000 0000 0000 0002 | ❌ Recusado |
| 4000 0000 0000 9995 | ⏳ Requer autenticação |

**Data**: Qualquer data futura (ex: 12/25)  
**CVC**: Qualquer 3 dígitos (ex: 123)  
**CEP**: Qualquer (ex: 12345)

## 🆘 Troubleshooting Rápido

### Email não chega
```bash
# 1. Verificar se webhook está rodando
# Deve aparecer no terminal: "Ready! Your webhook signing secret is..."

# 2. Verificar logs do webhook
# Deve aparecer: "[Webhook] ✅ Successfully sent QR code email"

# 3. Verificar Resend
node testar-resend-config.js

# 4. Verificar spam
# Procurar por: noreply@email.paperbloom.com.br
```

### Stripe CLI não funciona
```bash
# 1. Verificar instalação
stripe --version

# 2. Fazer login
stripe login

# 3. Verificar configuração
stripe config --list

# 4. Testar webhook
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Servidor não inicia
```bash
# 1. Verificar porta
netstat -ano | findstr :3000

# 2. Matar processo
taskkill /PID [número] /F

# 3. Limpar cache
rm -rf .next

# 4. Reiniciar
npm run dev
```

## 📚 Documentação

- `RESUMO_PROBLEMA_EMAIL.md` - Resumo executivo
- `FLUXO_EMAIL_COMPLETO.md` - Fluxo detalhado
- `RESOLVER_EMAIL_AGORA.md` - Guia rápido
- `INICIAR_WEBHOOK_AGORA.md` - Como iniciar webhook
- `PROBLEMA_EMAIL_RESOLVIDO.md` - Diagnóstico completo

## 💡 Dicas

1. **Sempre inicie o Stripe CLI antes de testar pagamentos**
2. **Verifique os logs nos 2 terminais**
3. **Preencha o email no Step 7 do formulário**
4. **Use os scripts de diagnóstico quando tiver dúvidas**
5. **Verifique a pasta de spam se o email não chegar**

---

**Atalho Rápido**: `.\iniciar-tudo.ps1` → Aguardar 5s → Testar pagamento
