/**
 * Script de validação da configuração do Stripe
 * Verifica se todas as credenciais necessárias estão configuradas
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

function validateStripeSetup(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    info: [],
  };

  console.log('🔍 Validando configuração do Stripe...\n');

  // Verificar STRIPE_SECRET_KEY
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    result.isValid = false;
    result.errors.push('❌ STRIPE_SECRET_KEY não está configurada');
  } else if (secretKey.includes('your_stripe_secret_key') || secretKey.includes('COLE_SUA')) {
    result.isValid = false;
    result.errors.push('❌ STRIPE_SECRET_KEY ainda contém o valor placeholder');
    result.info.push('   Configure com sua chave real do Stripe Dashboard');
  } else if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    result.isValid = false;
    result.errors.push('❌ STRIPE_SECRET_KEY tem formato inválido (deve começar com sk_test_ ou sk_live_)');
  } else {
    if (secretKey.startsWith('sk_test_')) {
      result.info.push('✓ STRIPE_SECRET_KEY configurada (modo teste)');
    } else {
      result.warnings.push('⚠ STRIPE_SECRET_KEY está em modo PRODUÇÃO (sk_live_)');
      result.info.push('   Certifique-se de que isso é intencional');
    }
  }

  // Verificar STRIPE_WEBHOOK_SECRET
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    result.isValid = false;
    result.errors.push('❌ STRIPE_WEBHOOK_SECRET não está configurada');
  } else if (webhookSecret.includes('your_webhook_secret') || webhookSecret.includes('COLE_SEU')) {
    result.isValid = false;
    result.errors.push('❌ STRIPE_WEBHOOK_SECRET ainda contém o valor placeholder');
    result.info.push('   Configure com o webhook secret do Stripe Dashboard');
  } else if (!webhookSecret.startsWith('whsec_')) {
    result.isValid = false;
    result.errors.push('❌ STRIPE_WEBHOOK_SECRET tem formato inválido (deve começar com whsec_)');
  } else {
    result.info.push('✓ STRIPE_WEBHOOK_SECRET configurada');
  }

  // Verificar NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    result.isValid = false;
    result.errors.push('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não está configurada');
  } else if (publishableKey.includes('your_publishable_key') || publishableKey.includes('COLE_SUA')) {
    result.isValid = false;
    result.errors.push('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ainda contém o valor placeholder');
    result.info.push('   Configure com sua chave pública do Stripe Dashboard');
  } else if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    result.isValid = false;
    result.errors.push('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY tem formato inválido (deve começar com pk_test_ ou pk_live_)');
  } else {
    if (publishableKey.startsWith('pk_test_')) {
      result.info.push('✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configurada (modo teste)');
    } else {
      result.warnings.push('⚠ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY está em modo PRODUÇÃO (pk_live_)');
    }
  }

  // Verificar consistência entre chaves de teste e produção
  if (secretKey && publishableKey) {
    const secretIsTest = secretKey.startsWith('sk_test_');
    const publishableIsTest = publishableKey.startsWith('pk_test_');

    if (secretIsTest !== publishableIsTest) {
      result.isValid = false;
      result.errors.push('❌ Inconsistência: Secret key e Publishable key estão em modos diferentes (teste vs produção)');
      result.info.push('   Ambas devem ser de teste (sk_test_ e pk_test_) ou produção (sk_live_ e pk_live_)');
    }
  }

  // Verificar NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    result.warnings.push('⚠ NEXT_PUBLIC_BASE_URL não está configurada (usando padrão: http://localhost:3000)');
  } else {
    result.info.push(`✓ NEXT_PUBLIC_BASE_URL: ${baseUrl}`);
  }

  return result;
}

function printResults(result: ValidationResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('RESULTADO DA VALIDAÇÃO');
  console.log('='.repeat(60) + '\n');

  // Imprimir erros
  if (result.errors.length > 0) {
    console.log('ERROS:');
    result.errors.forEach((error) => console.log(error));
    console.log();
  }

  // Imprimir avisos
  if (result.warnings.length > 0) {
    console.log('AVISOS:');
    result.warnings.forEach((warning) => console.log(warning));
    console.log();
  }

  // Imprimir informações
  if (result.info.length > 0) {
    console.log('INFORMAÇÕES:');
    result.info.forEach((info) => console.log(info));
    console.log();
  }

  // Resultado final
  console.log('='.repeat(60));
  if (result.isValid) {
    console.log('✅ CONFIGURAÇÃO VÁLIDA - Stripe está pronto para uso!');
  } else {
    console.log('❌ CONFIGURAÇÃO INVÁLIDA - Corrija os erros acima');
    console.log('\n📖 Consulte o arquivo STRIPE_SETUP.md para instruções detalhadas');
  }
  console.log('='.repeat(60) + '\n');
}

// Executar validação
const result = validateStripeSetup();
printResults(result);

// Sair com código apropriado
process.exit(result.isValid ? 0 : 1);
