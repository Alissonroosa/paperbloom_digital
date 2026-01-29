/**
 * Script para testar a busca de título do YouTube
 * Execute: node testar-youtube-title.js
 */

const testUrl = 'https://www.youtube.com/watch?v=nSDgHBxUbVQ';

async function testYouTubeTitle() {
  console.log('🎵 Testando busca de título do YouTube...\n');
  console.log('URL:', testUrl);
  
  try {
    const videoId = testUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    console.log('Video ID:', videoId);
    
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    console.log('\nBuscando informações...');
    
    const response = await fetch(oembedUrl);
    const data = await response.json();
    
    console.log('\n✅ Sucesso!');
    console.log('Título:', data.title);
    console.log('Autor:', data.author_name);
    console.log('Thumbnail:', data.thumbnail_url);
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

testYouTubeTitle();
