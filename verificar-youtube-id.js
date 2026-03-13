const { Pool } = require('pg');

async function verificarYoutubeId() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Verificando youtubeVideoId da coleção...\n');
    
    const collectionId = 'be256b01-f30a-47f6-8c4b-642ef7c0ab72';
    
    const result = await pool.query(
      'SELECT id, recipient_name, youtube_video_id FROM card_collections WHERE id = $1',
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
    console.log('   YouTube Video ID:', collection.youtube_video_id);
    console.log('');
    
    if (collection.youtube_video_id) {
      console.log('✅ YouTube Video ID encontrado:', collection.youtube_video_id);
      console.log('📍 URL do vídeo:', `https://www.youtube.com/watch?v=${collection.youtube_video_id}`);
    } else {
      console.log('❌ YouTube Video ID não foi salvo!');
      console.log('⚠️  Será usado o padrão: nSDgHBxUbVQ');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarYoutubeId();
