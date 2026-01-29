# Script automatizado para configurar webhook do Stripe
# Baseado em: https://docs.stripe.com/webhooks/quickstart?lang=node

Write-Host ""
Write-Host "🔔 Paper Bloom - Setup de Webhook do Stripe" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Verificar se Stripe CLI está instalado
Write-Host "📋 Passo 1: Verificando Stripe CLI..." -ForegroundColor Yellow
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue

if (-not $stripeInstalled) {
    Write-Host "❌ Stripe CLI não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale usando um dos métodos:" -ForegroundColor White
    Write-Host "  1. scoop install stripe" -ForegroundColor Cyan
    Write-Host "  2. choco install stripe-cli" -ForegroundColor Cyan
    Write-Host "  3. Download: https://github.com/stripe/stripe-cli/releases" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📖 Consulte INSTALAR_STRIPE_CLI.md para detalhes" -ForegroundColor Yellow
    exit 1
}

$version = stripe --version 2>&1
Write-Host "✓ Stripe CLI instalado: $version" -ForegroundColor Green
Write-Host ""

# Passo 2: Verificar login
Write-Host "📋 Passo 2: Verificando autenticação..." -ForegroundColor Yellow
$loginCheck = stripe config --list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Você não está logado no Stripe!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Executando login..." -ForegroundColor Yellow
    Write-Host ""
    
    stripe login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Login falhou!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Autenticado no Stripe" -ForegroundColor Green
Write-Host ""

# Passo 3: Verificar se o servidor está rodando
Write-Host "📋 Passo 3: Verificando servidor Next.js..." -ForegroundColor Yellow
$serverRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $serverRunning) {
    Write-Host "⚠️  Servidor Next.js não está rodando na porta 3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor, em outro terminal, execute:" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Pressione Enter quando o servidor estiver rodando (ou 'n' para cancelar)"
    
    if ($continue -eq 'n') {
        Write-Host "❌ Cancelado pelo usuário" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Servidor detectado na porta 3000" -ForegroundColor Green
Write-Host ""

# Passo 4: Informações importantes
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "📋 INFORMAÇÕES IMPORTANTES" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "O Stripe CLI vai:" -ForegroundColor White
Write-Host "  1. Gerar um webhook signing secret (whsec_...)" -ForegroundColor White
Write-Host "  2. Escutar eventos do Stripe" -ForegroundColor White
Write-Host "  3. Encaminhar para: localhost:3000/api/checkout/webhook" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  ATENÇÃO:" -ForegroundColor Yellow
Write-Host "  • Copie o 'webhook signing secret' que aparecerá" -ForegroundColor White
Write-Host "  • Cole no arquivo .env.local como STRIPE_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "  • Reinicie o servidor Next.js após configurar" -ForegroundColor White
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$ready = Read-Host "Pressione Enter para iniciar o listener (ou 'n' para cancelar)"

if ($ready -eq 'n') {
    Write-Host "❌ Cancelado pelo usuário" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando Stripe Webhook Listener..." -ForegroundColor Green
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Passo 5: Iniciar o listener
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Se o listener for interrompido
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "👋 Stripe listener encerrado" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para reiniciar, execute:" -ForegroundColor White
Write-Host "  stripe listen --forward-to localhost:3000/api/checkout/webhook" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou use o script:" -ForegroundColor White
Write-Host "  .\setup-webhook.ps1" -ForegroundColor Cyan
Write-Host ""
