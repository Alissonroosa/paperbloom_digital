# Script para desativar PIX temporariamente

Write-Host ""
Write-Host "Desativando PIX temporariamente..." -ForegroundColor Yellow
Write-Host ""

# Backup
Write-Host "Criando backup..." -ForegroundColor Cyan
Copy-Item "src/services/StripeService.ts" "src/services/StripeService.ts.pix-backup" -Force
Write-Host "Backup criado" -ForegroundColor Green
Write-Host ""

# Reverter StripeService
Write-Host "Revertendo StripeService para apenas cartao..." -ForegroundColor Cyan
$stripeContent = Get-Content "src/services/StripeService.ts" -Raw
$stripeContent = $stripeContent -replace "payment_method_types: \['card', 'pix'\]", "payment_method_types: ['card']"
$stripeContent = $stripeContent -replace "payment_method_options: \{[^}]*pix:[^}]*\},", ""
Set-Content "src/services/StripeService.ts" $stripeContent -NoNewline
Write-Host "StripeService atualizado" -ForegroundColor Green
Write-Host ""

Write-Host "PIX desativado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Para reativar PIX no futuro:" -ForegroundColor Yellow
Write-Host "  1. Leia: REATIVAR_PIX_QUANDO_DISPONIVEL.md" -ForegroundColor Gray
Write-Host "  2. Ou restaure o backup" -ForegroundColor Gray
Write-Host ""
Write-Host "Sua aplicacao agora aceita apenas pagamentos por cartao." -ForegroundColor Green
Write-Host ""
