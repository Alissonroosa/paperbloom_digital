# Script para verificar status do ambiente de desenvolvimento

Write-Host "`n🔍 Verificando Status do Sistema" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# 1. Verificar Stripe CLI
Write-Host "1️⃣  Stripe CLI" -ForegroundColor Yellow
if (Test-Path "stripe.exe") {
    $version = .\stripe.exe --version 2>&1
    Write-Host "   ✅ Instalado: $version" -ForegroundColor Green
    
    # Verificar login
    $loginCheck = .\stripe.exe config --list 2>&1
    if ($loginCheck -match "not logged in") {
        Write-Host "   ⚠️  Não está logado - Execute: .\stripe.exe login" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Login verificado" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Não encontrado" -ForegroundColor Red
    Write-Host "   📥 Baixe em: https://github.com/stripe/stripe-cli/releases" -ForegroundColor Yellow
}

# 2. Verificar servidor Next.js
Write-Host "`n2️⃣  Servidor Next.js" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Rodando (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Não está rodando" -ForegroundColor Red
    Write-Host "   💡 Execute: npm run dev" -ForegroundColor Yellow
}

# 3. Verificar Node.js
Write-Host "`n3️⃣  Node.js" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Não encontrado" -ForegroundColor Red
}

# 4. Verificar variáveis de ambiente
Write-Host "`n4️⃣  Variáveis de Ambiente (.env.local)" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content .env.local
    
    $requiredVars = @(
        "DATABASE_URL",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "RESEND_API_KEY",
        "RESEND_FROM_EMAIL",
        "R2_BUCKET_NAME"
    )
    
    foreach ($var in $requiredVars) {
        $found = $envContent | Select-String "^$var="
        if ($found) {
            Write-Host "   ✅ $var" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $var não encontrado" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ Arquivo .env.local não encontrado" -ForegroundColor Red
}

# 5. Verificar estrutura de pastas
Write-Host "`n5️⃣  Estrutura de Pastas" -ForegroundColor Yellow
$requiredDirs = @(
    "public/uploads/qrcodes",
    "public/uploads/images",
    "src/app/api",
    "src/services"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir não existe" -ForegroundColor Red
        Write-Host "      💡 Criando..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "      ✅ Criado!" -ForegroundColor Green
    }
}

# 6. Verificar banco de dados
Write-Host "`n6️⃣  Banco de Dados PostgreSQL" -ForegroundColor Yellow
try {
    $dbUrl = $envContent | Select-String "^DATABASE_URL=" | ForEach-Object { $_.ToString().Split('=')[1] }
    if ($dbUrl) {
        Write-Host "   ✅ URL configurada" -ForegroundColor Green
        Write-Host "   💡 Para testar conexão: node verificar-schema-card-collections.js" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ DATABASE_URL não configurada" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Não foi possível verificar" -ForegroundColor Yellow
}

# 7. Verificar dependências
Write-Host "`n7️⃣  Dependências Node.js" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules não encontrado" -ForegroundColor Red
    Write-Host "   💡 Execute: npm install" -ForegroundColor Yellow
}

# Resumo
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Resumo" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$allGood = $true

# Verificar itens críticos
if (-not (Test-Path "stripe.exe")) { $allGood = $false }
if (-not (Test-Path ".env.local")) { $allGood = $false }
if (-not (Test-Path "node_modules")) { $allGood = $false }

if ($allGood) {
    Write-Host "`n✅ Sistema pronto para desenvolvimento!" -ForegroundColor Green
    Write-Host "   Execute: .\iniciar-desenvolvimento.ps1`n" -ForegroundColor Cyan
} else {
    Write-Host "`n[!] Alguns itens precisam de atencao" -ForegroundColor Yellow
    Write-Host "   Verifique os itens marcados acima`n" -ForegroundColor Yellow
}
