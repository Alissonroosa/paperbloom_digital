/**
 * Script para verificar como as mensagens foram pagas
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function verificarMetodo() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       VERIFICAR MÉTODO DE PAGAMENTO UTILIZADO             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Buscar mensagens pagas
    const result = await pool.query(`
      SELECT 
        id,
        recipient_name,
        sender_name,
        status,
        stripe_session_id,
        contact_email,
        qr_code_url,
        slug,
        created_at,
        updated_at
      FROM messages
      WHERE status = 'paid'
      ORDER BY updated_at DESC
      LIMIT 10
    `);

    console.log(`📊 Últimas ${result.rows.length} mensagens pagas:\n`);

    result.rows.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.sender_name} → ${msg.recipient_name}`);
      console.log(`   ID: ${msg.id}`);
      console.log(`   Stripe Session: ${msg.stripe_session_id || '❌ AUSENTE'}`);
      console.log(`   Contact Email: ${msg.contact_email || '❌ AUSENTE'}`);
      console.log(`   QR Code: ${msg.qr_code_url ? '✅' : '❌'}`);
      console.log(`   Slug: ${msg.slug ? '✅' : '❌'}`);
      console.log(`   Criada: ${new Date(msg.created_at).toLocaleString('pt-BR')}`);
      console.log(`   Atualizada: ${new Date(msg.updated_at).toLocaleString('pt-BR')}`);
      
      // Determinar método
      if (!msg.stripe_session_id) {
        console.log(`   🔧 MÉTODO: API de Teste (sem Stripe Session)`);
        console.log(`   ⚠️  Email NÃO foi enviado automaticamente`);
      } else if (!msg.contact_email) {
        console.log(`   💳 MÉTODO: Webhook do Stripe`);
        console.log(`   ⚠️  Mas sem email de contato`);
      } else {
        console.log(`   💳 MÉTODO: Webhook do Stripe (completo)`);
        console.log(`   ✅ Email deveria ter sido enviado`);
      }
      console.log('');
    });

    // Estatísticas
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                      ESTATÍSTICAS                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE stripe_session_id IS NULL) as sem_stripe,
        COUNT(*) FILTER (WHERE stripe_session_id IS NOT NULL) as com_stripe,
        COUNT(*) FILTER (WHERE contact_email IS NULL) as sem_email,
        COUNT(*) FILTER (WHERE contact_email IS NOT NULL) as com_email
      FROM messages
      WHERE status = 'paid'
    `);

    const s = stats.rows[0];
    console.log(`📊 Mensagens pagas via API de Teste: ${s.sem_stripe}`);
    console.log(`📊 Mensagens pagas via Stripe: ${s.com_stripe}`);
    console.log(`📊 Mensagens sem email: ${s.sem_email}`);
    console.log(`📊 Mensagens com email: ${s.com_email}\n`);

    console.log('💡 CONCLUSÃO:\n');
    
    if (parseInt(s.sem_stripe) > 0) {
      console.log(`   ⚠️  Você tem ${s.sem_stripe} mensagem(ns) paga(s) via API de Teste`);
      console.log(`   📧 Essas mensagens NÃO receberam email automaticamente`);
      console.log(`   🔧 Use: node enviar-emails-pendentes.js\n`);
    }
    
    if (parseInt(s.com_stripe) > 0 && parseInt(s.sem_email) > 0) {
      console.log(`   ⚠️  Você tem mensagens pagas via Stripe mas sem email`);
      console.log(`   💡 Isso pode acontecer se o webhook não estava rodando`);
      console.log(`   🔧 Use: node enviar-emails-pendentes.js\n`);
    }

    console.log('🚀 PARA NOVOS PAGAMENTOS:\n');
    console.log('   1. Inicie o webhook: stripe listen --forward-to localhost:3000/api/checkout/webhook');
    console.log('   2. Inicie o servidor: npm run dev');
    console.log('   3. Faça um pagamento real no Stripe');
    console.log('   4. O email será enviado automaticamente\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarMetodo();
