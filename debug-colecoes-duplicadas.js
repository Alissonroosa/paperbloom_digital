require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function debugColecoesDuplicadas() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Investigando coleções duplicadas...\n');

    // Buscar coleções com mesmo stripe_session_id
    const duplicates = await pool.query(`
      SELECT 
        stripe_session_id,
        COUNT(*) as count,
        STRING_AGG(id::text, ', ') as ids,
        STRING_AGG(status, ', ') as statuses
      FROM card_collections
      WHERE stripe_session_id IS NOT NULL
      GROUP BY stripe_session_id
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `);

    if (duplicates.rows.length > 0) {
      console.log('❌ Encontradas coleções duplicadas:\n');
      duplicates.rows.forEach(row => {
        console.log(`Session: ${row.stripe_session_id}`);
        console.log(`  Quantidade: ${row.count}`);
        console.log(`  IDs: ${row.ids}`);
        console.log(`  Status: ${row.statuses}`);
        console.log('');
      });
    } else {
      console.log('✅ Nenhuma coleção duplicada encontrada\n');
    }

    // Buscar últimas 10 coleções
    console.log('📋 Últimas 10 coleções criadas:\n');
    const recent = await pool.query(`
      SELECT 
        id,
        recipient_name,
        sender_name,
        status,
        stripe_session_id,
        slug,
        qr_code_url,
        created_at
      FROM card_collections
      ORDER BY created_at DESC
      LIMIT 10
    `);

    recent.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.recipient_name} (${row.status})`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Stripe Session: ${row.stripe_session_id || 'N/A'}`);
      console.log(`   Slug: ${row.slug || 'N/A'}`);
      console.log(`   QR Code: ${row.qr_code_url || 'N/A'}`);
      console.log(`   Criado: ${row.created_at}`);
      console.log('');
    });

    // Buscar coleções sem stripe_session_id mas com status paid
    const paidWithoutSession = await pool.query(`
      SELECT COUNT(*) as count
      FROM card_collections
      WHERE status = 'paid' AND stripe_session_id IS NULL
    `);

    if (paidWithoutSession.rows[0].count > 0) {
      console.log(`⚠️  ${paidWithoutSession.rows[0].count} coleções pagas sem stripe_session_id\n`);
    }

    // Buscar coleções com slug mas sem qr_code
    const slugWithoutQR = await pool.query(`
      SELECT COUNT(*) as count
      FROM card_collections
      WHERE slug IS NOT NULL AND qr_code_url IS NULL
    `);

    if (slugWithoutQR.rows[0].count > 0) {
      console.log(`⚠️  ${slugWithoutQR.rows[0].count} coleções com slug mas sem QR Code\n`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

debugColecoesDuplicadas();
