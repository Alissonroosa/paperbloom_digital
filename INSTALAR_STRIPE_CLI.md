# 📥 Como Instalar o Stripe CLI no Windows

## Método Mais Simples: Download Direto

### Passo 1: Baixar

1. Acesse: https://github.com/stripe/stripe-cli/releases/latest
2. Procure o arquivo: **`stripe_X.X.X_windows_x86_64.tar.gz`** ou **`.zip`**
3. Baixe o arquivo

### Passo 2: Extrair

1. Extraia o arquivo baixado
2. Você terá um arquivo chamado **`stripe.exe`**

### Passo 3: Colocar em uma Pasta

Crie uma pasta e mova o `stripe.exe` para lá:
```
C:\Stripe\stripe.exe
```

### Passo 4: Adicionar ao PATH (Temporário)

No PowerShell do seu projeto, execute:

```powershell
$env:Path += ";C:\Stripe"
```

### Passo 5: Verificar

```powershell
stripe --version
```

Se aparecer a versão, está funcionando! ✅

---

## OU: Usar Scoop (Mais Fácil a Longo Prazo)

### Instalar Scoop

No PowerShell (como usuário normal):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Instalar Stripe CLI

```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Verificar

```powershell
stripe --version
```

---

## Próximos Passos

Depois de instalar, execute estes comandos:

### 1. Login no Stripe
```powershell
stripe login
```

### 2. Iniciar o Listener
```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### 3. Copiar o Webhook Secret

Quando o listener iniciar, você verá:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

Copie o `whsec_...` e cole no arquivo `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

### 4. Reiniciar o Servidor

```powershell
npm run dev
```

---

## 🎉 Pronto!

Agora você pode desenvolver com webhooks do Stripe funcionando localmente!
