# Script para verificar se o Stripe está configurado corretamente

Write-Host ""
Write-Host "🔍 Verificando Configuração do Stripe..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Stripe CLI
Write-Host "1️⃣  Verificando Stripe CLI..." -ForegroundColor Yellow
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue

if ($stripeInstalled) {
    Write-Host "   OK Stripe CLI instalado" -ForegroundColor Green
    $version = stripe --version 2>&1
    Write-Host "   Versao: $version" -ForegroundColor Gray
} else {
    Write-Host "   ERRO Stripe CLI NAO instalado" -ForegroundColor Red
    Write-Host "   Instale com: scoop install stripe" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""

# 2. Verificar autenticação
Write-Host "2️⃣  Verificando autenticação..." -ForegroundColor Yellow
$loginCheck = stripe config --list 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Autenticado no Stripe" -ForegroundColor Green
} else {
    Write-Host "   ERRO NAO autenticado" -ForegroundColor Red
    Write-Host "   Execute: stripe login" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""

# 3. Verificar .env.local
Write-Host "3️⃣  Verificando variáveis de ambiente..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    # Verificar STRIPE_SECRET_KEY
    if ($envContent -match "STRIPE_SECRET_KEY=sk_") {
        Write-Host "   OK STRIPE_SECRET_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "   ERRO STRIPE_SECRET_KEY nao encontrado" -ForegroundColor Red
    }
    
    # Verificar STRIPE_PUBLISHABLE_KEY
    if ($envContent -match "STRIPE_PUBLISHABLE_KEY=pk_") {
        Write-Host "   OK STRIPE_PUBLISHABLE_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "   ERRO STRIPE_PUBLISHABLE_KEY nao encontrado" -ForegroundColor Red
    }
    
    # Verificar STRIPE_WEBHOOK_SECRET
    if ($envContent -match "STRIPE_WEBHOOK_SECRET=whsec_") {
        Write-Host "   OK STRIPE_WEBHOOK_SECRET configurado" -ForegroundColor Green
    } else {
        Write-Host "   AVISO STRIPE_WEBHOOK_SECRET nao encontrado" -ForegroundColor Yellow
        Write-Host "   Voce precisa iniciar o webhook listener e copiar o secret" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERRO Arquivo .env.local nao encontrado" -ForegroundColor Red
}

Write-Host ""

# 4. Verificar se o Next.js está rodando
Write-Host "4️⃣  Verificando servidor Next.js..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   OK Next.js rodando em localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "   ERRO Next.js NAO esta rodando" -ForegroundColor Red
    Write-Host "   Execute: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# 5. Verificar se o webhook listener está rodando
Write-Host "5️⃣  Verificando webhook listener..." -ForegroundColor Yellow

$stripeProcess = Get-Process -Name "stripe" -ErrorAction SilentlyContinue

if ($stripeProcess) {
    Write-Host "   OK Stripe listener esta rodando" -ForegroundColor Green
} else {
    Write-Host "   ERRO Stripe listener NAO esta rodando" -ForegroundColor Red
    Write-Host "   Execute: .\stripe-dev.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Resumo
Write-Host "📋 RESUMO:" -ForegroundColor Cyan
Write-Host ""

if ($stripeInstalled -and ($LASTEXITCODE -eq 0)) {
    Write-Host "Para iniciar o sistema completo:" -ForegroundColor White
    Write-Host ""
    Write-Host "  Terminal 1:" -ForegroundColor Yellow
    Write-Host "  .\stripe-dev.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "  Terminal 2:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Depois faça um pagamento de teste!" -ForegroundColor Green
} else {
    Write-Host "Corrija os problemas acima antes de continuar." -ForegroundColor Red
}

Write-Host ""
