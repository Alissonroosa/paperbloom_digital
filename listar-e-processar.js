require('dotenv').config({ path: '.env.local' });
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

console.log('\n📋 Listar e Processar Mensagens Pendentes\n');
console.log('═══════════════════════════════════════════════════════\n');

async function listarMensagens() {
  try {
    // Abrir banco de dados
    const db = await open({
      filename: path.join(__dirname, 'messages.db'),
      driver: sqlite3.Database
    });

    // Buscar mensagens pendentes
    const mensagens = await db.all(`
      SELECT id, recipientName, senderName, status, createdAt 
      FROM messages 
      WHERE status = 'pending' 
      ORDER BY createdAt DESC 
      LIMIT 20
    `);

    await db.close();

    if (mensagens.length === 0) {
      console.log('✅ Nenhuma mensagem pendente encontrada!\n');
      console.log('Todas as mensagens foram processadas.\n');
      return;
    }

    console.log(`📊 Encontradas ${mensagens.length} mensagens pendentes:\n`);

    mensagens.forEach((msg, index) => {
      const data = new Date(msg.createdAt).toLocaleString('pt-BR');
      console.log(`${index + 1}. ID: ${msg.id}`);
      console.log(`   Para: ${msg.recipientName}`);
      console.log(`   De: ${msg.senderName}`);
      console.log(`   Criada: ${data}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('💡 Para processar uma mensagem específica:\n');
    console.log(`   node processar-pendente-api.js ${mensagens[0].id}\n`);
    console.log('💡 Para processar TODAS as mensagens pendentes:\n');
    console.log('   node processar-todas-pendentes.js\n');

  } catch (error) {
    console.error('❌ Erro ao listar mensagens:', error.message);
    console.log('\n💡 Certifique-se que o arquivo messages.db existe.\n');
  }
}

listarMensagens();
