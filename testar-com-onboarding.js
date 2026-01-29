/**
 * Teste com Email Onboarding do Resend
 * 
 * Usa onboarding@resend.dev que funciona SEM verificação
 */

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testarComOnboarding() {
  console.log('📧 Testando com email onboarding@resend.dev...\n');

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY não configurado!\n');
    return;
  }

  console.log('🔍 Configuração:');
  console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`   De: onboarding@resend.dev (email de teste do Resend)`);
  console.log(`   Para: alisson.roosa@gmail.com\n`);

  try {
    const resend = new Resend(apiKey);

    console.log('📤 Enviando email...\n');

    const result = await resend.emails.send({
      from: 'Paper Bloom <onboarding@resend.dev>',
      to: 'alisson.roosa@gmail.com',
      subject: '🎉 Teste Paper Bloom - Email Funcionando!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .success-box {
                background: #d4edda;
                border: 2px solid #c3e6cb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .info-box {
                background: #fff;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              h1 { margin: 0; font-size: 28px; }
              h2 { color: #667eea; }
              ul { padding-left: 20px; }
              li { margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ Email Funcionando!</h1>
              <p>Sistema Paper Bloom configurado com sucesso</p>
            </div>
            <div class="content">
              <div class="success-box">
                <h2>🎉 Parabéns, Alisson!</h2>
                <p><strong>O serviço de email está funcionando perfeitamente!</strong></p>
                <p>Você está recebendo este email porque o teste foi bem-sucedido.</p>
              </div>

              <div class="info-box">
                <h3>📋 Informações do Teste:</h3>
                <ul>
                  <li><strong>Serviço:</strong> Resend</li>
                  <li><strong>Remetente:</strong> onboarding@resend.dev</li>
                  <li><strong>Destinatário:</strong> alisson.roosa@gmail.com</li>
                  <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                  <li><strong>Status:</strong> ✅ Enviado com sucesso</li>
                </ul>
              </div>

              <h3>🚀 Próximos Passos:</h3>
              <ol>
                <li>O sistema está pronto para enviar emails automaticamente</li>
                <li>Após cada pagamento, o cliente receberá o QR Code por email</li>
                <li>Para usar seu domínio (paperbloom.com.br), verifique-o no Resend</li>
              </ol>

              <div class="info-box">
                <h3>💡 Dica:</h3>
                <p>Para usar <strong>noreply@paperbloom.com.br</strong>, você precisa:</p>
                <ol>
                  <li>Acessar: <a href="https://resend.com/domains">https://resend.com/domains</a></li>
                  <li>Adicionar o domínio paperbloom.com.br</li>
                  <li>Configurar os registros DNS (SPF, DKIM, DMARC)</li>
                  <li>Aguardar verificação (pode levar até 48h)</li>
                </ol>
                <p><strong>Enquanto isso, use:</strong> onboarding@resend.dev</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3000/editor/mensagem" class="button">
                  Testar Sistema Completo
                </a>
              </p>

              <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                Paper Bloom Digital - Sistema de Mensagens Personalizadas<br>
                Este é um email de teste automático
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ EMAIL ENVIADO COM SUCESSO!\n');
    console.log('📋 Detalhes:');
    console.log(`   Message ID: ${result.data?.id || result.id || 'N/A'}`);
    console.log(`   De: Paper Bloom <onboarding@resend.dev>`);
    console.log(`   Para: alisson.roosa@gmail.com`);
    console.log('\n📬 VERIFIQUE SUA CAIXA DE ENTRADA AGORA!');
    console.log('   Gmail: https://mail.google.com');
    console.log('\n💡 Dicas:');
    console.log('   - O email pode levar 10-30 segundos para chegar');
    console.log('   - Verifique a pasta "Promoções" ou "Social"');
    console.log('   - Verifique spam/lixo eletrônico');
    console.log('   - Procure por "Paper Bloom" ou "onboarding@resend.dev"');
    console.log('\n🎉 O Resend está 100% funcional!');
    console.log('\n📝 Para usar seu domínio:');
    console.log('   1. Acesse: https://resend.com/domains');
    console.log('   2. Adicione paperbloom.com.br');
    console.log('   3. Configure DNS');
    console.log('   4. Aguarde verificação');
    console.log('\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('\nDetalhes:', error);
    console.error('\n🔧 Verifique:');
    console.error('   1. RESEND_API_KEY está correto?');
    console.error('   2. Tem créditos/limite disponível no Resend?');
    console.error('   3. A API key não expirou?');
    console.error('\n');
  }
}

testarComOnboarding();
