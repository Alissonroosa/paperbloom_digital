# ✅ Fluxo Automático Configurado

## O que foi feito

### 1. API de Checkout Atualizada
**Arquivo**: `src/app/api/checkout/create-session/route.ts`

Agora aceita informações de contato opcionais:
```typescript
{
  messageId: string,
  contactName?: string,
  contactEmail?: string,
  contactPhone?: string
}
```

Essas informações são passadas para o Stripe e ficam disponíveis no webhook.

### 2. Webhook Já Configurado
**Arquivo**: `src/app/api/checkout/webhook/route.ts`

O webhook já estava pronto e faz tudo automaticamente:
- ✅ Atualiza status para 'paid'
- ✅ Gera slug da mensagem
- ✅ Gera QR Code
- ✅ Lê QR Code e converte para base64
- ✅ Envia email com QR Code
- ✅ Registra logs de sucesso/erro

### 3. API da Mensagem Pública Criada
**Arquivo**: `src/app/api/messages/mensagem/[recipient]/[id]/route.ts`

Permite que a mensagem seja acessada publicamente após o pagamento.

## Como Funciona Agora

### Fluxo Automático Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário preenche wizard (7 passos)                       │
│    - Inclui nome, email e telefone no passo 7               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Clica em "Prosseguir para Pagamento"                     │
│    - Mensagem criada no banco (status: pending)             │
│    - Sessão do Stripe criada (com contactInfo)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Usuário paga no Stripe Checkout                          │
│    - Cartão de teste: 4242 4242 4242 4242                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Stripe envia webhook (AUTOMÁTICO)                        │
│    POST /api/checkout/webhook                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Webhook processa (AUTOMÁTICO)                            │
│    ✅ Status → 'paid'                                        │
│    ✅ Gera slug: /mensagem/nome/uuid                         │
│    ✅ Gera QR Code: /qr-codes/uuid.png                       │
│    ✅ Lê QR Code e converte para base64                      │
│    ✅ Envia email com QR Code                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Stripe redireciona (AUTOMÁTICO)                          │
│    → /success?session_id=xxx                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Página success redireciona (AUTOMÁTICO)                  │
│    → /delivery/[messageId]                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Usuário vê página de delivery                            │
│    ✅ Preview completo da mensagem                           │
│    ✅ QR Code                                                │
│    ✅ Link compartilhável                                    │
│    ✅ Confirmação: "Email enviado com sucesso!"              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Email chega na caixa de entrada                          │
│    ✅ QR Code anexado                                        │
│    ✅ Link da mensagem                                       │
│    ✅ Instruções de compartilhamento                         │
└─────────────────────────────────────────────────────────────┘
```

## Configuração Necessária

### 1. Variáveis de Ambiente

Crie/atualize `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Paper Bloom

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Stripe CLI

```bash
# Instalar
scoop install stripe  # Windows
brew install stripe/stripe-cli/stripe  # macOS

# Login
stripe login

# Iniciar webhook forwarding
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

**IMPORTANTE**: Copie o `whsec_` que aparece e adicione no `.env.local`

### 3. Resend API Key

1. Acesse: https://resend.com/api-keys
2. Crie uma conta
3. Crie uma API key
4. Adicione no `.env.local`

**Para testes**, use: `onboarding@resend.dev` (não precisa verificar)

### 4. Reiniciar Servidor

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

## Como Testar

### Teste Completo (Recomendado)

1. **Inicie o webhook forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/checkout/webhook
   ```

2. **Acesse o editor**:
   ```
   http://localhost:3000/editor/mensagem
   ```

3. **Preencha todos os 7 passos**:
   - Passo 7: Use seu email real para receber o QR Code

4. **Clique em "Prosseguir para Pagamento"**

5. **Pague com cartão de teste**:
   - Número: `4242 4242 4242 4242`
   - Data: `12/25`
   - CVC: `123`

6. **Aguarde o processamento**:
   - Veja os logs do `stripe listen`
   - Veja os logs do servidor Next.js

7. **Verifique**:
   - ✅ Redirecionado para `/delivery/[messageId]`
   - ✅ Status no banco mudou para 'paid'
   - ✅ QR Code foi gerado
   - ✅ Email chegou na caixa de entrada

### Teste Manual (Para Mensagens Pendentes)

Se você já tem mensagens pendentes:

1. Acesse: `http://localhost:3000/test/update-message-status`
2. Cole o ID da mensagem
3. Clique em "Atualizar"
4. Teste a mensagem pública

**Nota**: A ferramenta manual NÃO envia email. Apenas o webhook envia.

## Verificação

### No Terminal do Stripe CLI

Deve aparecer:
```
--> checkout.session.completed [evt_xxxxx]
<-- [200] POST http://localhost:3000/api/checkout/webhook
```

### No Terminal do Next.js

Deve aparecer:
```
Successfully processed payment for message abc-123
Successfully sent QR code email for message abc-123
```

### No Banco de Dados

```sql
SELECT id, recipient_name, status, slug, qr_code_url 
FROM messages 
ORDER BY created_at DESC 
LIMIT 1;
```

Deve mostrar:
- `status` = 'paid'
- `slug` = '/mensagem/nome/uuid'
- `qr_code_url` = '/qr-codes/uuid.png'

### No Email

Verifique sua caixa de entrada:
- Assunto: "Sua mensagem especial para [Nome] está pronta! 🎁"
- Remetente: "Paper Bloom" ou "onboarding@resend.dev"
- Conteúdo: QR Code + Link + Instruções

## Troubleshooting

### Webhook retorna 400

**Problema**: Signature inválida

**Solução**:
1. Copie o `whsec_` do `stripe listen`
2. Adicione no `.env.local`
3. Reinicie o servidor

### Email não chegou

**Problema**: Resend não configurado

**Solução**:
1. Verifique `RESEND_API_KEY`
2. Use `onboarding@resend.dev` para testes
3. Veja os logs do servidor

### Mensagem ainda está 'pending'

**Problema**: Webhook não foi acionado

**Solução**:
1. Verifique se `stripe listen` está rodando
2. Faça um novo pagamento de teste
3. Veja os logs do Stripe CLI

## Documentação

- `CONFIGURACAO_STRIPE_COMPLETA.md` - Guia passo a passo completo
- `WEBHOOK_TESTING_GUIDE.md` - Detalhes do webhook
- `TROUBLESHOOTING_QUICK_GUIDE.md` - Resolução de problemas
- `TESTE_RAPIDO.md` - Teste rápido da ferramenta manual

## Status Atual

✅ **API de checkout** - Aceita contactInfo
✅ **Webhook** - Processa pagamento automaticamente
✅ **QR Code** - Gerado automaticamente
✅ **Email** - Enviado automaticamente
✅ **Página de delivery** - Exibe preview completo
✅ **Mensagem pública** - Acessível via URL

## Próximos Passos

1. ✅ Configure as variáveis de ambiente
2. ✅ Instale e configure Stripe CLI
3. ✅ Obtenha API key do Resend
4. ✅ Teste o fluxo completo
5. ⏳ Aplique migration de clientes (opcional)
6. ⏳ Configure webhook em produção

Tudo pronto para funcionar automaticamente! 🎉
