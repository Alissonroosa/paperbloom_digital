# Script para verificar status do ambiente de desenvolvimento

Write-Host "`nVerificando Status do Sistema`n" -ForegroundColor Cyan

# 1. Verificar Stripe CLI
Write-Host "1. Stripe CLI" -ForegroundColor Yellow
if (Test-Path "stripe.exe") {
    $version = .\stripe.exe --version 2>&1
    Write-Host "   OK - Instalado: $version" -ForegroundColor Green
    
    # Verificar login
    $loginCheck = .\stripe.exe config --list 2>&1
    if ($loginCheck -match "not logged in") {
        Write-Host "   AVISO - Nao esta logado - Execute: .\stripe.exe login" -ForegroundColor Yellow
    } else {
        Write-Host "   OK - Login verificado" -ForegroundColor Green
    }
} else {
    Write-Host "   ERRO - Nao encontrado" -ForegroundColor Red
}

# 2. Verificar servidor Next.js
Write-Host "`n2. Servidor Next.js" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK - Rodando (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ERRO - Nao esta rodando" -ForegroundColor Red
    Write-Host "   Execute: npm run dev" -ForegroundColor Yellow
}

# 3. Verificar variáveis de ambiente
Write-Host "`n3. Variaveis de Ambiente (.env.local)" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content .env.local
    
    $requiredVars = @(
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "RESEND_API_KEY"
    )
    
    foreach ($var in $requiredVars) {
        $found = $envContent | Select-String "^$var="
        if ($found) {
            Write-Host "   OK - $var" -ForegroundColor Green
        } else {
            Write-Host "   ERRO - $var nao encontrado" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ERRO - Arquivo .env.local nao encontrado" -ForegroundColor Red
}

# 4. Verificar estrutura de pastas
Write-Host "`n4. Estrutura de Pastas" -ForegroundColor Yellow
$requiredDirs = @(
    "public/uploads/qrcodes",
    "public/uploads/images"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   OK - $dir" -ForegroundColor Green
    } else {
        Write-Host "   AVISO - $dir nao existe - Criando..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   OK - Criado!" -ForegroundColor Green
    }
}

# Resumo
Write-Host "`nResumo:" -ForegroundColor Cyan

$allGood = $true
if (-not (Test-Path "stripe.exe")) { $allGood = $false }
if (-not (Test-Path ".env.local")) { $allGood = $false }

if ($allGood) {
    Write-Host "Sistema pronto para desenvolvimento!" -ForegroundColor Green
    Write-Host "Execute: .\iniciar-desenvolvimento.ps1`n" -ForegroundColor Cyan
} else {
    Write-Host "Alguns itens precisam de atencao" -ForegroundColor Yellow
    Write-Host "Verifique os itens marcados acima`n" -ForegroundColor Yellow
}
