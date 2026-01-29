# Script para iniciar servidor e webhook automaticamente

Write-Host "=== Iniciando Paper Bloom com Webhook ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Stripe CLI está instalado
Write-Host "1. Verificando Stripe CLI..." -ForegroundColor Yellow
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue
if (-not $stripeInstalled) {
    Write-Host "   ❌ Stripe CLI não encontrado!" -ForegroundColor Red
    Write-Host "   Instale com: scoop install stripe" -ForegroundColor Yellow
    Write-Host "   Ou baixe de: https://stripe.com/docs/stripe-cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ Stripe CLI encontrado" -ForegroundColor Green

# Verificar se está logado no Stripe
Write-Host ""
Write-Host "2. Verificando login no Stripe..." -ForegroundColor Yellow
$stripeConfig = stripe config --list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Não está logado no Stripe!" -ForegroundColor Red
    Write-Host "   Execute: stripe login" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ Logado no Stripe" -ForegroundColor Green

# Verificar se a porta 3000 está livre
Write-Host ""
Write-Host "3. Verificando porta 3000..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "   ⚠️  Porta 3000 em uso!" -ForegroundColor Yellow
    Write-Host "   Matando processo..." -ForegroundColor Yellow
    $processId = $portInUse.OwningProcess
    Stop-Process -Id $processId -Force
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Porta 3000 liberada" -ForegroundColor Green
} else {
    Write-Host "   ✅ Porta 3000 disponível" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Iniciando Serviços ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1: Servidor Next.js (http://localhost:3000)" -ForegroundColor Magenta
Write-Host "Terminal 2: Stripe Webhook Listener" -ForegroundColor Magenta
Write-Host ""
Write-Host "Pressione Ctrl+C em qualquer terminal para parar tudo" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor Next.js em um novo terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== Servidor Next.js ===' -ForegroundColor Cyan; npm run dev"

# Aguardar 5 segundos para o servidor iniciar
Write-Host "Aguardando servidor iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar Stripe webhook listener em outro terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== Stripe Webhook Listener ===' -ForegroundColor Cyan; stripe listen --forward-to localhost:3000/api/checkout/webhook"

Write-Host ""
Write-Host "✅ Serviços iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse: http://localhost:3000/editor/mensagem" -ForegroundColor White
Write-Host "2. Preencha o formulário (não esqueça o email!)" -ForegroundColor White
Write-Host "3. Faça um pagamento de teste" -ForegroundColor White
Write-Host "4. Verifique os logs nos terminais" -ForegroundColor White
Write-Host "5. Verifique seu email" -ForegroundColor White
Write-Host ""
Write-Host "Para enviar emails de mensagens antigas:" -ForegroundColor Cyan
Write-Host "node enviar-emails-pendentes.js" -ForegroundColor White
Write-Host ""
