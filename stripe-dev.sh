#!/bin/bash

# Script para facilitar o desenvolvimento com Stripe
# Execute este script para iniciar o listener do Stripe CLI

echo "🎯 Paper Bloom - Stripe Development Helper"
echo "=========================================="
echo ""

# Verificar se o Stripe CLI está instalado
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI não está instalado!"
    echo ""
    echo "Instale usando um dos métodos:"
    echo "  • macOS: brew install stripe/stripe-cli/stripe"
    echo "  • Linux: https://stripe.com/docs/stripe-cli#install"
    echo ""
    echo "📖 Consulte STRIPE_CLI_SETUP.md para mais detalhes"
    exit 1
fi

echo "✓ Stripe CLI encontrado"
echo ""

# Verificar se está logado
echo "🔐 Verificando autenticação..."
if ! stripe config --list &> /dev/null; then
    echo "❌ Você não está logado no Stripe!"
    echo ""
    echo "Execute: stripe login"
    exit 1
fi

echo "✓ Autenticado no Stripe"
echo ""

# Informações importantes
echo "📋 INFORMAÇÕES IMPORTANTES:"
echo "  • Endpoint: localhost:3000/api/checkout/webhook"
echo "  • Evento principal: checkout.session.completed"
echo ""

echo "⚠️  ATENÇÃO:"
echo "  1. Copie o 'webhook signing secret' (whsec_...) que aparecerá"
echo "  2. Cole no arquivo .env.local como STRIPE_WEBHOOK_SECRET"
echo "  3. Reinicie o servidor Next.js (npm run dev)"
echo ""

echo "🚀 Iniciando Stripe listener..."
echo ""
echo "=========================================="
echo ""

# Iniciar o listener
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Se o listener for interrompido
echo ""
echo "👋 Stripe listener encerrado"
