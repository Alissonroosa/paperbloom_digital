# 🎯 Comandos Stripe - Copie e Cole

## Execute estes comandos no PowerShell (na ordem):

### 1️⃣ Instalar Stripe CLI (escolha um método)

**Método A - Scoop (recomendado):**
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Método B - Chocolatey:**
```powershell
choco install stripe-cli
```

**Método C - Download Manual:**
- Baixe: https://github.com/stripe/stripe-cli/releases/latest
- Extraia o `stripe.exe`
- Adicione ao PATH

---

### 2️⃣ Verificar Instalação
```powershell
stripe --version
```

Deve mostrar a versão instalada.

---

### 3️⃣ Fazer Login no Stripe
```powershell
stripe login
```

- Pressione Enter quando solicitado
- Autorize no navegador que abrir
- Volte ao terminal

---

### 4️⃣ Iniciar o Servidor Next.js (Terminal 1)
```powershell
npm run dev
```

Deixe este terminal rodando!

---

### 5️⃣ Iniciar o Webhook Listener (Terminal 2 - NOVO)

Abra um **NOVO terminal** e execute:

```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

**Você verá algo assim:**
```
> Ready! Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz
> Listening for events...
```

---

### 6️⃣ Copiar o Webhook Secret

**COPIE** o valor `whsec_...` que apareceu acima.

Abra o arquivo `.env.local` e adicione/atualize:

```bash
STRIPE_WEBHOOK_SECRET=whsec_COLE_O_VALOR_AQUI
```

Salve o arquivo.

---

### 7️⃣ Reiniciar o Servidor Next.js

Volte ao **Terminal 1** (onde está o `npm run dev`):
- Pressione `Ctrl+C` para parar
- Execute novamente:

```powershell
npm run dev
```

---

### 8️⃣ Testar o Webhook (Terminal 3 - NOVO)

Abra um **TERCEIRO terminal** e execute:

```powershell
stripe trigger checkout.session.completed
```

**Você deve ver:**
- No Terminal 2 (listener): `[200] POST http://localhost:3000/api/checkout/webhook`
- No Terminal 1 (Next.js): Logs do webhook sendo processado

Se ver `[200]`, está funcionando! ✅

---

## 📋 Resumo dos Terminais

Você terá **3 terminais abertos**:

### Terminal 1: Servidor Next.js
```powershell
npm run dev
```

### Terminal 2: Stripe Listener
```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Terminal 3: Testes (opcional)
```powershell
stripe trigger checkout.session.completed
```

---

## ✅ Validar Configuração

Execute este comando para verificar se tudo está configurado:

```powershell
npm run stripe:validate
```

Deve mostrar:
```
✅ CONFIGURAÇÃO VÁLIDA - Stripe está pronto para uso!
```

---

## 🆘 Problemas?

### "stripe: command not found"
- Reinstale o Stripe CLI
- Reinicie o terminal
- Verifique o PATH

### "Connection refused"
- Certifique-se de que `npm run dev` está rodando
- Verifique se a porta 3000 está livre

### "Invalid signature"
- Use o `whsec_...` do comando `stripe listen`
- Não use o webhook secret do dashboard
- Reinicie o servidor após alterar `.env.local`

### Webhook retorna [404]
- A rota `/api/checkout/webhook` ainda não foi criada
- Isso é normal se você ainda não implementou a Task 13
- Continue com a implementação das rotas

---

## 🎉 Pronto!

Agora você tem:
- ✅ Stripe CLI instalado e autenticado
- ✅ Webhook listener rodando
- ✅ Webhook secret configurado
- ✅ Ambiente pronto para desenvolvimento

**Próximo passo:** Implementar as rotas de checkout e webhook (Tasks 12 e 13)
