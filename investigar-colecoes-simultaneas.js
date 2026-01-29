require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function investigar() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Investigando coleções criadas simultaneamente...\n');

    // Buscar pares de coleções criadas no mesmo segundo
    const pares = await pool.query(`
      WITH colecoes_agrupadas AS (
        SELECT 
          DATE_TRUNC('second', created_at) as segundo,
          COUNT(*) as quantidade,
          ARRAY_AGG(id ORDER BY created_at) as ids,
          ARRAY_AGG(recipient_name ORDER BY created_at) as nomes,
          ARRAY_AGG(sender_name ORDER BY created_at) as remetentes,
          ARRAY_AGG(status ORDER BY created_at) as statuses,
          ARRAY_AGG(stripe_session_id ORDER BY created_at) as sessions
        FROM card_collections
        WHERE created_at > NOW() - INTERVAL '1 day'
        GROUP BY DATE_TRUNC('second', created_at)
        HAVING COUNT(*) > 1
      )
      SELECT * FROM colecoes_agrupadas
      ORDER BY segundo DESC
      LIMIT 5
    `);

    if (pares.rows.length > 0) {
      console.log('❌ Encontrados pares de coleções criadas no mesmo segundo:\n');
      
      pares.rows.forEach((par, i) => {
        console.log(`Par ${i + 1}: ${par.segundo}`);
        console.log(`  Quantidade: ${par.quantidade}`);
        console.log(`  IDs: ${par.ids.join(', ')}`);
        console.log(`  Nomes: ${par.nomes.join(' | ')}`);
        console.log(`  Remetentes: ${par.remetentes.join(' | ')}`);
        console.log(`  Status: ${par.statuses.join(' | ')}`);
        console.log(`  Sessions: ${par.sessions.join(' | ')}`);
        console.log('');
      });

      // Buscar as cartas de cada coleção do primeiro par
      if (pares.rows[0]) {
        console.log('📋 Verificando cartas de cada coleção do primeiro par:\n');
        
        for (const collectionId of pares.rows[0].ids) {
          const cards = await pool.query(`
            SELECT COUNT(*) as total
            FROM cards
            WHERE collection_id = $1
          `, [collectionId]);
          
          console.log(`  Coleção ${collectionId}: ${cards.rows[0].total} cartas`);
        }
        console.log('');
      }
    } else {
      console.log('✅ Nenhum par de coleções criadas simultaneamente nas últimas 24h\n');
    }

    // Verificar se há coleções com mesmo stripe_session_id
    const mesmoSession = await pool.query(`
      SELECT 
        stripe_session_id,
        COUNT(*) as quantidade,
        ARRAY_AGG(id) as ids,
        ARRAY_AGG(recipient_name) as nomes,
        ARRAY_AGG(status) as statuses
      FROM card_collections
      WHERE stripe_session_id IS NOT NULL
      GROUP BY stripe_session_id
      HAVING COUNT(*) > 1
    `);

    if (mesmoSession.rows.length > 0) {
      console.log('❌ Coleções com mesmo stripe_session_id:\n');
      mesmoSession.rows.forEach(row => {
        console.log(`  Session: ${row.stripe_session_id}`);
        console.log(`  Quantidade: ${row.quantidade}`);
        console.log(`  IDs: ${row.ids.join(', ')}`);
        console.log(`  Nomes: ${row.nomes.join(' | ')}`);
        console.log(`  Status: ${row.statuses.join(' | ')}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

investigar();
