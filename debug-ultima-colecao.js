require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function debugUltimaColecao() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Debugando última coleção criada...\n');

    // Buscar última coleção
    const ultima = await pool.query(`
      SELECT *
      FROM card_collections
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (ultima.rows.length === 0) {
      console.log('❌ Nenhuma coleção encontrada');
      return;
    }

    const colecao = ultima.rows[0];
    
    console.log('📋 Dados da Última Coleção:\n');
    console.log(`ID: ${colecao.id}`);
    console.log(`Para: ${colecao.recipient_name}`);
    console.log(`De: ${colecao.sender_name}`);
    console.log(`Status: ${colecao.status}`);
    console.log(`Stripe Session: ${colecao.stripe_session_id || 'N/A'}`);
    console.log(`Slug: ${colecao.slug || 'N/A'}`);
    console.log(`QR Code: ${colecao.qr_code_url || 'N/A'}`);
    console.log(`Email: ${colecao.contact_email || 'N/A'}`);
    console.log(`Telefone: ${colecao.contact_phone || 'N/A'}`);
    console.log(`Nome Contato: ${colecao.contact_name || 'N/A'}`);
    console.log(`Intro Message: ${colecao.intro_message || 'N/A'}`);
    console.log(`YouTube: ${colecao.youtube_video_id || 'N/A'}`);
    console.log(`Criado: ${colecao.created_at}`);
    console.log(`Atualizado: ${colecao.updated_at}`);

    // Buscar cartas dessa coleção
    const cartas = await pool.query(`
      SELECT id, "order", title, LEFT(message_text, 50) as message_preview
      FROM cards
      WHERE collection_id = $1
      ORDER BY "order"
    `, [colecao.id]);

    console.log(`\n📝 Cartas (${cartas.rows.length}):\n`);
    cartas.rows.forEach(carta => {
      console.log(`  ${carta.order}. ${carta.title || '(sem título)'}`);
      console.log(`     ${carta.message_preview || '(sem mensagem)'}...`);
    });

    // Simular o que a API retorna
    console.log('\n🔍 Simulando GET /api/card-collections/[id]:\n');
    
    const apiResponse = {
      collection: {
        id: colecao.id,
        recipientName: colecao.recipient_name,
        senderName: colecao.sender_name,
        status: colecao.status,
        slug: colecao.slug,
        qrCodeUrl: colecao.qr_code_url,
        contactEmail: colecao.contact_email,
        contactPhone: colecao.contact_phone,
        contactName: colecao.contact_name,
        introMessage: colecao.intro_message,
        youtubeVideoId: colecao.youtube_video_id,
      },
      cards: cartas.rows
    };

    console.log(JSON.stringify(apiResponse, null, 2));

    // Verificar se campos estão vazios
    console.log('\n⚠️  Verificação de Campos Vazios:\n');
    
    const camposVazios = [];
    if (!colecao.recipient_name || colecao.recipient_name === 'Destinatário') {
      camposVazios.push('recipient_name (ainda é "Destinatário")');
    }
    if (!colecao.sender_name || colecao.sender_name === 'Remetente') {
      camposVazios.push('sender_name (ainda é "Remetente")');
    }
    if (!colecao.slug) camposVazios.push('slug');
    if (!colecao.qr_code_url) camposVazios.push('qr_code_url');
    if (!colecao.contact_email) camposVazios.push('contact_email');

    if (camposVazios.length > 0) {
      console.log('❌ Campos vazios ou com valores padrão:');
      camposVazios.forEach(campo => console.log(`   - ${campo}`));
    } else {
      console.log('✅ Todos os campos importantes estão preenchidos');
    }

    // Verificar se foi paga
    if (colecao.status === 'paid') {
      console.log('\n✅ Coleção foi paga');
      if (!colecao.slug || !colecao.qr_code_url) {
        console.log('❌ MAS slug ou QR Code não foram gerados!');
        console.log('   Isso indica que o webhook não processou corretamente.');
      }
    } else {
      console.log('\n⚠️  Coleção ainda está pendente');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

debugUltimaColecao();
