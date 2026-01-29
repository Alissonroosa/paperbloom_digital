# Script para iniciar ambiente de desenvolvimento completo
# Inicia Next.js e Stripe CLI automaticamente

Write-Host "`n🚀 Iniciando Ambiente de Desenvolvimento`n" -ForegroundColor Cyan

# Verificar se stripe.exe existe
if (-not (Test-Path "stripe.exe")) {
    Write-Host "❌ stripe.exe não encontrado!" -ForegroundColor Red
    Write-Host "   Baixe em: https://github.com/stripe/stripe-cli/releases`n" -ForegroundColor Yellow
    exit 1
}

# Verificar se já está logado no Stripe
Write-Host "🔐 Verificando login no Stripe..." -ForegroundColor Yellow
$loginCheck = .\stripe.exe config --list 2>&1
if ($loginCheck -match "not logged in") {
    Write-Host "❌ Você precisa fazer login primeiro!" -ForegroundColor Red
    Write-Host "   Execute: .\stripe.exe login`n" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Login verificado`n" -ForegroundColor Green

# Iniciar servidor Next.js em nova janela
Write-Host "📦 Iniciando servidor Next.js..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🌐 Servidor Next.js' -ForegroundColor Cyan; npm run dev"
Write-Host "✅ Servidor Next.js iniciado em nova janela`n" -ForegroundColor Green

# Aguardar servidor iniciar
Write-Host "⏳ Aguardando servidor iniciar (10 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Iniciar Stripe CLI webhook listener
Write-Host "🎧 Iniciando Stripe CLI webhook listener...`n" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "⚠️  IMPORTANTE: Copie o webhook secret (whsec_xxxxx)" -ForegroundColor Yellow
Write-Host "    e atualize no .env.local se for diferente!" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
