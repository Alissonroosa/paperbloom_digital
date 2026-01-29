# Guia de Configuração do Stripe

Este guia explica como configurar as credenciais do Stripe para o Paper Bloom Digital.

## 📝 Pré-requisitos

- Conta no Stripe (gratuita): [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
- Acesso ao dashboard do Stripe

## 🔑 Passo 1: Obter as Chaves de API

### 1.1 Acessar o Dashboard

1. Acesse [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login na sua conta
3. **Importante:** Certifique-se de estar no modo **"Test mode"** (canto superior direito)

### 1.2 Obter as Chaves

1. No menu superior, clique em **"Developers"**
2. No menu lateral, clique em **"API keys"**
3. Você verá duas chaves:

   **Publishable key (Chave Pública):**
   - Formato: `pk_test_...`
   - Visível por padrão
   - Usada no frontend

   **Secret key (Chave Secreta):**
   - Formato: `sk_test_...`
   - Clique em **"Reveal test key"** para visualizar
   - **NUNCA** compartilhe esta chave
   - Usada no backend

4. Copie ambas as chaves

## 🔔 Passo 2: Configurar o Webhook

Os webhooks permitem que o Stripe notifique seu sistema quando um pagamento é concluído.

### 2.1 Criar o Endpoint

1. No menu "Developers", clique em **"Webhooks"**
2. Clique em **"Add endpoint"** (ou "Test in local environment" para desenvolvimento)

### 2.2 Configurar o Endpoint

**Para Desenvolvimento Local:**
- **Endpoint URL:** `http://localhost:3000/api/checkout/webhook`
- **Description:** Paper Bloom - Webhook de Pagamento
- **Events to send:** Selecione `checkout.session.completed`

**Para Produção (depois do deploy):**
- **Endpoint URL:** `https://seu-dominio.com/api/checkout/webhook`
- **Description:** Paper Bloom - Webhook de Pagamento (Produção)
- **Events to send:** Selecione `checkout.session.completed`

### 2.3 Obter o Webhook Secret

1. Após criar o endpoint, clique nele na lista
2. Na seção **"Signing secret"**, clique em **"Reveal"**
3. Copie o secret (formato: `whsec_...`)

## ⚙️ Passo 3: Configurar as Variáveis de Ambiente

### 3.1 Atualizar o arquivo .env.local

Abra o arquivo `.env.local` na raiz do projeto e substitua os valores:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_SUA_SECRET_KEY_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_PUBLISHABLE_KEY_AQUI
```

### 3.2 Exemplo Completo

```bash
# Database Configuration
DATABASE_URL=postgres://alisson_user:A%23A%40T4rrm%25172628@82.112.250.187:5432/c_paperbloom

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## ✅ Passo 4: Verificar a Configuração

### 4.1 Reiniciar o Servidor

Após configurar as variáveis de ambiente, reinicie o servidor Next.js:

```bash
npm run dev
```

### 4.2 Testar a Integração

Execute o script de verificação:

```bash
npx ts-node --project tsconfig.node.json src/services/__tests__/verify-stripe-service.ts
```

Se tudo estiver correto, você verá:
```
✅ All StripeService verifications passed!
```

## 🧪 Passo 5: Testar Pagamentos

### 5.1 Cartões de Teste do Stripe

Use estes cartões para testar pagamentos:

**Pagamento Bem-Sucedido:**
- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura (ex: 12/34)
- CVC: Qualquer 3 dígitos (ex: 123)
- CEP: Qualquer CEP

**Pagamento Recusado:**
- Número: `4000 0000 0000 0002`
- Data: Qualquer data futura
- CVC: Qualquer 3 dígitos

**Requer Autenticação 3D Secure:**
- Número: `4000 0025 0000 3155`
- Data: Qualquer data futura
- CVC: Qualquer 3 dígitos

### 5.2 Testar o Webhook Localmente

Para testar webhooks em desenvolvimento local, você tem duas opções:

**Opção 1: Stripe CLI (Recomendado)**

1. Instale o Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Faça login: `stripe login`
3. Encaminhe webhooks: `stripe listen --forward-to localhost:3000/api/checkout/webhook`
4. Use o webhook secret fornecido pelo CLI

**Opção 2: Usar ngrok**

1. Instale o ngrok: [https://ngrok.com/](https://ngrok.com/)
2. Execute: `ngrok http 3000`
3. Use a URL fornecida pelo ngrok no dashboard do Stripe

## 🚀 Passo 6: Configuração para Produção

Quando estiver pronto para produção:

1. **Ative o modo Live no Stripe:**
   - No dashboard, mude de "Test mode" para "Live mode"
   - Obtenha as chaves de produção (começam com `pk_live_` e `sk_live_`)

2. **Configure o webhook de produção:**
   - Crie um novo endpoint com a URL de produção
   - Obtenha o novo webhook secret

3. **Atualize as variáveis de ambiente de produção:**
   - Use as chaves de produção
   - Configure no seu serviço de hospedagem (Vercel, AWS, etc.)

## 🔒 Segurança

### ⚠️ IMPORTANTE:

- **NUNCA** commite o arquivo `.env.local` no Git
- **NUNCA** compartilhe suas chaves secretas
- Use sempre chaves de teste (`sk_test_`) durante o desenvolvimento
- Mantenha as chaves de produção (`sk_live_`) seguras
- Rotacione as chaves se houver suspeita de comprometimento

### Verificar .gitignore

Certifique-se de que `.env.local` está no `.gitignore`:

```
.env.local
.env*.local
```

## 📚 Recursos Adicionais

- [Documentação do Stripe](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhooks do Stripe](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

## 🆘 Solução de Problemas

### Erro: "STRIPE_SECRET_KEY environment variable is not set"

- Verifique se o arquivo `.env.local` existe
- Verifique se as variáveis estão configuradas corretamente
- Reinicie o servidor após alterar as variáveis

### Webhook não está funcionando

- Verifique se a URL do webhook está correta
- Verifique se o evento `checkout.session.completed` está selecionado
- Use o Stripe CLI para testar localmente
- Verifique os logs no dashboard do Stripe

### Pagamento não está sendo processado

- Verifique se está usando cartões de teste válidos
- Verifique os logs do console
- Verifique o dashboard do Stripe para ver se o pagamento foi criado

## 💰 Configurar Preço do Produto

O preço padrão está configurado no código. Para alterá-lo, edite o arquivo da rota de checkout quando for criado.

Exemplo: Para R$ 29,90, use `2990` (valor em centavos).

---

**Pronto!** Agora você está pronto para processar pagamentos com o Stripe! 🎉
