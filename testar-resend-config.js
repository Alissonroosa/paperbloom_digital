/**
 * Script para testar a configuração do Resend
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== Verificando Configuração do Resend ===\n');

const config = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL,
  fromName: process.env.RESEND_FROM_NAME,
};

console.log('RESEND_API_KEY:', config.apiKey ? `Presente (${config.apiKey.substring(0, 10)}...)` : '❌ AUSENTE');
console.log('RESEND_FROM_EMAIL:', config.fromEmail || '❌ AUSENTE');
console.log('RESEND_FROM_NAME:', config.fromName || '❌ AUSENTE');

if (!config.apiKey || !config.fromEmail || !config.fromName) {
  console.error('\n❌ Configuração incompleta! Verifique o arquivo .env.local');
  process.exit(1);
}

console.log('\n✅ Configuração do Resend está completa!');

// Testar conexão com Resend
async function testResendConnection() {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(config.apiKey);
    
    console.log('\n=== Testando Conexão com Resend ===\n');
    
    // Tentar enviar um email de teste
    const result = await resend.emails.send({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: config.fromEmail, // Enviar para o próprio email
      subject: 'Teste de Configuração - Paper Bloom',
      html: '<h1>Teste de Configuração</h1><p>Se você recebeu este email, o Resend está configurado corretamente!</p>',
    });
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log('Message ID:', result.data?.id);
    console.log('\nVerifique sua caixa de entrada:', config.fromEmail);
    
  } catch (error) {
    console.error('\n❌ Erro ao testar Resend:', error.message);
    if (error.message.includes('API key')) {
      console.error('\n💡 Dica: Verifique se a API key do Resend está correta');
      console.error('   Acesse: https://resend.com/api-keys');
    }
    if (error.message.includes('domain')) {
      console.error('\n💡 Dica: Verifique se o domínio está verificado no Resend');
      console.error('   Acesse: https://resend.com/domains');
    }
  }
}

testResendConnection();
