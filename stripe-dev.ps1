# Script PowerShell para facilitar o desenvolvimento com Stripe
# Execute este script para iniciar o listener do Stripe CLI

Write-Host "🎯 Paper Bloom - Stripe Development Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Stripe CLI está instalado
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue

if (-not $stripeInstalled) {
    Write-Host "❌ Stripe CLI não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale usando um dos métodos:" -ForegroundColor Yellow
    Write-Host "  1. Scoop: scoop install stripe" -ForegroundColor White
    Write-Host "  2. Chocolatey: choco install stripe-cli" -ForegroundColor White
    Write-Host "  3. Download: https://github.com/stripe/stripe-cli/releases" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Consulte STRIPE_CLI_SETUP.md para mais detalhes" -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ Stripe CLI encontrado" -ForegroundColor Green
Write-Host ""

# Verificar se está logado
Write-Host "🔐 Verificando autenticação..." -ForegroundColor Yellow
$loginCheck = stripe config --list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Você não está logado no Stripe!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute: stripe login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Autenticado no Stripe" -ForegroundColor Green
Write-Host ""

# Informações importantes
Write-Host "📋 INFORMAÇÕES IMPORTANTES:" -ForegroundColor Cyan
Write-Host "  • Endpoint: localhost:3000/api/checkout/webhook" -ForegroundColor White
Write-Host "  • Evento principal: checkout.session.completed" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  ATENÇÃO:" -ForegroundColor Yellow
Write-Host "  1. Copie o 'webhook signing secret' (whsec_...) que aparecerá" -ForegroundColor White
Write-Host "  2. Cole no arquivo .env.local como STRIPE_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "  3. Reinicie o servidor Next.js (npm run dev)" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Iniciando Stripe listener..." -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar o listener
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Se o listener for interrompido
Write-Host ""
Write-Host "👋 Stripe listener encerrado" -ForegroundColor Yellow
