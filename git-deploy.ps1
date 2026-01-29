# ============================================
# Script de Deploy - Paper Bloom
# ============================================
# Automatiza o processo de commit e push para deploy

Write-Host "🚀 Paper Bloom - Deploy Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar preparação
Write-Host "🔍 Verificando preparação para deploy..." -ForegroundColor Yellow
node verificar-pre-deploy.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Verificação falhou! Corrija os erros antes de continuar." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Verificação concluída com sucesso!" -ForegroundColor Green
Write-Host ""

# 2. Mostrar status do Git
Write-Host "📊 Status do Git:" -ForegroundColor Yellow
git status --short

Write-Host ""
$continue = Read-Host "Deseja continuar com o commit e push? (s/n)"

if ($continue -ne "s" -and $continue -ne "S") {
    Write-Host "❌ Deploy cancelado pelo usuário." -ForegroundColor Red
    exit 0
}

# 3. Adicionar arquivos
Write-Host ""
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Yellow
git add .

# 4. Commit
Write-Host ""
$commitMessage = Read-Host "Mensagem do commit (Enter para usar padrão)"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "feat: preparar para deploy em produção"
}

Write-Host "💾 Fazendo commit: $commitMessage" -ForegroundColor Yellow
git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  Nenhuma alteração para commit ou erro no commit." -ForegroundColor Yellow
    Write-Host ""
    $forcePush = Read-Host "Deseja fazer push mesmo assim? (s/n)"
    
    if ($forcePush -ne "s" -and $forcePush -ne "S") {
        Write-Host "❌ Deploy cancelado." -ForegroundColor Red
        exit 0
    }
}

# 5. Push
Write-Host ""
Write-Host "🚀 Fazendo push para GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push!" -ForegroundColor Red
    Write-Host "Verifique sua conexão e permissões do Git." -ForegroundColor Red
    exit 1
}

# 6. Sucesso
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ DEPLOY INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Acesse o painel do Coolify" -ForegroundColor White
Write-Host "   2. Verifique se o deploy automático iniciou" -ForegroundColor White
Write-Host "   3. Ou clique em 'Redeploy' manualmente" -ForegroundColor White
Write-Host "   4. Aguarde o build (5-10 minutos)" -ForegroundColor White
Write-Host "   5. Verifique: https://seu-dominio.com.br/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulte: DEPLOY_PRODUCAO_GUIA_COMPLETO.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Bom deploy!" -ForegroundColor Green
