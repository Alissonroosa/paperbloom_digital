require('dotenv').config({ path: '.env.local' });

console.log('\n📧 Teste de Envio de Email via Webhook\n');
console.log('═══════════════════════════════════════════════════════\n');

// Verificar configuração do Resend
console.log('🔍 Verificando configuração do Resend...\n');

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

if (!resendApiKey) {
  console.log('❌ RESEND_API_KEY não configurado no .env.local\n');
  process.exit(1);
}

if (!fromEmail) {
  console.log('❌ RESEND_FROM_EMAIL não configurado no .env.local\n');
  process.exit(1);
}

console.log('✅ RESEND_API_KEY: Configurado');
console.log(`✅ RESEND_FROM_EMAIL: ${fromEmail}\n`);

console.log('═══════════════════════════════════════════════════════\n');
console.log('💡 Para testar o envio de email:\n');
console.log('1. Certifique-se que o Next.js está rodando (npm run dev)');
console.log('2. Certifique-se que o Stripe CLI está rodando');
console.log('3. Faça um pagamento de teste no wizard');
console.log('4. Verifique os logs do terminal do Next.js');
console.log('5. Verifique seu email\n');

console.log('═══════════════════════════════════════════════════════\n');
console.log('🔍 Logs para procurar no terminal do Next.js:\n');
console.log('✅ "[EmailService] Attempting to send QR code email"');
console.log('✅ "[EmailService] Email sent successfully"');
console.log('❌ "[EmailService] Email send failed" (se houver erro)\n');

console.log('═══════════════════════════════════════════════════════\n');
