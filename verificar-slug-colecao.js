const { Pool } = require('pg');

async function verificarSlug() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Verificando slug da coleção...\n');
    
    const collectionId = 'be256b01-f30a-47f6-8c4b-642ef7c0ab72';
    
    const result = await pool.query(
      'SELECT id, recipient_name, sender_name, slug, status FROM card_collections WHERE id = $1',
      [collectionId]
    );

    if (result.rows.length === 0) {
      console.log('❌ Coleção não encontrada!');
      return;
    }

    const collection = result.rows[0];
    
    console.log('📋 Dados da Coleção:');
    console.log('   ID:', collection.id);
    console.log('   Para:', collection.recipient_name);
    console.log('   De:', collection.sender_name);
    console.log('   Status:', collection.status);
    console.log('   Slug:', collection.slug);
    console.log('');
    
    if (collection.slug) {
      console.log('✅ Slug encontrado:', collection.slug);
      console.log('📍 URL esperada:', `http://localhost:3000${collection.slug}`);
    } else {
      console.log('❌ Slug não foi gerado!');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarSlug();
