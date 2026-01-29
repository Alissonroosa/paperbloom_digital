/**
 * Script para verificar se o webhook está sendo chamado
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== Verificação do Webhook ===\n');

console.log('1. Configuração do Stripe:');
console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Presente' : '❌ Ausente');
console.log('   STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Presente' : '❌ Ausente');
console.log('   NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

console.log('\n2. Configuração do Resend:');
console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Presente' : '❌ Ausente');
console.log('   RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
console.log('   RESEND_FROM_NAME:', process.env.RESEND_FROM_NAME);

console.log('\n3. Endpoint do Webhook:');
console.log('   URL:', `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/webhook`);

console.log('\n4. Como testar o webhook:');
console.log('   a) Certifique-se de que o servidor Next.js está rodando (npm run dev)');
console.log('   b) Certifique-se de que o Stripe CLI está encaminhando webhooks:');
console.log('      stripe listen --forward-to localhost:3000/api/checkout/webhook');
console.log('   c) Faça um pagamento de teste no checkout');
console.log('   d) Verifique os logs do servidor Next.js e do Stripe CLI');

console.log('\n5. Verificar se o webhook está configurado no Stripe Dashboard:');
console.log('   a) Acesse: https://dashboard.stripe.com/test/webhooks');
console.log('   b) Verifique se há um endpoint configurado');
console.log('   c) Verifique se o evento "checkout.session.completed" está habilitado');

console.log('\n6. Comandos úteis:');
console.log('   - Iniciar servidor: npm run dev');
console.log('   - Iniciar webhook: stripe listen --forward-to localhost:3000/api/checkout/webhook');
console.log('   - Testar webhook: stripe trigger checkout.session.completed');

console.log('\n💡 IMPORTANTE:');
console.log('   O webhook só funciona se:');
console.log('   1. O servidor Next.js estiver rodando');
console.log('   2. O Stripe CLI estiver encaminhando webhooks (desenvolvimento)');
console.log('   3. OU o webhook estiver configurado no Dashboard (produção)');
