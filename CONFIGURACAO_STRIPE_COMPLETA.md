# Configuração Completa do Stripe - Fluxo Automático

## ✅ O que foi configurado

1. **Webhook atualizado** - Processa pagamento, gera QR Code e envia email
2. **API de checkout atualizada** - Aceita informações de contato
3. **StripeService atualizado** - Passa contactInfo para o Stripe
4. **Fluxo completo** - Do pagamento até o email automático

## 🚀 Como Configurar e Testar

### Passo 1: Configurar Variáveis de Ambiente

Abra `.env.local` e adicione/verifique:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Resend (para emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Paper Bloom

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Passo 2: Instalar Stripe CLI

#### Windows (Scoop)
```bash
scoop install stripe
```

#### macOS (Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

#### Linux
```bash
# Baixar e instalar
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### Passo 3: Fazer Login no Stripe

```bash
stripe login
```

Isso vai abrir o navegador para você autorizar o CLI.

### Passo 4: Iniciar Webhook Forwarding

```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

Você verá algo como:

```
> Ready! You webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

**IMPORTANTE**: Copie esse `whsec_xxxxxxxxxxxxx` e adicione no `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Passo 5: Reiniciar o Servidor Next.js

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### Passo 6: Obter API Key do Resend

1. Acesse: https://resend.com/api-keys
2. Crie uma conta (se não tiver)
3. Crie uma nova API key
4. Copie e adicione no `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Para testes**, você pode usar o email de teste do Resend:
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Este email não precisa ser verificado e funciona imediatamente.

### Passo 7: Testar o Fluxo Completo

#### 7.1 Criar uma Mensagem

1. Acesse: `http://localhost:3000/editor/mensagem`
2. Preencha todos os 7 passos do wizard:
   - **Passo 1**: Título e URL
   - **Passo 2**: Data especial (opcional)
   - **Passo 3**: Mensagem principal
   - **Passo 4**: Upload de fotos (opcional)
   - **Passo 5**: Tema e cores
   - **Passo 6**: Música do YouTube (opcional)
   - **Passo 7**: **IMPORTANTE** - Preencha nome, email e telefone

3. Clique em "Prosseguir para Pagamento"

#### 7.2 Fazer o Pagamento de Teste

1. Você será redirecionado para o Stripe Checkout
2. Use o cartão de teste:
   - **Número**: `4242 4242 4242 4242`
   - **Data**: Qualquer data futura (ex: 12/25)
   - **CVC**: Qualquer 3 dígitos (ex: 123)
   - **Nome**: Qualquer nome
   - **Email**: Seu email real (para receber o QR Code)

3. Clique em "Pay"

#### 7.3 Verificar o Webhook

No terminal onde o `stripe listen` está rodando, você deve ver:

```
2024-03-15 10:30:45   --> checkout.session.completed [evt_xxxxx]
2024-03-15 10:30:45  <--  [200] POST http://localhost:3000/api/checkout/webhook [evt_xxxxx]
```

Se aparecer `[200]`, o webhook funcionou! ✅

Se aparecer `[400]` ou `[500]`, há um erro. Veja os logs do servidor Next.js.

#### 7.4 Verificar no Servidor Next.js

No terminal do Next.js, você deve ver:

```
Successfully processed payment for message abc-123-def
Successfully sent QR code email for message abc-123-def
```

#### 7.5 Verificar no Banco de Dados

```sql
SELECT id, recipient_name, status, slug, qr_code_url 
FROM messages 
ORDER BY created_at DESC 
LIMIT 1;
```

Deve mostrar:
- ✅ `status` = 'paid'
- ✅ `slug` = '/mensagem/nome/uuid'
- ✅ `qr_code_url` = '/qr-codes/uuid.png'

#### 7.6 Verificar o Email

1. Abra seu email (o que você usou no checkout)
2. Procure por email de "Paper Bloom" ou "onboarding@resend.dev"
3. O email deve conter:
   - ✅ QR Code da mensagem
   - ✅ Link direto para a mensagem
   - ✅ Instruções de como compartilhar

#### 7.7 Acessar a Página de Delivery

Após o pagamento, você deve ser redirecionado automaticamente para:

```
http://localhost:3000/delivery/[messageId]
```

Esta página mostra:
- ✅ Preview completo da mensagem
- ✅ QR Code
- ✅ Link compartilhável
- ✅ Confirmação de email enviado

## 🔍 Troubleshooting

### Webhook retorna 400 (Bad Request)

**Problema**: Signature inválida

**Solução**:
1. Verifique se copiou o `whsec_` correto do `stripe listen`
2. Verifique se adicionou no `.env.local`
3. Reinicie o servidor Next.js

### Webhook retorna 500 (Internal Error)

**Problema**: Erro no código do webhook

**Solução**:
1. Veja os logs do servidor Next.js
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Verifique se a pasta `public/qr-codes` existe

### Email não foi enviado

**Problema**: Resend não configurado ou erro no envio

**Solução**:
1. Verifique se `RESEND_API_KEY` está correto
2. Use `onboarding@resend.dev` para testes
3. Veja os logs do servidor para mensagens de erro
4. O webhook continua funcionando mesmo se o email falhar

### Mensagem não mudou para 'paid'

**Problema**: Webhook não foi acionado

**Solução**:
1. Verifique se o `stripe listen` está rodando
2. Verifique se o webhook secret está correto
3. Faça um novo pagamento de teste

### QR Code não foi gerado

**Problema**: Pasta não existe ou sem permissão

**Solução**:
```bash
mkdir -p public/qr-codes
chmod 755 public/qr-codes
```

## 📊 Fluxo Completo Funcionando

```
1. Usuário preenche wizard
   ↓
2. Clica em "Prosseguir para Pagamento"
   ↓
3. API cria mensagem no banco (status: pending)
   ↓
4. API cria sessão do Stripe (com contactInfo)
   ↓
5. Usuário é redirecionado para Stripe Checkout
   ↓
6. Usuário paga com cartão de teste
   ↓
7. Stripe processa pagamento
   ↓
8. Stripe envia webhook para /api/checkout/webhook
   ↓
9. Webhook processa:
   - Atualiza status para 'paid'
   - Gera slug
   - Gera QR Code
   - Lê QR Code e converte para base64
   - Envia email com QR Code
   ↓
10. Stripe redireciona para /success
    ↓
11. /success busca messageId via API
    ↓
12. Redireciona para /delivery/[messageId]
    ↓
13. Usuário vê:
    - Preview completo da mensagem
    - QR Code
    - Link compartilhável
    - Confirmação de email enviado
    ↓
14. Email chega na caixa de entrada com:
    - QR Code anexado
    - Link da mensagem
    - Instruções de compartilhamento
```

## ✅ Checklist de Verificação

Antes de testar, confirme:

- [ ] Stripe CLI instalado
- [ ] `stripe login` executado
- [ ] `stripe listen` rodando
- [ ] Webhook secret copiado para `.env.local`
- [ ] Resend API key configurada
- [ ] Servidor Next.js reiniciado
- [ ] Pasta `public/qr-codes` existe
- [ ] Banco de dados acessível

## 🎯 Comandos Úteis

### Ver logs do webhook em tempo real
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook --print-json
```

### Simular um evento de checkout
```bash
stripe trigger checkout.session.completed
```

### Ver últimos eventos do Stripe
```bash
stripe events list --limit 10
```

### Testar email manualmente
```bash
curl http://localhost:3000/api/test/send-qrcode-email
```

## 📚 Documentação Relacionada

- `WEBHOOK_TESTING_GUIDE.md` - Guia detalhado de teste do webhook
- `TROUBLESHOOTING_QUICK_GUIDE.md` - Resolução de problemas
- `TESTE_RAPIDO.md` - Teste rápido da ferramenta manual

## 🎉 Pronto!

Agora o fluxo completo está configurado:
- ✅ Pagamento via Stripe
- ✅ Webhook processa automaticamente
- ✅ QR Code gerado
- ✅ Email enviado
- ✅ Página de delivery funcional
- ✅ Mensagem pública acessível

Teste e me avise se funcionou! 🚀
