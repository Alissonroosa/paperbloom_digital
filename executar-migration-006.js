require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function executarMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Executando migration 006...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'migrations', '006_add_missing_fields_to_card_collections.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL a ser executado:');
    console.log(sql);
    console.log('\n');

    // Executar a migration
    await pool.query(sql);

    console.log('✅ Migration executada com sucesso!\n');

    // Verificar se os campos foram adicionados
    const columns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'card_collections'
      AND column_name IN ('contact_phone', 'intro_message')
      ORDER BY column_name;
    `);

    console.log('📋 Campos adicionados:\n');
    columns.rows.forEach(col => {
      console.log(`  ✅ ${col.column_name} (${col.data_type})`);
    });

    if (columns.rows.length === 2) {
      console.log('\n🎉 Todos os campos foram adicionados com sucesso!');
    } else {
      console.log('\n⚠️ Alguns campos podem não ter sido adicionados.');
    }

  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

executarMigration();
