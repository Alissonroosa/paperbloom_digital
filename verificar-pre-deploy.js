#!/usr/bin/env node

/**
 * Script de Verificação Pré-Deploy
 * Verifica se tudo está pronto para o deploy em produção
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando preparação para deploy...\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Verificar arquivos essenciais
console.log('📁 Verificando arquivos essenciais...');
const requiredFiles = [
  'Dockerfile',
  '.dockerignore',
  'package.json',
  'next.config.mjs',
  '.env.example',
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success.push(`✅ ${file} encontrado`);
  } else {
    errors.push(`❌ ${file} não encontrado`);
  }
});

// 2. Verificar next.config.mjs
console.log('\n⚙️  Verificando next.config.mjs...');
try {
  const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
  if (nextConfig.includes("output: 'standalone'")) {
    success.push('✅ next.config.mjs configurado com output: standalone');
  } else {
    errors.push('❌ next.config.mjs sem output: standalone');
  }
} catch (error) {
  errors.push('❌ Erro ao ler next.config.mjs');
}

// 3. Verificar package.json scripts
console.log('\n📦 Verificando package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['build', 'start'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      success.push(`✅ Script "${script}" encontrado`);
    } else {
      errors.push(`❌ Script "${script}" não encontrado`);
    }
  });

  // Verificar dependências críticas
  const criticalDeps = ['next', 'react', 'react-dom', 'stripe', 'pg', 'resend'];
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      success.push(`✅ Dependência "${dep}" encontrada`);
    } else {
      warnings.push(`⚠️  Dependência "${dep}" não encontrada`);
    }
  });
} catch (error) {
  errors.push('❌ Erro ao ler package.json');
}

// 4. Verificar .env.example
console.log('\n🔐 Verificando variáveis de ambiente...');
try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_BASE_URL',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
  ];

  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      success.push(`✅ Variável ${envVar} documentada`);
    } else {
      warnings.push(`⚠️  Variável ${envVar} não documentada`);
    }
  });
} catch (error) {
  errors.push('❌ Erro ao ler .env.example');
}

// 5. Verificar estrutura de diretórios
console.log('\n📂 Verificando estrutura de diretórios...');
const requiredDirs = [
  'src/app',
  'src/components',
  'src/lib',
  'src/services',
  'public',
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    success.push(`✅ Diretório ${dir} encontrado`);
  } else {
    errors.push(`❌ Diretório ${dir} não encontrado`);
  }
});

// 6. Verificar health check endpoint
console.log('\n🏥 Verificando health check...');
const healthCheckPath = 'src/app/api/health/route.ts';
if (fs.existsSync(healthCheckPath)) {
  success.push('✅ Health check endpoint encontrado');
} else {
  warnings.push('⚠️  Health check endpoint não encontrado');
}

// 7. Verificar .dockerignore
console.log('\n🚫 Verificando .dockerignore...');
try {
  const dockerignore = fs.readFileSync('.dockerignore', 'utf8');
  const shouldIgnore = ['node_modules', '.env', '.env.local', '.next', '*.md'];
  
  shouldIgnore.forEach(pattern => {
    if (dockerignore.includes(pattern)) {
      success.push(`✅ .dockerignore inclui ${pattern}`);
    } else {
      warnings.push(`⚠️  .dockerignore não inclui ${pattern}`);
    }
  });
} catch (error) {
  errors.push('❌ Erro ao ler .dockerignore');
}

// Resumo
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA VERIFICAÇÃO');
console.log('='.repeat(60));

if (success.length > 0) {
  console.log('\n✅ SUCESSOS:');
  success.forEach(msg => console.log(`   ${msg}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVISOS:');
  warnings.forEach(msg => console.log(`   ${msg}`));
}

if (errors.length > 0) {
  console.log('\n❌ ERROS:');
  errors.forEach(msg => console.log(`   ${msg}`));
}

console.log('\n' + '='.repeat(60));

if (errors.length === 0) {
  console.log('✅ PRONTO PARA DEPLOY!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "feat: preparar para deploy em produção"');
  console.log('   3. git push origin main');
  console.log('   4. Configurar no Coolify');
  console.log('\n📖 Consulte: DEPLOY_PRODUCAO_GUIA_COMPLETO.md');
  process.exit(0);
} else {
  console.log('❌ CORRIJA OS ERROS ANTES DO DEPLOY');
  console.log('\n📖 Consulte: DEPLOY_PRODUCAO_GUIA_COMPLETO.md');
  process.exit(1);
}
