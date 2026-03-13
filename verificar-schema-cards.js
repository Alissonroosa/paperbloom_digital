require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function verificarSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Verificando schema da tabela cards...\n');

    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cards'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela cards NÃO existe!');
      return;
    }

    console.log('✅ Tabela cards existe!\n');

    // Listar todas as colunas
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'cards'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colunas da tabela cards:\n');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Contar registros
    const count = await pool.query('SELECT COUNT(*) FROM cards');
    console.log(`\n📊 Total de registros: ${count.rows[0].count}`);

    // Verificar relacionamento com card_collections
    const withCollection = await pool.query(`
      SELECT COUNT(DISTINCT collection_id) as collections
      FROM cards
    `);
    console.log(`📦 Coleções com cartas: ${withCollection.rows[0].collections}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarSchema();
