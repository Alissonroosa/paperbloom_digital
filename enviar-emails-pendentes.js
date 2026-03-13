/**
 * Script para enviar emails para mensagens pagas que não receberam email
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { promises: fs } = require('fs');
const path = require('path');

async function enviarEmailsPendentes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('=== Enviando Emails Pendentes ===\n');

    // Buscar mensagens pagas com contact_email
    const result = await pool.query(`
      SELECT 
        id,
        sender_name,
        recipient_name,
        title,
        contact_email,
        contact_name,
        qr_code_url,
        slug
      FROM messages
      WHERE status = 'paid'
        AND contact_email IS NOT NULL
        AND qr_code_url IS NOT NULL
        AND slug IS NOT NULL
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('❌ Nenhuma mensagem encontrada para enviar email');
      return;
    }

    console.log(`✅ Encontradas ${result.rows.length} mensagens\n`);

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    let successCount = 0;
    let errorCount = 0;

    for (const message of result.rows) {
      console.log(`\nProcessando mensagem ${message.id}...`);
      console.log(`  Para: ${message.contact_email}`);
      console.log(`  Destinatário: ${message.recipient_name}`);

      try {
        // Ler QR code e converter para base64
        const qrCodePath = path.join(process.cwd(), 'public', message.qr_code_url);
        const qrCodeBuffer = await fs.readFile(qrCodePath);
        const qrCodeBase64 = qrCodeBuffer.toString('base64');
        const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const fullUrl = `${baseUrl}${message.slug}`;

        // Enviar email
        const emailResult = await resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
          to: message.contact_email,
          subject: `Sua mensagem especial para ${message.recipient_name} está pronta! 🎁`,
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
                    <p>Olá ${message.contact_name || message.sender_name},</p>
                    <p>Sua mensagem especial "${message.title}" foi criada com sucesso!</p>
                  </div>
                  
                  <div class="qr-code">
                    <h2 style="color: #1f2937; margin-top: 0;">QR Code da Mensagem</h2>
                    <img src="cid:qrcode" alt="QR Code da mensagem" />
                    <p style="color: #6b7280;">Escaneie este código para acessar sua mensagem</p>
                  </div>
                  
                  <div class="message-url">
                    <h3>Link Direto:</h3>
                    <p><a href="${fullUrl}">${fullUrl}</a></p>
                    <p style="text-align: center;">
                      <a href="${fullUrl}" class="button">Visualizar Mensagem</a>
                    </p>
                  </div>
                  
                  <div class="footer">
                    <p>Com carinho,<br><strong>Equipe Paper Bloom</strong></p>
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

        console.log(`  ✅ Email enviado com sucesso!`);
        console.log(`  Message ID: ${emailResult.data?.id}`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Erro ao enviar email:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n=== Resumo ===`);
    console.log(`Total de mensagens: ${result.rows.length}`);
    console.log(`Emails enviados: ${successCount}`);
    console.log(`Erros: ${errorCount}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

enviarEmailsPendentes();
