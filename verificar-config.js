/**
 * Script de Verificação de Configuração
 * 
 * Verifica se todas as variáveis de ambiente necessárias estão configuradas
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do sistema...\n');

// Verificar .env.local
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env.local não encontrado!');
  console.log('\n📝 Crie o arquivo .env.local com as seguintes variáveis:');
  console.log(`
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Paper Bloom
NEXT_PUBLIC_BASE_URL=http://localhost:3000
  `);
  process.exit(1);
}

console.log('✅ Arquivo .env.local encontrado\n');

// Ler e verificar variáveis
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const requiredVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NEXT_PUBLIC_BASE_URL'
];

const optionalVars = [
  'RESEND_FROM_NAME',
  'DATABASE_URL'
];

console.log('📋 Variáveis Obrigatórias:\n');

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value.length > 10) {
    const masked = value.substring(0, 10) + '...';
    console.log(`   ✅ ${varName}: ${masked}`);
  } else if (value) {
    console.log(`   ⚠️  ${varName}: Configurado mas parece muito curto`);
    allConfigured = false;
  } else {
    console.log(`   ❌ ${varName}: NÃO CONFIGURADO`);
    allConfigured = false;
  }
});

console.log('\n📋 Variáveis Opcionais:\n');

optionalVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    const masked = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`   ✅ ${varName}: ${masked}`);
  } else {
    console.log(`   ⚪ ${varName}: Não configurado (opcional)`);
  }
});

// Verificar pasta de QR Codes
console.log('\n📁 Verificando estrutura de pastas:\n');

const qrCodesPath = path.join(__dirname, 'public', 'qr-codes');

if (fs.existsSync(qrCodesPath)) {
  console.log('   ✅ Pasta public/qr-codes existe');
  
  const files = fs.readdirSync(qrCodesPath);
  console.log(`   📊 ${files.length} arquivo(s) QR Code encontrado(s)`);
} else {
  console.log('   ⚠️  Pasta public/qr-codes NÃO existe');
  console.log('   💡 Criando pasta...');
  
  try {
    fs.mkdirSync(qrCodesPath, { recursive: true });
    console.log('   ✅ Pasta criada com sucesso!');
  } catch (error) {
    console.log('   ❌ Erro ao criar pasta:', error.message);
    allConfigured = false;
  }
}

// Verificar se o servidor está rodando
console.log('\n🌐 Verificando servidor:\n');

const http = require('http');

const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

checkServer().then(isRunning => {
  if (isRunning) {
    console.log('   ✅ Servidor Next.js está rodando em http://localhost:3000');
  } else {
    console.log('   ⚠️  Servidor Next.js NÃO está rodando');
    console.log('   💡 Inicie o servidor com: npm run dev');
  }

  // Resumo final
  console.log('\n═══════════════════════════════════════════════════════');
  
  if (allConfigured && isRunning) {
    console.log('🎉 TUDO CONFIGURADO CORRETAMENTE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✅ Você pode testar o fluxo completo agora!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Execute: node test-fluxo-completo.js');
    console.log('   2. Ou acesse: http://localhost:3000/editor/mensagem');
    console.log('   3. Configure Stripe CLI para webhook real:');
    console.log('      stripe listen --forward-to localhost:3000/api/checkout/webhook');
  } else {
    console.log('⚠️  CONFIGURAÇÃO INCOMPLETA');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🔧 Corrija os problemas acima antes de continuar.');
    
    if (!allConfigured) {
      console.log('\n📝 Variáveis faltando:');
      requiredVars.forEach(varName => {
        if (!envVars[varName] || envVars[varName].length < 10) {
          console.log(`   - ${varName}`);
        }
      });
    }
    
    if (!isRunning) {
      console.log('\n🚀 Inicie o servidor: npm run dev');
    }
  }
  
  console.log('\n');
});
