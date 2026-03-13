const { Pool } = require('pg');

async function atualizarYoutubeId() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔧 Atualizando YouTube Video ID...\n');
    
    // ID da coleção que você quer atualizar
    const collectionId = 'be256b01-f30a-47f6-8c4b-642ef7c0ab72';
    
    // ID do vídeo do YouTube que você quer usar
    // Exemplos:
    // - "dQw4w9WgXcQ" = Rick Astley - Never Gonna Give You Up
    // - "nSDgHBxUbVQ" = Música romântica padrão
    // - "9bZkp7q19f0" = PSY - Gangnam Style
    const youtubeVideoId = 'nSDgHBxUbVQ'; // ← ALTERE AQUI para o ID que você quer
    
    console.log('📋 Dados:');
    console.log('   Collection ID:', collectionId);
    console.log('   YouTube Video ID:', youtubeVideoId);
    console.log('   URL do vídeo:', `https://www.youtube.com/watch?v=${youtubeVideoId}`);
    console.log('');
    
    // Atualizar no banco
    const result = await pool.query(
      'UPDATE card_collections SET youtube_video_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [youtubeVideoId, collectionId]
    );

    if (result.rowCount === 0) {
      console.log('❌ Coleção não encontrada!');
      return;
    }

    console.log('✅ YouTube Video ID atualizado com sucesso!');
    console.log('');
    console.log('📊 Dados atualizados:');
    console.log('   ID:', result.rows[0].id);
    console.log('   Para:', result.rows[0].recipient_name);
    console.log('   YouTube Video ID:', result.rows[0].youtube_video_id);
    console.log('');
    console.log('🎵 Agora acesse a página e a música correta deve tocar!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

atualizarYoutubeId();
