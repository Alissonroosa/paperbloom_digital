# 🔧 Instalar Stripe CLI Manualmente no Windows

## 📥 Passo 1: Baixar o Stripe CLI

1. Acesse: https://github.com/stripe/stripe-cli/releases/latest
2. Baixe o arquivo: `stripe_X.X.X_windows_x86_64.zip`
3. Extraia o arquivo `stripe.exe`

## 📁 Passo 2: Escolher onde colocar

### Opção A: Pasta do Projeto (Mais Simples)

1. Copie o `stripe.exe` para a pasta do projeto:
   ```
   C:\clientes\paperbloom digital\stripe.exe
   ```

2. Use assim:
   ```powershell
   .\stripe.exe login
   .\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
   ```

### Opção B: Adicionar ao PATH (Recomendado)

1. Crie uma pasta para ferramentas:
   ```
   C:\Tools\Stripe\
   ```

2. Copie o `stripe.exe` para lá

3. Adicionar ao PATH:
   - Pressione `Win + X` e escolha "Sistema"
   - Clique em "Configurações avançadas do sistema"
   - Clique em "Variáveis de Ambiente"
   - Em "Variáveis do sistema", encontre "Path"
   - Clique em "Editar"
   - Clique em "Novo"
   - Adicione: `C:\Tools\Stripe`
   - Clique em "OK" em todas as janelas

4. **IMPORTANTE:** Feche e abra o PowerShell novamente

5. Teste:
   ```powershell
   stripe --version
   ```

## ✅ Passo 3: Fazer Login

```powershell
stripe login
```

Isso vai abrir o navegador para você autorizar.

## 🚀 Passo 4: Iniciar o Webhook Listener

```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

## 📝 Passo 5: Copiar o Webhook Secret

Quando o listener iniciar, você verá:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

**COPIE** esse valor `whsec_xxxxxxxxxxxxxxxxxxxxx`

## 🔧 Passo 6: Atualizar .env.local

Abra `.env.local` e atualize:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

## 🔄 Passo 7: Reiniciar Next.js

No terminal onde o Next.js está rodando:
- Pressione `Ctrl+C`
- Execute: `npm run dev`

## ✅ Pronto!

Agora você tem 2 terminais rodando:

**Terminal 1 - Stripe:**
```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

**Terminal 2 - Next.js:**
```powershell
npm run dev
```

## 🎯 Testar

1. Acesse: http://localhost:3000/editor/mensagem
2. Crie uma mensagem
3. Faça o pagamento
4. Veja os logs no terminal do Stripe
5. Acesse a página de delivery

## 🆘 Problemas?

### "stripe não é reconhecido"
- Se usou Opção A: Use `.\stripe.exe` em vez de `stripe`
- Se usou Opção B: Feche e abra o PowerShell novamente

### "Not authenticated"
- Execute: `stripe login`
- Autorize no navegador

### "Connection refused"
- Certifique-se que Next.js está rodando em localhost:3000

## 💡 Dica

Crie um script para facilitar:

**iniciar-stripe.ps1:**
```powershell
Write-Host "Iniciando Stripe Webhook Listener..." -ForegroundColor Cyan
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

Execute:
```powershell
.\iniciar-stripe.ps1
```

---

**Resumo:** Coloque o `stripe.exe` na pasta do projeto ou adicione ao PATH do Windows!
