# 🚀 Configurar Stripe CLI Local - Guia Completo

## Status Atual

✅ Stripe CLI instalado (versão 1.32.0)
✅ Variáveis de ambiente configuradas
✅ Webhook secret configurado

## Passo a Passo

### 1. Login no Stripe CLI

Primeiro, você precisa fazer login no Stripe CLI:

```powershell
.\stripe.exe login
```

**O que vai acontecer:**
1. Abrirá uma página no navegador
2. Você fará login na sua conta Stripe
3. Autorizará o CLI
4. Voltará ao terminal com sucesso

**Se já estiver logado:**
```powershell
# Verificar status do login
.\stripe.exe config --list
```

---

### 2. Iniciar o Webhook Listener

Abra um **novo terminal PowerShell** e execute:

```powershell
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
```

**O que vai acontecer:**
```
> Ready! You are using Stripe API Version [2024-XX-XX]. Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**⚠️ IMPORTANTE:** 
- Copie o `whsec_xxxxx` que aparecer
- Atualize o `.env.local` com esse novo secret
- **NÃO feche este terminal** - ele precisa ficar rodando

---

### 3. Atualizar Webhook Secret (Se Necessário)

Se o webhook secret for diferente do que está no `.env.local`:

1. Abra o arquivo `.env.local`
2. Atualize a linha:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
3. Salve o arquivo
4. Reinicie o servidor Next.js

---

### 4. Iniciar o Servidor Next.js

Em outro terminal:

```powershell
npm run dev
```

**Aguarde até ver:**
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

---

## 🧪 Testar o Fluxo Completo

### Teste 1: Mensagem Personalizada

```powershell
# 1. Acessar
http://localhost:3000/editor/mensagem

# 2. Preencher dados básicos
De: João
Para: Maria
Mensagem: "Teste de mensagem"
Email: seu-email@exemplo.com

# 3. Clicar em "Finalizar e Pagar"

# 4. Usar cartão de teste
Número: 4242 4242 4242 4242
Data: 12/34
CVC: 123

# 5. Verificar logs do Stripe CLI
# Deve mostrar: checkout.session.completed
```

### Teste 2: 12 Cartas

```powershell
# 1. Acessar
http://localhost:3000/editor/12-cartas

# 2. Preencher dados básicos
De: João
Para: Maria
Email: seu-email@exemplo.com

# 3. Preencher algumas cartas (pode deixar vazias para teste)

# 4. Clicar em "Finalizar e Pagar"

# 5. Usar cartão de teste
Número: 4242 4242 4242 4242
Data: 12/34
CVC: 123

# 6. Verificar logs do Stripe CLI
# Deve mostrar: checkout.session.completed
```

---

## 📋 Verificar Logs

### Terminal do Stripe CLI

Você verá algo como:

```
2024-01-21 10:30:00   --> checkout.session.completed [evt_xxx]
2024-01-21 10:30:01   <-- [200] POST http://localhost:3000/api/checkout/webhook [evt_xxx]
```

**✅ Sucesso:** Status 200
**❌ Erro:** Status 400 ou 500

### Terminal do Next.js

Você verá logs como:

```
[Webhook] Processing card-collection payment for session cs_test_xxx
[Webhook] Starting card collection email send process
[EmailService] Attempting to send card collection email
[Webhook] ✅ Successfully sent card collection email
```

---

## 🔧 Troubleshooting

### Problema 1: "stripe.exe não é reconhecido"

**Solução:**
```powershell
# Use o caminho completo
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
```

### Problema 2: "You need to login first"

**Solução:**
```powershell
.\stripe.exe login
```

### Problema 3: Webhook retorna 400

**Causa:** Webhook secret incorreto

**Solução:**
1. Copie o secret do terminal do Stripe CLI
2. Atualize `.env.local`
3. Reinicie o servidor Next.js

### Problema 4: Email não é enviado

**Verificar:**
```powershell
# Verificar variáveis de ambiente
cat .env.local | Select-String "RESEND"
```

**Deve ter:**
```
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@email.paperbloom.com.br
RESEND_FROM_NAME=Paper Bloom
```

### Problema 5: QR Code não é gerado

**Verificar:**
```powershell
# Verificar se a pasta existe
Test-Path "public/uploads/qrcodes"
```

**Se não existir:**
```powershell
New-Item -ItemType Directory -Path "public/uploads/qrcodes" -Force
```

---

## 📝 Scripts Úteis

### Script 1: Iniciar Tudo de Uma Vez

Crie um arquivo `iniciar-desenvolvimento.ps1`:

```powershell
# Iniciar servidor Next.js em background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Aguardar 5 segundos
Start-Sleep -Seconds 5

# Iniciar Stripe CLI
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
```

**Usar:**
```powershell
.\iniciar-desenvolvimento.ps1
```

### Script 2: Verificar Status

Crie um arquivo `verificar-status.ps1`:

```powershell
Write-Host "🔍 Verificando Status do Sistema`n" -ForegroundColor Cyan

# Verificar Stripe CLI
Write-Host "1. Stripe CLI:" -ForegroundColor Yellow
if (Test-Path "stripe.exe") {
    $version = .\stripe.exe --version
    Write-Host "   ✅ Instalado: $version" -ForegroundColor Green
} else {
    Write-Host "   ❌ Não encontrado" -ForegroundColor Red
}

# Verificar servidor Next.js
Write-Host "`n2. Servidor Next.js:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing
    Write-Host "   ✅ Rodando (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Não está rodando" -ForegroundColor Red
}

# Verificar variáveis de ambiente
Write-Host "`n3. Variáveis de Ambiente:" -ForegroundColor Yellow
$envVars = @("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY")
foreach ($var in $envVars) {
    $value = Get-Content .env.local | Select-String "^$var="
    if ($value) {
        Write-Host "   ✅ $var configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $var não encontrado" -ForegroundColor Red
    }
}

Write-Host "`n✨ Verificação concluída!`n" -ForegroundColor Cyan
```

**Usar:**
```powershell
.\verificar-status.ps1
```

---

## 🎯 Comandos Rápidos

### Iniciar Stripe Webhook
```powershell
.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
```

### Verificar Login
```powershell
.\stripe.exe config --list
```

### Ver Eventos Recentes
```powershell
.\stripe.exe events list --limit 10
```

### Testar Webhook Manualmente
```powershell
.\stripe.exe trigger checkout.session.completed
```

### Ver Logs do Webhook
```powershell
.\stripe.exe logs tail
```

---

## 📊 Fluxo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    DESENVOLVIMENTO LOCAL                     │
└─────────────────────────────────────────────────────────────┘

Terminal 1: Next.js Server
┌──────────────────────────┐
│ npm run dev              │
│ ✓ Ready on port 3000     │
│                          │
│ [Logs da aplicação]      │
└──────────────────────────┘

Terminal 2: Stripe CLI
┌──────────────────────────┐
│ stripe listen            │
│ Ready! whsec_xxxxx       │
│                          │
│ [Logs do webhook]        │
└──────────────────────────┘

Navegador
┌──────────────────────────┐
│ localhost:3000           │
│                          │
│ [Testar fluxo]           │
└──────────────────────────┘

Fluxo:
1. Usuário preenche editor
2. Clica em "Finalizar"
3. Stripe processa pagamento
4. Stripe envia webhook → Terminal 2
5. Webhook processa → Terminal 1
6. Email enviado
7. Usuário vê página delivery
```

---

## ✅ Checklist de Configuração

Antes de testar, verifique:

- [ ] Stripe CLI instalado e funcionando
- [ ] Login feito no Stripe CLI
- [ ] Webhook listener rodando
- [ ] Servidor Next.js rodando
- [ ] `.env.local` com todas as variáveis
- [ ] Pasta `public/uploads/qrcodes` existe
- [ ] Banco de dados acessível

---

## 🎉 Pronto para Testar!

Agora você pode:

1. ✅ Criar mensagens e coleções
2. ✅ Processar pagamentos
3. ✅ Receber webhooks
4. ✅ Gerar QR Codes
5. ✅ Enviar emails
6. ✅ Ver páginas de delivery

**Próximo passo:** Acesse `http://localhost:3000/editor/12-cartas` e teste! 🚀
