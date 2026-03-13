Write-Host ""
Write-Host "Verificando Stripe Setup..." -ForegroundColor Cyan
Write-Host ""

# Check Stripe CLI
Write-Host "1. Stripe CLI..." -ForegroundColor Yellow
$stripe = Get-Command stripe -ErrorAction SilentlyContinue
if ($stripe) {
    Write-Host "   OK - Instalado" -ForegroundColor Green
} else {
    Write-Host "   ERRO - Nao instalado" -ForegroundColor Red
    Write-Host "   Instale: scoop install stripe" -ForegroundColor Yellow
}

Write-Host ""

# Check .env.local
Write-Host "2. Variaveis de ambiente..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $env = Get-Content ".env.local" -Raw
    
    if ($env -match "STRIPE_SECRET_KEY=sk_") {
        Write-Host "   OK - STRIPE_SECRET_KEY" -ForegroundColor Green
    } else {
        Write-Host "   ERRO - STRIPE_SECRET_KEY" -ForegroundColor Red
    }
    
    if ($env -match "STRIPE_WEBHOOK_SECRET=whsec_") {
        Write-Host "   OK - STRIPE_WEBHOOK_SECRET" -ForegroundColor Green
    } else {
        Write-Host "   AVISO - STRIPE_WEBHOOK_SECRET nao configurado" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERRO - .env.local nao encontrado" -ForegroundColor Red
}

Write-Host ""

# Check Next.js
Write-Host "3. Next.js..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   OK - Rodando" -ForegroundColor Green
} catch {
    Write-Host "   ERRO - Nao esta rodando" -ForegroundColor Red
    Write-Host "   Execute: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Check Stripe listener
Write-Host "4. Stripe Listener..." -ForegroundColor Yellow
$process = Get-Process -Name "stripe" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "   OK - Rodando" -ForegroundColor Green
} else {
    Write-Host "   ERRO - Nao esta rodando" -ForegroundColor Red
    Write-Host "   Execute: .\stripe-dev.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
