Write-Host ""
Write-Host "🚀 Iniciando Stripe Webhook Listener..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Copie o 'webhook signing secret' que aparecer!" -ForegroundColor Yellow
Write-Host ""

.\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook
