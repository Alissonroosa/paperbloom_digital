require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

console.log('\n🔄 Processar Última Mensagem Pendente\n');
console.log('═══════════════════════════════════════════════════════\n');

async function buscarUltimaMensagemPendente() {
  try {
    // Ler o banco de dados SQLite diretamente
    const dbPath = path.join(__dirname, 'messages.db');
    
    if (!fs.existsSync(dbPath)) {
      throw new Error('Banco de dados não encontrado');
    }

    // Usar a API de teste para buscar mensagens
    console.log('🔍 Buscando última mensagem pendente...\n');

    const response = await fetch('http://localhost:3000/api/test/list-pending-messages');
    
    if (!response.ok) {
      throw new Error('Erro ao buscar mensagens pendentes');
    }

    const data = await response.json();
    
    if (!data.messages || data.messages.length === 0) {
      console.log('✅ Nenhuma mensagem pendente encontrada!\n');
      console.log('Todas as mensagens foram processadas.\n');
      return null;
    }

    return data.messages[0]; // Retorna a mais recente
  } catch (error) {
    // Se a API não existir, tentar método alternativo
    console.log('⚠️  API não disponível, tentando método alternativo...\n');
    return null;
  }
}

async function processarMensagem(messageId) {
  try {
    console.log(`📝 Processando mensagem: ${messageId}\n`);

    const response = await fetch('http://localhost:3000/api/test/update-message-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: messageId,
        status: 'paid'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API retornou erro: ${response.status} - ${error}`);
    }

    const result = await response.json();
    
    console.log('✅ Mensagem processada com sucesso!\n');
    console.log('📊 Resultado:');
    console.log(`   Status: ${result.status}`);
    console.log(`   QR Code: ${result.qrCodeUrl}`);
    console.log(`   Slug: ${result.slug}\n`);

    console.log('🔗 Links:');
    console.log(`   Mensagem: ${result.fullUrl}`);
    console.log(`   Delivery: ${result.deliveryUrl}\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Pronto! Acesse a página de delivery para ver o QR Code.\n');

    return result;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('');
    console.log('💡 Certifique-se que:');
    console.log('   1. Next.js está rodando (npm run dev)');
    console.log('   2. A API /api/test/update-message-status existe');
    console.log('');
    throw error;
  }
}

// Executar
(async () => {
  try {
    // Verificar se foi passado um ID específico
    const messageId = process.argv[2];

    if (messageId) {
      // Processar mensagem específica
      await processarMensagem(messageId);
    } else {
      // Buscar e processar a última mensagem pendente
      const mensagem = await buscarUltimaMensagemPendente();

      if (mensagem) {
        console.log('📋 Última mensagem pendente encontrada:');
        console.log(`   ID: ${mensagem.id}`);
        console.log(`   Para: ${mensagem.recipientName}`);
        console.log(`   De: ${mensagem.senderName}\n`);

        await processarMensagem(mensagem.id);
      } else {
        // Se não encontrou via API, pedir o ID manualmente
        console.log('💡 Para processar uma mensagem específica:');
        console.log('   node processar-ultima-pendente.js MESSAGE_ID\n');
        console.log('💡 Ou use o teste completo:');
        console.log('   node testar-fluxo-completo-com-email.js\n');
      }
    }
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
})();
