require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('\n🔄 Executando Migration: Adicionar Campos de Contato\n');
console.log('═══════════════════════════════════════════════════════\n');

// Criar pool de conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeMigration() {
  const client = await pool.connect();
  
  try {
    console.log('📡 Conectado ao PostgreSQL\n');
    
    // Ler o arquivo de migration
    const migrationPath = path.join(__dirname, 'migrations', '005_add_contact_fields_to_messages.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executando migration...\n');
    
    // Executar a migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration executada com sucesso!\n');
    
    // Verificar se as colunas foram adicionadas
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'messages'
      AND column_name IN ('contact_name', 'contact_email', 'contact_phone')
      ORDER BY column_name;
    `);
    
    console.log('📊 Colunas adicionadas:\n');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.column_name} (${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''})`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 Campos de contato adicionados com sucesso!\n');
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    console.log('\n💡 Verifique se:');
    console.log('   1. O PostgreSQL está rodando');
    console.log('   2. DATABASE_URL está configurado no .env.local');
    console.log('   3. A tabela messages existe\n');
  } finally {
    client.release();
    await pool.end();
  }
}

executeMigration();
