require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function verificarSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Verificando schema da tabela card_collections...\n');

    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'card_collections'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela card_collections NÃO existe!');
      console.log('\nVocê precisa executar as migrations primeiro.');
      return;
    }

    console.log('✅ Tabela card_collections existe!\n');

    // Listar todas as colunas
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'card_collections'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colunas da tabela card_collections:\n');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}`);
      console.log(`    Tipo: ${col.data_type}`);
      console.log(`    Nullable: ${col.is_nullable}`);
      console.log(`    Default: ${col.column_default || 'N/A'}`);
      console.log('');
    });

    // Verificar se stripe_session_id existe
    const hasStripeSession = columns.rows.some(col => col.column_name === 'stripe_session_id');
    
    if (hasStripeSession) {
      console.log('✅ Campo stripe_session_id EXISTE!');
    } else {
      console.log('❌ Campo stripe_session_id NÃO EXISTE!');
      console.log('\nVocê precisa adicionar este campo à tabela.');
    }

    // Verificar campos necessários para o fluxo de checkout
    const camposNecessarios = [
      'id',
      'recipient_name',
      'sender_name',
      'slug',
      'qr_code_url',
      'status',
      'stripe_session_id',
      'contact_email',
      'contact_phone',
      'intro_message',
      'youtube_video_id',
      'contact_name'
    ];

    console.log('\n📝 Verificando campos necessários:\n');
    camposNecessarios.forEach(campo => {
      const existe = columns.rows.some(col => col.column_name === campo);
      console.log(`  ${existe ? '✅' : '❌'} ${campo}`);
    });

    // Contar registros
    const count = await pool.query('SELECT COUNT(*) FROM card_collections');
    console.log(`\n📊 Total de registros: ${count.rows[0].count}`);

    // Mostrar últimos 3 registros
    const recent = await pool.query(`
      SELECT id, recipient_name, sender_name, status, stripe_session_id, slug, qr_code_url
      FROM card_collections
      ORDER BY created_at DESC
      LIMIT 3
    `);

    if (recent.rows.length > 0) {
      console.log('\n📄 Últimos registros:\n');
      recent.rows.forEach((row, i) => {
        console.log(`${i + 1}. ID: ${row.id}`);
        console.log(`   Para: ${row.recipient_name}`);
        console.log(`   De: ${row.sender_name}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Stripe Session: ${row.stripe_session_id || 'N/A'}`);
        console.log(`   Slug: ${row.slug || 'N/A'}`);
        console.log(`   QR Code: ${row.qr_code_url || 'N/A'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarSchema();
