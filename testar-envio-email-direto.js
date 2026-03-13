require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

console.log('\n📧 Teste Direto de Envio de Email\n');
console.log('═══════════════════════════════════════════════════════\n');

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const fromName = process.env.RESEND_FROM_NAME || 'Paper Bloom';

if (!resendApiKey || !fromEmail) {
  console.log('❌ Configuração incompleta!\n');
  process.exit(1);
}

console.log(`De: ${fromName} <${fromEmail}>`);
console.log(`Para: alisson.roosa@gmail.com\n`);

const resend = new Resend(resendApiKey);

async function testEmail() {
  try {
    // Buscar o QR Code mais recente
    const qrCodePath = path.join(__dirname, 'public', 'uploads', 'qrcodes', '0ec008ee-eb82-410a-b36c-bfab8486b908.png');
    
    console.log('📁 Lendo QR Code:', qrCodePath);
    
    if (!fs.existsSync(qrCodePath)) {
      console.log('❌ Arquivo QR Code não encontrado!\n');
      console.log('💡 Verifique se o caminho está correto.\n');
      return;
    }
    
    const qrCodeBuffer = fs.readFileSync(qrCodePath);
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    
    console.log(`✅ QR Code lido (${qrCodeBase64.length} caracteres)\n`);
    
    console.log('📤 Enviando email...\n');
    
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: 'alisson.roosa@gmail.com',
      subject: 'Teste - Sua mensagem especial está pronta! 🎁',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .qr-code { text-align: center; margin: 30px 0; }
              .qr-code img { max-width: 300px; border: 2px solid #e5e7eb; padding: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎁 Teste de Email</h1>
              <p>Este é um teste de envio de email com QR Code.</p>
              
              <div class="qr-code">
                <h2>QR Code da Mensagem</h2>
                <img src="cid:qrcode" alt="QR Code" />
              </div>
              
              <p>Se você está vendo o QR Code acima, o email está funcionando!</p>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBase64,
          contentId: 'qrcode',
        },
      ],
    });
    
    console.log('✅ Email enviado com sucesso!\n');
    console.log('📊 Resultado:');
    console.log(`   Message ID: ${result.data?.id}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Teste concluído! Verifique seu email.\n');
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.log('');
    
    if (error.message.includes('API key')) {
      console.log('💡 Problema com a API key do Resend');
      console.log('   Verifique se a key está correta no .env.local\n');
    } else if (error.message.includes('domain')) {
      console.log('💡 Problema com o domínio de envio');
      console.log('   Verifique se o domínio está verificado no Resend\n');
    } else {
      console.log('💡 Erro desconhecido');
      console.log('   Detalhes:', error);
      console.log('');
    }
  }
}

testEmail();
