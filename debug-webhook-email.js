/**
 * Script para debugar o envio de email no webhook
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function debugWebhookEmail() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('=== Debug: Webhook Email Flow ===\n');

    // 1. Buscar mensagens pagas recentes
    console.log('1. Buscando mensagens pagas recentes...');
    const result = await pool.query(`
      SELECT 
        id,
        sender_name,
        recipient_name,
        title,
        contact_email,
        contact_name,
        status,
        qr_code_url,
        slug,
        created_at
      FROM messages
      WHERE status = 'paid'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (result.rows.length === 0) {
      console.log('❌ Nenhuma mensagem paga encontrada');
      console.log('\n💡 Dica: Faça um pagamento de teste primeiro');
      return;
    }

    console.log(`✅ Encontradas ${result.rows.length} mensagens pagas\n`);

    // 2. Verificar dados de cada mensagem
    for (const message of result.rows) {
      console.log('---');
      console.log('Message ID:', message.id);
      console.log('Recipient:', message.recipient_name);
      console.log('Sender:', message.sender_name);
      console.log('Title:', message.title);
      console.log('Contact Email:', message.contact_email || '❌ AUSENTE');
      console.log('Contact Name:', message.contact_name || '❌ AUSENTE');
      console.log('Status:', message.status);
      console.log('QR Code URL:', message.qr_code_url || '❌ AUSENTE');
      console.log('Slug:', message.slug || '❌ AUSENTE');
      console.log('Created:', message.created_at);
      
      // Verificar se tem todos os dados necessários para enviar email
      const hasRequiredData = !!(
        message.contact_email &&
        message.qr_code_url &&
        message.slug
      );
      
      if (hasRequiredData) {
        console.log('✅ Tem todos os dados necessários para enviar email');
      } else {
        console.log('❌ Faltam dados para enviar email:');
        if (!message.contact_email) console.log('   - Contact Email');
        if (!message.qr_code_url) console.log('   - QR Code URL');
        if (!message.slug) console.log('   - Slug');
      }
      console.log('');
    }

    // 3. Verificar a última mensagem em detalhes
    const lastMessage = result.rows[0];
    console.log('\n=== Última Mensagem (Detalhes) ===\n');
    console.log('ID:', lastMessage.id);
    console.log('Contact Email:', lastMessage.contact_email);
    
    if (!lastMessage.contact_email) {
      console.log('\n❌ PROBLEMA IDENTIFICADO: contact_email está NULL!');
      console.log('\n💡 Possíveis causas:');
      console.log('   1. O campo contact_email não foi preenchido no formulário');
      console.log('   2. O campo não foi salvo no banco de dados');
      console.log('   3. O campo não foi passado no metadata do Stripe');
      console.log('\n💡 Solução:');
      console.log('   Verifique se o campo contactEmail está sendo enviado no checkout');
      console.log('   Arquivo: src/app/api/checkout/create-session/route.ts');
    } else {
      console.log('✅ Contact email está presente:', lastMessage.contact_email);
      
      // Testar envio de email
      console.log('\n=== Testando Envio de Email ===\n');
      
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      try {
        const emailResult = await resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
          to: lastMessage.contact_email,
          subject: `Teste: Sua mensagem para ${lastMessage.recipient_name} está pronta! 🎁`,
          html: `
            <h1>Teste de Email</h1>
            <p>Olá ${lastMessage.contact_name || lastMessage.sender_name},</p>
            <p>Este é um email de teste para verificar o envio.</p>
            <p>Message ID: ${lastMessage.id}</p>
            <p>Slug: ${lastMessage.slug}</p>
          `,
        });
        
        console.log('✅ Email de teste enviado com sucesso!');
        console.log('Message ID:', emailResult.data?.id);
        console.log('Para:', lastMessage.contact_email);
      } catch (error) {
        console.error('❌ Erro ao enviar email:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

debugWebhookEmail();
