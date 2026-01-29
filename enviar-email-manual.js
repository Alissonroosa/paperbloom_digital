require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

console.log('\n📧 Enviar Email Manualmente para Última Mensagem\n');
console.log('═══════════════════════════════════════════════════════\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail() {
  const client = await pool.connect();
  
  try {
    // Buscar última mensagem paga
    const result = await client.query(`
      SELECT *
      FROM messages
      WHERE status = 'paid'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhuma mensagem paga encontrada\n');
      return;
    }
    
    const message = result.rows[0];
    
    console.log('📝 Mensagem encontrada:');
    console.log(`   ID: ${message.id}`);
    console.log(`   Para: ${message.recipient_name}`);
    console.log(`   De: ${message.sender_name}`);
    console.log(`   Email: ${message.contact_email}`);
    console.log(`   QR Code: ${message.qr_code_url}\n`);
    
    if (!message.contact_email) {
      console.log('❌ Email de contato não encontrado!\n');
      return;
    }
    
    if (!message.qr_code_url) {
      console.log('❌ QR Code não foi gerado!\n');
      return;
    }
    
    // Ler QR Code
    const qrCodePath = path.join(__dirname, 'public', message.qr_code_url);
    
    if (!fs.existsSync(qrCodePath)) {
      console.log(`❌ Arquivo QR Code não encontrado: ${qrCodePath}\n`);
      return;
    }
    
    const qrCodeBuffer = fs.readFileSync(qrCodePath);
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    
    console.log('✅ QR Code lido com sucesso\n');
    
    // Preparar dados do email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const messageUrl = `${baseUrl}${message.slug}`;
    const recipientName = message.contact_name || message.sender_name;
    const messageTitle = message.title || `Mensagem para ${message.recipient_name}`;
    
    console.log('📤 Enviando email...\n');
    console.log(`   De: ${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`);
    console.log(`   Para: ${message.contact_email}`);
    console.log(`   Assunto: Sua mensagem especial para ${message.recipient_name} está pronta! 🎁\n`);
    
    // Enviar email
    const emailResult = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'Paper Bloom'} <${process.env.RESEND_FROM_EMAIL}>`,
      to: message.contact_email,
      subject: `Sua mensagem especial para ${message.recipient_name} está pronta! 🎁`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #ffffff;
              }
              .header { 
                text-align: center; 
                padding: 20px 0;
                border-bottom: 2px solid #f0f0f0;
              }
              .header h1 {
                color: #4F46E5;
                margin: 0 0 10px 0;
                font-size: 28px;
              }
              .qr-code { 
                text-align: center; 
                margin: 30px 0;
                padding: 20px;
                background-color: #f9fafb;
                border-radius: 8px;
              }
              .qr-code img { 
                max-width: 300px;
                width: 100%;
                height: auto;
                border: 2px solid #e5e7eb;
                padding: 10px;
                background-color: #ffffff;
                border-radius: 8px;
              }
              .message-url { 
                background: #f3f4f6; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                border-left: 4px solid #4F46E5;
              }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #4F46E5; 
                color: white !important; 
                text-decoration: none; 
                border-radius: 6px;
                font-weight: 600;
                margin-top: 15px;
              }
              .footer { 
                text-align: center; 
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
                color: #6b7280; 
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎁 Sua Mensagem Está Pronta!</h1>
                <p>Olá ${recipientName},</p>
                <p>Sua mensagem especial "${messageTitle}" foi criada com sucesso!</p>
              </div>
              
              <div class="qr-code">
                <h2 style="color: #1f2937; margin-top: 0;">QR Code da Mensagem</h2>
                <img src="cid:qrcode" alt="QR Code da mensagem" />
                <p style="color: #6b7280; margin-bottom: 0;">Escaneie este código para acessar sua mensagem</p>
              </div>
              
              <div class="message-url">
                <h3>Link Direto:</h3>
                <p><a href="${messageUrl}">${messageUrl}</a></p>
                <p style="text-align: center; margin-top: 15px; margin-bottom: 0;">
                  <a href="${messageUrl}" class="button">Visualizar Mensagem</a>
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 10px 0;">Com carinho,<br><strong>Equipe Paper Bloom</strong></p>
                <p style="margin: 10px 0; font-size: 12px; color: #9ca3af;">
                  Este é um email automático. Por favor, não responda.
                </p>
              </div>
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
    console.log(`   Message ID: ${emailResult.data?.id}\n`);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Email enviado! Verifique sua caixa de entrada.\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Detalhes do erro:');
    console.log(error);
    console.log('');
  } finally {
    client.release();
    await pool.end();
  }
}

sendEmail();
