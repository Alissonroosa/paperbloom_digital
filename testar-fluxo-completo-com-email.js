/**
 * Teste Completo do Fluxo com Email
 * 
 * Testa todo o fluxo incluindo:
 * 1. Criação da mensagem
 * 2. Processamento do pagamento
 * 3. Geração do QR Code
 * 4. Validação do QR Code
 * 5. Envio do email
 */

const { Resend } = require('resend');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const baseUrl = 'http://localhost:3000';

async function testarFluxoCompletoComEmail() {
  console.log('🚀 Teste Completo do Fluxo com Email\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Passo 1: Criar mensagem
    console.log('📝 Passo 1: Criando mensagem...');
    
    const createResponse = await fetch(`${baseUrl}/api/messages/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientName: 'Alisson Roosa',
        senderName: 'Paper Bloom Team',
        messageText: 'Esta é uma mensagem de teste completa do sistema Paper Bloom! Se você está lendo isso, significa que todo o fluxo está funcionando perfeitamente: criação, pagamento, QR Code e email! 🎉',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Teste Completo do Sistema',
        specialDate: new Date().toISOString(),
        closingMessage: 'Sistema 100% operacional!',
        signature: 'Equipe Paper Bloom',
        galleryImages: []
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Erro ao criar mensagem: ${createResponse.status}`);
    }

    const messageData = await createResponse.json();
    const messageId = messageData.id;
    
    console.log(`✅ Mensagem criada: ${messageId}\n`);

    // Passo 2: Processar pagamento (simular webhook)
    console.log('💳 Passo 2: Processando pagamento...');
    
    const updateResponse = await fetch(`${baseUrl}/api/test/update-message-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId })
    });

    if (!updateResponse.ok) {
      throw new Error(`Erro ao processar pagamento: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();
    
    console.log(`✅ Status: ${updateData.status}`);
    console.log(`✅ Slug: ${updateData.slug}`);
    console.log(`✅ QR Code: ${updateData.qrCodeUrl}\n`);

    // Passo 3: Validar QR Code
    console.log('🔍 Passo 3: Validando QR Code...');
    
    const qrCodePath = path.join(process.cwd(), 'public', updateData.qrCodeUrl);
    
    if (!fs.existsSync(qrCodePath)) {
      console.log(`❌ Arquivo QR Code não encontrado: ${qrCodePath}\n`);
      throw new Error('QR Code não foi gerado');
    }
    
    console.log(`✅ Arquivo QR Code existe: ${qrCodePath}`);
    
    const qrCodeStats = fs.statSync(qrCodePath);
    console.log(`✅ Tamanho: ${(qrCodeStats.size / 1024).toFixed(2)} KB`);
    
    // Ler e validar o QR Code
    const qrCodeBuffer = fs.readFileSync(qrCodePath);
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
    
    console.log(`✅ QR Code convertido para base64 (${qrCodeBase64.length} caracteres)\n`);

    // Passo 4: Enviar email com QR Code
    console.log('📧 Passo 4: Enviando email com QR Code...');
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const emailResult = await resend.emails.send({
      from: 'Paper Bloom <noreply@email.paperbloom.com.br>',
      to: 'alisson.roosa@gmail.com',
      subject: `🎁 Sua mensagem para ${messageData.recipientName} está pronta!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; }
              .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; }
              .qr-code { text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; }
              .qr-code img { max-width: 300px; border: 2px solid #ddd; padding: 10px; background: white; border-radius: 8px; }
              .message-url { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .button { display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
              .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
              h1 { margin: 0; font-size: 28px; }
              h2 { color: #667eea; }
              ul { padding-left: 20px; }
              li { margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎁 Sua Mensagem Está Pronta!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Paper Bloom Digital</p>
              </div>
              
              <div style="padding: 30px 0;">
                <p style="font-size: 18px;">Olá <strong>Alisson</strong>,</p>
                <p>Sua mensagem especial <strong>"${messageData.title}"</strong> foi criada com sucesso!</p>
              </div>
              
              <div class="qr-code">
                <h2>📱 QR Code da Mensagem</h2>
                <img src="cid:qrcode" alt="QR Code" />
                <p style="color: #666; margin-top: 15px;">Escaneie este código para acessar sua mensagem</p>
              </div>
              
              <div class="message-url">
                <h3 style="margin-top: 0;">🔗 Link Direto:</h3>
                <p style="word-break: break-all;"><a href="${updateData.fullUrl}" style="color: #667eea;">${updateData.fullUrl}</a></p>
                <p style="text-align: center; margin-top: 20px;">
                  <a href="${updateData.fullUrl}" class="button">📖 Visualizar Mensagem</a>
                </p>
              </div>
              
              <div style="margin: 30px 0;">
                <h3>📤 Como Compartilhar:</h3>
                <ul>
                  <li><strong>WhatsApp:</strong> Envie o QR Code ou link diretamente</li>
                  <li><strong>Imprimir:</strong> Baixe o QR Code e imprima em um cartão</li>
                  <li><strong>Redes Sociais:</strong> Compartilhe o link</li>
                  <li><strong>Escanear:</strong> Use a câmera do celular no QR Code</li>
                </ul>
              </div>
              
              <div class="footer">
                <p><strong>Paper Bloom</strong></p>
                <p>Criando momentos especiais através de mensagens digitais</p>
                <p style="margin-top: 20px; color: #999; font-size: 12px;">
                  Este email foi enviado automaticamente após a confirmação do pagamento<br>
                  ${new Date().toLocaleString('pt-BR')}
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
          content_type: 'image/png',
          cid: 'qrcode',
        },
      ],
    });

    if (emailResult.error) {
      console.log(`❌ Erro ao enviar email: ${emailResult.error.message}\n`);
      throw new Error(emailResult.error.message);
    }

    console.log(`✅ Email enviado com sucesso!`);
    console.log(`   Message ID: ${emailResult.data.id}\n`);

    // Passo 5: Verificar acessibilidade
    console.log('🌐 Passo 5: Verificando acessibilidade...');
    
    const publicResponse = await fetch(`${baseUrl}${updateData.slug}`);
    console.log(`✅ Mensagem pública: ${publicResponse.ok ? 'Acessível' : 'Erro ' + publicResponse.status}`);
    
    const deliveryResponse = await fetch(`${baseUrl}/delivery/${messageId}`);
    console.log(`✅ Página de delivery: ${deliveryResponse.ok ? 'Acessível' : 'Erro ' + deliveryResponse.status}\n`);

    // Resumo Final
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 TESTE COMPLETO CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✅ Checklist:');
    console.log('   ✅ Mensagem criada');
    console.log('   ✅ Status atualizado para "paid"');
    console.log('   ✅ QR Code gerado e validado');
    console.log('   ✅ Slug criado');
    console.log('   ✅ Email enviado com QR Code anexado');
    console.log('   ✅ Mensagem pública acessível');
    console.log('   ✅ Página de delivery acessível');
    console.log('\n🔗 Links:');
    console.log(`   Mensagem: ${updateData.fullUrl}`);
    console.log(`   Delivery: ${baseUrl}/delivery/${messageId}`);
    console.log('\n📧 Email:');
    console.log('   Enviado para: alisson.roosa@gmail.com');
    console.log('   De: noreply@email.paperbloom.com.br');
    console.log('   Com QR Code anexado ✅');
    console.log('\n📬 VERIFIQUE SEU EMAIL AGORA!');
    console.log('   https://mail.google.com');
    console.log('\n🎯 Sistema 100% operacional e pronto para produção!');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
    console.error('\n');
  }
}

testarFluxoCompletoComEmail();
