Write-Host ""
Write-Host "Verificando Stripe CLI..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o processo stripe está rodando
$stripeProcess = Get-Process -Name "stripe" -ErrorAction SilentlyContinue

if ($stripeProcess) {
    Write-Host "OK - Stripe CLI esta rodando" -ForegroundColor Green
    Write-Host ""
    Write-Host "Detalhes do processo:" -ForegroundColor Yellow
    $stripeProcess | Format-Table Id, ProcessName, StartTime -AutoSize
    Write-Host ""
    Write-Host "O webhook listener esta ativo!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "ERRO - Stripe CLI NAO esta rodando" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para iniciar o Stripe CLI:" -ForegroundColor Yellow
    Write-Host "  .\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook" -ForegroundColor White
    Write-Host ""
    Write-Host "OU use o script:" -ForegroundColor Yellow
    Write-Host "  .\iniciar-webhook.ps1" -ForegroundColor White
    Write-Host ""
}
