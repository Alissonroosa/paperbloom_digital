# Script para configurar o Stripe CLI no Windows
# Execute este script como Administrador

Write-Host "🎯 Paper Bloom - Instalação do Stripe CLI" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se já está instalado
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue

if ($stripeInstalled) {
    Write-Host "✓ Stripe CLI já está instalado!" -ForegroundColor Green
    Write-Host "  Versão: " -NoNewline
    stripe --version
    Write-Host ""
    Write-Host "Pule para o próximo passo: Login no Stripe" -ForegroundColor Yellow
    exit 0
}

Write-Host "📋 OPÇÕES DE INSTALAÇÃO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Scoop (Recomendado - Gerenciador de Pacotes)" -ForegroundColor White
Write-Host "2. Chocolatey (Se você já tem instalado)" -ForegroundColor White
Write-Host "3. Download Manual" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Escolha uma opção (1, 2 ou 3)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "📦 Instalando via Scoop..." -ForegroundColor Cyan
    
    # Verificar se Scoop está instalado
    $scoopInstalled = Get-Command scoop -ErrorAction SilentlyContinue
    
    if (-not $scoopInstalled) {
        Write-Host "⚠️  Scoop não está instalado. Instalando Scoop primeiro..." -ForegroundColor Yellow
        Write-Host ""
        
        # Instalar Scoop
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
        
        Write-Host ""
        Write-Host "✓ Scoop instalado!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Instalando Stripe CLI..." -ForegroundColor Cyan
    scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
    scoop install stripe
    
    Write-Host ""
    Write-Host "✓ Stripe CLI instalado com sucesso!" -ForegroundColor Green
}
elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "📦 Instalando via Chocolatey..." -ForegroundColor Cyan
    
    # Verificar se Chocolatey está instalado
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
    
    if (-not $chocoInstalled) {
        Write-Host "❌ Chocolatey não está instalado!" -ForegroundColor Red
        Write-Host "   Instale em: https://chocolatey.org/install" -ForegroundColor Yellow
        exit 1
    }
    
    choco install stripe-cli -y
    
    Write-Host ""
    Write-Host "✓ Stripe CLI instalado com sucesso!" -ForegroundColor Green
}
elseif ($choice -eq "3") {
    Write-Host ""
    Write-Host "📥 Download Manual" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Acesse: https://github.com/stripe/stripe-cli/releases/latest" -ForegroundColor White
    Write-Host "2. Baixe: stripe_X.X.X_windows_x86_64.zip" -ForegroundColor White
    Write-Host "3. Extraia o arquivo ZIP" -ForegroundColor White
    Write-Host "4. Mova stripe.exe para: C:\Program Files\Stripe\" -ForegroundColor White
    Write-Host "5. Adicione ao PATH do sistema" -ForegroundColor White
    Write-Host ""
    Write-Host "Abrindo página de download..." -ForegroundColor Yellow
    Start-Process "https://github.com/stripe/stripe-cli/releases/latest"
    Write-Host ""
    Write-Host "Após instalar, execute este script novamente para verificar." -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "❌ Opção inválida!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Verificando instalação..." -ForegroundColor Cyan
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue

if ($stripeInstalled) {
    Write-Host "✓ Instalação confirmada!" -ForegroundColor Green
    Write-Host "  Versão: " -NoNewline
    stripe --version
    Write-Host ""
    Write-Host "🎉 Pronto! Agora execute: stripe login" -ForegroundColor Green
} else {
    Write-Host "❌ Algo deu errado. Tente reiniciar o terminal." -ForegroundColor Red
}
