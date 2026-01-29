require('dotenv').config({ path: '.env.local' });

console.log('\n🔧 Processar Mensagem Pendente via API\n');
console.log('═══════════════════════════════════════════════════════\n');

async function processarMensagem(messageId) {
  try {
    console.log(`📝 Processando mensagem: ${messageId}\n`);

    // Simular webhook do Stripe
    console.log('🔄 Enviando webhook simulado...\n');

    const webhookPayload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_simulated_' + Date.now(),
          metadata: {
            messageId: messageId,
            contactEmail: 'alisson.roosa@gmail.com',
            contactName: 'Alisson'
          },
          customer_details: {
            email: 'alisson.roosa@gmail.com'
          }
        }
      }
    };

    // Tentar processar via API de teste
    const testUrl = `http://localhost:3000/api/test/update-message-status`;
    
    console.log('📡 Enviando para:', testUrl);
    console.log('📦 Payload:', JSON.stringify({ messageId, status: 'paid' }, null, 2));
    console.log('');

    const response = await fetch(testUrl, {
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
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (result.message) {
      console.log('🔗 Links:');
      if (result.message.slug) {
        console.log(`   Mensagem: http://localhost:3000${result.message.slug}`);
      }
      console.log(`   Delivery: http://localhost:3000/delivery/${result.message.id}`);
      console.log('');

      if (result.message.qrCodeUrl) {
        console.log(`✅ QR Code: ${result.message.qrCodeUrl}`);
      }
      if (result.message.slug) {
        console.log(`✅ Slug: ${result.message.slug}`);
      }
      console.log(`✅ Status: ${result.message.status}`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Pronto! Acesse a página de delivery para ver o QR Code.\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('');
    console.log('💡 Certifique-se que:');
    console.log('   1. Next.js está rodando (npm run dev)');
    console.log('   2. O messageId está correto');
    console.log('   3. A API /api/test/update-message-status existe');
    console.log('');
  }
}

// Pegar messageId dos argumentos
const messageId = process.argv[2];

if (!messageId) {
  console.log('❌ Erro: MessageId não fornecido\n');
  console.log('💡 Uso:');
  console.log('   node processar-pendente-api.js MESSAGE_ID\n');
  console.log('Exemplo:');
  console.log('   node processar-pendente-api.js 5ef14f3b-0559-4378-bb4f-4bb0445fc744\n');
  process.exit(1);
}

processarMensagem(messageId);
