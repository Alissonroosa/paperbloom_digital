require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

console.log('\n🔍 Debug: Por que o email não foi enviado?\n');
console.log('═══════════════════════════════════════════════════════\n');

// Verificar configuração do Resend
console.log('1️⃣  Verificando configuração do Resend:\n');

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const fromName = process.env.RESEND_FROM_NAME || 'Paper Bloom';

console.log(`   RESEND_API_KEY: ${resendApiKey ? '✅ Configurado' : '❌ NÃO configurado'}`);
console.log(`   RESEND_FROM_EMAIL: ${fromEmail || '❌ NÃO configurado'}`);
console.log(`   RESEND_FROM_NAME: ${fromName}\n`);

if (!resendApiKey || !fromEmail) {
  console.log('❌ Configuração do Resend incompleta!\n');
  console.log('💡 Adicione no .env.local:');
  console.log('   RESEND_API_KEY=re_xxxxxxxxxxxxx');
  console.log('   RESEND_FROM_EMAIL=noreply@email.paperbloom.com.br\n');
  process.exit(1);
}

// Verificar última mensagem criada
console.log('2️⃣  Verificando última mensagem criada:\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkLastMessage() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        id,
        recipient_name,
        sender_name,
        contact_name,
        contact_email,
        contact_phone,
        status,
        qr_code_url,
        slug,
        created_at
      FROM messages
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('   ❌ Nenhuma mensagem encontrada no banco\n');
      return;
    }
    
    const msg = result.rows[0];
    
    console.log(`   ID: ${msg.id}`);
    console.log(`   Para: ${msg.recipient_name}`);
    console.log(`   De: ${msg.sender_name}`);
    console.log(`   Status: ${msg.status}`);
    console.log(`   QR Code: ${msg.qr_code_url || '❌ Não gerado'}`);
    console.log(`   Slug: ${msg.slug || '❌ Não gerado'}\n`);
    
    console.log('   📧 Dados de Contato:');
    console.log(`   Nome: ${msg.contact_name || '❌ Não informado'}`);
    console.log(`   Email: ${msg.contact_email || '❌ Não informado'}`);
    console.log(`   Telefone: ${msg.contact_phone || '❌ Não informado'}\n`);
    
    // Análise
    console.log('3️⃣  Análise:\n');
    
    if (msg.status !== 'paid') {
      console.log('   ⚠️  Status não é "paid" - Webhook pode não ter sido processado');
      console.log('   💡 Verifique se o Stripe CLI está rodando\n');
    } else {
      console.log('   ✅ Status é "paid" - Webhook foi processado\n');
    }
    
    if (!msg.qr_code_url) {
      console.log('   ❌ QR Code não foi gerado');
      console.log('   💡 Webhook pode ter falhado na geração do QR Code\n');
    } else {
      console.log('   ✅ QR Code foi gerado\n');
    }
    
    if (!msg.contact_email) {
      console.log('   ❌ Email de contato não foi salvo no banco!');
      console.log('   💡 Verifique se o Step 7 está enviando o email corretamente\n');
    } else {
      console.log('   ✅ Email de contato salvo no banco\n');
    }
    
    // Verificar logs de email
    console.log('4️⃣  Verificando logs de email:\n');
    
    const emailLogs = await client.query(`
      SELECT 
        id,
        message_id,
        recipient_email,
        status,
        error_message,
        sent_at,
        created_at
      FROM email_logs
      WHERE message_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [msg.id]);
    
    if (emailLogs.rows.length === 0) {
      console.log('   ⚠️  Nenhum log de email encontrado');
      console.log('   💡 O webhook pode não ter tentado enviar o email\n');
      
      console.log('5️⃣  Possíveis causas:\n');
      console.log('   1. Email não estava nos metadados do Stripe');
      console.log('   2. Erro ao ler o QR Code do disco');
      console.log('   3. Erro na configuração do Resend');
      console.log('   4. Webhook não processou o evento checkout.session.completed\n');
      
      console.log('6️⃣  Como resolver:\n');
      console.log('   1. Verifique os logs do terminal do Next.js');
      console.log('   2. Procure por "[EmailService]" nos logs');
      console.log('   3. Verifique se há erros relacionados ao email');
      console.log('   4. Execute: node testar-email.js para testar o Resend\n');
    } else {
      console.log(`   ✅ ${emailLogs.rows.length} log(s) de email encontrado(s):\n`);
      
      emailLogs.rows.forEach((log, index) => {
        console.log(`   ${index + 1}. Status: ${log.status}`);
        console.log(`      Para: ${log.recipient_email}`);
        console.log(`      Enviado em: ${log.sent_at || 'Não enviado'}`);
        if (log.error_message) {
          console.log(`      Erro: ${log.error_message}`);
        }
        console.log('');
      });
    }
    
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Sugestões
    if (!msg.contact_email) {
      console.log('🎯 AÇÃO NECESSÁRIA:\n');
      console.log('   O email não foi salvo no banco de dados.');
      console.log('   Verifique se o frontend está enviando contactEmail para a API.\n');
    } else if (msg.status !== 'paid') {
      console.log('🎯 AÇÃO NECESSÁRIA:\n');
      console.log('   O webhook não processou o pagamento.');
      console.log('   Certifique-se que o Stripe CLI está rodando:\n');
      console.log('   .\\stripe.exe listen --forward-to localhost:3000/api/checkout/webhook\n');
    } else if (emailLogs.rows.length === 0) {
      console.log('🎯 AÇÃO NECESSÁRIA:\n');
      console.log('   O webhook processou mas não tentou enviar email.');
      console.log('   Verifique os logs do Next.js para ver o erro.\n');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkLastMessage();
