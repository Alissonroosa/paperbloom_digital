require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function verificarSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Verificando schema da tabela messages...\n');

    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'messages'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela messages NÃO existe!');
      return;
    }

    console.log('✅ Tabela messages existe!\n');

    // Listar todas as colunas
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'messages'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colunas da tabela messages:\n');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Contar registros
    const count = await pool.query('SELECT COUNT(*) FROM messages');
    console.log(`\n📊 Total de registros: ${count.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarSchema();
