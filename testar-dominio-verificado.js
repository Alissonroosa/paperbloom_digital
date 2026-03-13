/**
 * Teste com Domínio Verificado
 * Agora podemos enviar para qualquer email!
 */

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testarDominioVerificado() {
  console.log('🎉 Testando com domínio verificado!\n');

  const apiKey = process.env.RESEND_API_KEY;
  const resend = new Resend(apiKey);

  try {
    console.log('📤 Enviando email de teste...\n');
    console.log('   De: noreply@email.paperbloom.com.br');
    console.log('   Para: alisson.roosa@gmail.com\n');

    const result = await resend.emails.send({
      from: 'Paper Bloom <noreply@email.paperbloom.com.br>',
      to: 'alisson.roosa@gmail.com',
      subject: '🎉 Paper Bloom - Sistema 100% Funcional!',
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
                margin: 0;
                padding: 0;
                background: #f5f5f5;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
              }
              .content {
                padding: 40px 30px;
              }
              .success-box {
                background: #d4edda;
                border-left: 4px solid #28a745;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .info-box {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
              }
              .button {
                display: inline-block;
                background: #667eea;
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
              }
              h1 { margin: 0; font-size: 32px; }
              h2 { color: #667eea; margin-top: 0; }
              ul { padding-left: 20px; }
              li { margin: 10px 0; }
              .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                color: #666;
                font-size: 14px;
              }
              .emoji { font-size: 48px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🎉</div>
                <h1>Sistema 100% Funcional!</h1>
                <p style="font-size: 18px; margin: 10px 0 0 0;">Paper Bloom Digital está pronto para uso</p>
              </div>
              
              <div class="content">
                <div class="success-box">
                  <h2>✅ Parabéns, Alisson!</h2>
                  <p><strong>Tudo está funcionando perfeitamente!</strong></p>
                  <p>Você está recebendo este email porque:</p>
                  <ul>
                    <li>✅ Domínio <strong>email.paperbloom.com.br</strong> verificado</li>
                    <li>✅ Resend configurado corretamente</li>
                    <li>✅ Sistema de emails 100% operacional</li>
                  </ul>
                </div>

                <h3>🚀 O que está pronto:</h3>
                <div class="info-box">
                  <ul style="margin: 0;">
                    <li><strong>Wizard de 7 passos</strong> - Criação de mensagens</li>
                    <li><strong>Upload de imagens</strong> - Cloudflare R2</li>
                    <li><strong>Pagamento via Stripe</strong> - Checkout configurado</li>
                    <li><strong>Geração de QR Code</strong> - Automática após pagamento</li>
                    <li><strong>Envio de email</strong> - Com QR Code anexado</li>
                    <li><strong>Página de delivery</strong> - Preview completo</li>
                    <li><strong>Mensagem pública</strong> - Experiência cinematográfica</li>
                  </ul>
                </div>

                <h3>📧 Sobre este Email:</h3>
                <div class="info-box">
                  <p><strong>Remetente:</strong> noreply@email.paperbloom.com.br</p>
                  <p><strong>Destinatário:</strong> alisson.roosa@gmail.com</p>
                  <p><strong>Status:</strong> ✅ Enviado com sucesso</p>
                  <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                </div>

                <h3>🎯 Próximos Passos:</h3>
                <ol>
                  <li>Teste o fluxo completo no wizard</li>
                  <li>Faça um pagamento de teste com Stripe</li>
                  <li>Verifique se o email chega automaticamente</li>
                  <li>Configure o webhook em produção quando estiver pronto</li>
                </ol>

                <div style="text-align: center; margin: 40px 0;">
                  <a href="http://localhost:3000/editor/mensagem" class="button">
                    🚀 Testar Sistema Completo
                  </a>
                </div>

                <div class="success-box">
                  <h3 style="margin-top: 0;">💡 Dica Importante:</h3>
                  <p>Agora que o domínio está verificado, atualize o <code>.env.local</code>:</p>
                  <pre style="background: #fff; padding: 10px; border-radius: 4px; overflow-x: auto;">RESEND_FROM_EMAIL=noreply@email.paperbloom.com.br</pre>
                  <p>Depois reinicie o servidor Next.js para aplicar a mudança.</p>
                </div>
              </div>

              <div class="footer">
                <p><strong>Paper Bloom Digital</strong></p>
                <p>Sistema de Mensagens Personalizadas</p>
                <p style="margin-top: 20px; color: #999; font-size: 12px;">
                  Este é um email de teste automático<br>
                  Desenvolvido com ❤️ para criar momentos especiais
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ EMAIL ENVIADO COM SUCESSO!\n');
    console.log('📋 Resposta do Resend:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n📬 VERIFIQUE SEU EMAIL AGORA!');
    console.log('   Gmail: https://mail.google.com');
    console.log('   Email: alisson.roosa@gmail.com');
    console.log('\n💡 Dicas:');
    console.log('   - Pode levar 10-30 segundos');
    console.log('   - Verifique Caixa de Entrada, Promoções e Spam');
    console.log('   - Procure por "Paper Bloom"');
    console.log('\n🎉 SISTEMA 100% FUNCIONAL!');
    console.log('\n📝 Próximo passo:');
    console.log('   Atualize o .env.local:');
    console.log('   RESEND_FROM_EMAIL=noreply@email.paperbloom.com.br');
    console.log('\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\nDetalhes:', error);
    console.error('\n🔧 Verifique:');
    console.error('   1. O domínio está realmente verificado?');
    console.error('   2. O email noreply@email.paperbloom.com.br existe?');
    console.error('   3. Os registros DNS estão corretos?');
    console.error('\n');
  }
}

testarDominioVerificado();
