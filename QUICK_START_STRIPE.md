# 🚀 Quick Start: Stripe em 5 Minutos

## Passo 1: Obter Chaves do Stripe (2 min)

1. Acesse: https://dashboard.stripe.com/test/apikeys
2. Copie estas 3 chaves:
   - **Secret key** (sk_test_...)
   - **Publishable key** (pk_test_...)

## Passo 2: Configurar .env.local (1 min)

Edite o arquivo `.env.local` e cole suas chaves:

```bash
STRIPE_SECRET_KEY=sk_test_COLE_AQUI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_COLE_AQUI
```

**NÃO configure o STRIPE_WEBHOOK_SECRET ainda!** Você vai obter isso no próximo passo.

## Passo 3: Instalar Stripe CLI (1 min)

**Windows (PowerShell como Admin):**
```powershell
scoop install stripe
# OU
choco install stripe-cli
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Veja: https://stripe.com/docs/stripe-cli#install
```

## Passo 4: Fazer Login (30 seg)

```bash
stripe login
```

Autorize no navegador que abrir.

## Passo 5: Iniciar Listener (30 seg)

```bash
npm run stripe:listen
```

**OU use o script helper:**
```powershell
# Windows
.\stripe-dev.ps1

# Mac/Linux
./stripe-dev.sh
```

Você verá algo assim:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

## Passo 6: Copiar Webhook Secret (30 seg)

1. Copie o `whsec_...` que apareceu
2. Cole no `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_COLE_AQUI
```

3. Salve o arquivo

## Passo 7: Validar (30 seg)

```bash
npm run stripe:validate
```

Você deve ver:
```
✅ CONFIGURAÇÃO VÁLIDA - Stripe está pronto para uso!
```

## ✅ Pronto!

Agora você tem:
- ✅ Chaves do Stripe configuradas
- ✅ Webhook listener rodando
- ✅ Ambiente pronto para desenvolvimento

## 🎯 Workflow de Desenvolvimento

### Terminal 1: Next.js
```bash
npm run dev
```

### Terminal 2: Stripe Listener
```bash
npm run stripe:listen
```

### Terminal 3: Testes (opcional)
```bash
npm run stripe:trigger
```

## 🧪 Testar Pagamento

Use este cartão de teste:
- **Número:** 4242 4242 4242 4242
- **Data:** 12/34 (qualquer data futura)
- **CVC:** 123 (qualquer 3 dígitos)

## 📚 Documentação Completa

- **Setup detalhado:** `STRIPE_SETUP.md`
- **Stripe CLI:** `STRIPE_CLI_SETUP.md`
- **Troubleshooting:** Veja os arquivos acima

## ⚠️ Lembre-se

1. Mantenha o Stripe listener rodando durante o desenvolvimento
2. Use sempre chaves de **teste** (sk_test_, pk_test_)
3. Nunca commite o arquivo `.env.local`

---

**Dúvidas?** Consulte `STRIPE_SETUP.md` para instruções detalhadas! 🎉
