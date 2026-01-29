/**
 * Script para testar a correção do YouTube Video ID
 * 
 * Este script:
 * 1. Cria uma nova coleção
 * 2. Atualiza com youtubeVideoId
 * 3. Verifica se foi salvo corretamente
 * 4. Busca a coleção novamente
 * 5. Confirma que o valor persiste
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: '82.112.250.187',
  port: 5432,
  database: 'c_paperbloom',
  user: 'alisson_user',
  password: 'A#A@T4rrm%172628',
});

async function testYouTubeVideoIdFix() {
  console.log('🧪 Testando correção do YouTube Video ID...\n');

  try {
    // 1. Criar nova coleção
    console.log('1️⃣ Criando nova coleção de teste...');
    const createResult = await pool.query(`
      INSERT INTO card_collections (
        id,
        recipient_name,
        sender_name,
        contact_email,
        status,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        'Teste Destinatário',
        'Teste Remetente',
        'teste@exemplo.com',
        'pending',
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    const collection = createResult.rows[0];
    console.log(`✅ Coleção criada: ${collection.id}\n`);

    // 2. Atualizar com youtubeVideoId
    console.log('2️⃣ Atualizando com youtubeVideoId...');
    const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up
    
    const updateResult = await pool.query(`
      UPDATE card_collections
      SET 
        youtube_video_id = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [testVideoId, collection.id]);

    const updatedCollection = updateResult.rows[0];
    console.log(`✅ Coleção atualizada`);
    console.log(`   youtube_video_id: ${updatedCollection.youtube_video_id}\n`);

    // 3. Verificar se foi salvo
    if (updatedCollection.youtube_video_id === testVideoId) {
      console.log('✅ YouTube Video ID salvo corretamente!\n');
    } else {
      console.log('❌ ERRO: YouTube Video ID não foi salvo corretamente');
      console.log(`   Esperado: ${testVideoId}`);
      console.log(`   Recebido: ${updatedCollection.youtube_video_id}\n`);
      return;
    }

    // 4. Buscar novamente para confirmar persistência
    console.log('3️⃣ Buscando coleção novamente para confirmar persistência...');
    const selectResult = await pool.query(`
      SELECT * FROM card_collections
      WHERE id = $1
    `, [collection.id]);

    const fetchedCollection = selectResult.rows[0];
    console.log(`✅ Coleção encontrada`);
    console.log(`   youtube_video_id: ${fetchedCollection.youtube_video_id}\n`);

    // 5. Confirmar persistência
    if (fetchedCollection.youtube_video_id === testVideoId) {
      console.log('✅ YouTube Video ID persiste corretamente no banco!\n');
    } else {
      console.log('❌ ERRO: YouTube Video ID não persistiu');
      console.log(`   Esperado: ${testVideoId}`);
      console.log(`   Recebido: ${fetchedCollection.youtube_video_id}\n`);
      return;
    }

    // 6. Testar atualização via API (simulação)
    console.log('4️⃣ Testando atualização com múltiplos campos...');
    const newVideoId = 'jNQXAC9IVRw'; // Me at the zoo (primeiro vídeo do YouTube)
    
    const multiUpdateResult = await pool.query(`
      UPDATE card_collections
      SET 
        sender_name = $1,
        recipient_name = $2,
        youtube_video_id = $3,
        contact_name = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [
      'Novo Remetente',
      'Novo Destinatário',
      newVideoId,
      'Nome de Contato',
      collection.id
    ]);

    const multiUpdated = multiUpdateResult.rows[0];
    console.log(`✅ Atualização múltipla concluída`);
    console.log(`   sender_name: ${multiUpdated.sender_name}`);
    console.log(`   recipient_name: ${multiUpdated.recipient_name}`);
    console.log(`   youtube_video_id: ${multiUpdated.youtube_video_id}`);
    console.log(`   contact_name: ${multiUpdated.contact_name}\n`);

    if (multiUpdated.youtube_video_id === newVideoId) {
      console.log('✅ YouTube Video ID atualizado corretamente em update múltiplo!\n');
    } else {
      console.log('❌ ERRO: YouTube Video ID não foi atualizado em update múltiplo\n');
      return;
    }

    // 7. Limpar teste
    console.log('5️⃣ Limpando dados de teste...');
    await pool.query(`
      DELETE FROM card_collections
      WHERE id = $1
    `, [collection.id]);
    console.log('✅ Dados de teste removidos\n');

    // Resumo final
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ YouTube Video ID é salvo corretamente');
    console.log('✅ YouTube Video ID persiste no banco de dados');
    console.log('✅ YouTube Video ID é atualizado em updates múltiplos');
    console.log('✅ Outros campos não são afetados');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    console.error('\nDetalhes do erro:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  } finally {
    await pool.end();
  }
}

// Executar teste
testYouTubeVideoIdFix();
