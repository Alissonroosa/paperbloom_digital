/**
 * Teste Direto do Resend
 * 
 * Testa o Resend diretamente sem passar pelo sistema de validação
 */

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testarResendDireto() {
  console.log('📧 Testando Resend diretamente...\n');

  // Verificar variáveis de ambiente
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const fromName = process.env.RESEND_FROM_NAME || 'Paper Bloom';

  console.log('🔍 Verificando configuração:');
  console.log(`   RESEND_API_KEY: ${apiKey ? apiKey.substring(0, 10) + '...' : '❌ NÃO CONFIGURADO'}`);
  console.log(`   RESEND_FROM_EMAIL: ${fromEmail || '❌ NÃO CONFIGURADO'}`);
  console.log(`   RESEND_FROM_NAME: ${fromName}\n`);

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY não está configurado no .env.local\n');
    console.log('💡 Solução:');
    console.log('   1. Acesse: https://resend.com/api-keys');
    console.log('   2. Crie uma API key');
    console.log('   3. Adicione no .env.local:');
    console.log('      RESEND_API_KEY=re_xxxxxxxxxxxxx\n');
    return;
  }

  if (!fromEmail) {
    console.error('❌ RESEND_FROM_EMAIL não está configurado no .env.local\n');
    console.log('💡 Solução:');
    console.log('   Adicione no .env.local:');
    console.log('      RESEND_FROM_EMAIL=onboarding@resend.dev\n');
    return;
  }

  try {
    const resend = new Resend(apiKey);

    console.log('📤 Enviando email de teste...\n');

    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: 'alisson.roosa@gmail.com', // MUDE AQUI!
      subject: 'Teste do Paper Bloom - Email Funcionando! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; }
              .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; }
              .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Email Funcionando!</h1>
              <div class="success">
                <p><strong>Parabéns!</strong> O serviço de email do Paper Bloom está configurado corretamente.</p>
              </div>
              <div class="info">
                <h3>Informações do Teste:</h3>
                <ul>
                  <li><strong>Serviço:</strong> Resend</li>
                  <li><strong>Remetente:</strong> ${fromName} &lt;${fromEmail}&gt;</li>
                  <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                </ul>
              </div>
              <p>Agora você pode usar o sistema completo com envio automático de emails após o pagamento!</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ EMAIL ENVIADO COM SUCESSO!\n');
    console.log('📋 Detalhes:');
    console.log(`   Message ID: ${result.data?.id || result.id}`);
    console.log(`   De: ${fromName} <${fromEmail}>`);
    console.log(`   Para: alisson.roosa@gmail.com`);
    console.log('\n📬 Verifique sua caixa de entrada!');
    console.log('   - Pode levar alguns segundos');
    console.log('   - Verifique spam/lixo eletrônico');
    console.log('   - Procure por "Paper Bloom" ou "' + fromEmail + '"');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   Se o email não chegar, o problema pode ser que');
    console.log('   "' + fromEmail + '" não está verificado no Resend.');
    console.log('\n💡 Solução:');
    console.log('   1. Acesse: https://resend.com/domains');
    console.log('   2. Verifique o domínio paperbloom.com.br');
    console.log('   3. Ou use: RESEND_FROM_EMAIL=onboarding@resend.dev');
    console.log('\n🎉 O Resend está funcionando perfeitamente!');
    console.log('\n');

  } catch (error) {
    console.error('❌ ERRO ao enviar email:\n');
    console.error(error.message);
    console.error('\n🔧 Possíveis causas:');
    console.error('   1. API Key inválida');
    console.error('   2. Email remetente não verificado');
    console.error('   3. Limite de envios atingido');
    console.error('\n💡 Solução:');
    console.error('   Use: RESEND_FROM_EMAIL=onboarding@resend.dev');
    console.error('   Este email funciona sem verificação!');
    console.error('\n');
  }
}

// Executar teste
testarResendDireto();
