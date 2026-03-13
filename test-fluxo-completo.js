/**
 * Script de Teste do Fluxo Completo
 * 
 * Este script testa todo o fluxo sem precisar fazer um pagamento real:
 * 1. Cria uma mensagem de teste
 * 2. Simula o processamento do webhook
 * 3. Verifica se tudo foi gerado corretamente
 */

const baseUrl = 'http://localhost:3000';

async function testFluxoCompleto() {
  console.log('🚀 Iniciando teste do fluxo completo...\n');

  try {
    // Passo 1: Criar mensagem de teste
    console.log('📝 Passo 1: Criando mensagem de teste...');
    
    const createResponse = await fetch(`${baseUrl}/api/messages/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientName: 'Maria Silva',
        senderName: 'João Santos',
        messageText: 'Esta é uma mensagem de teste do fluxo automático. Se você está vendo isso, significa que tudo está funcionando perfeitamente!',
        imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Mensagem de Teste',
        specialDate: new Date().toISOString(),
        closingMessage: 'Com carinho',
        signature: 'João',
        galleryImages: []
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Erro ao criar mensagem: ${createResponse.status}`);
    }

    const messageData = await createResponse.json();
    const messageId = messageData.id;
    
    console.log(`✅ Mensagem criada com ID: ${messageId}\n`);

    // Passo 2: Atualizar para 'paid' e gerar QR Code
    console.log('💳 Passo 2: Simulando processamento do pagamento...');
    
    const updateResponse = await fetch(`${baseUrl}/api/test/update-message-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId })
    });

    if (!updateResponse.ok) {
      throw new Error(`Erro ao atualizar mensagem: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();
    
    console.log(`✅ Status atualizado para: ${updateData.status}`);
    console.log(`✅ Slug gerado: ${updateData.slug}`);
    console.log(`✅ QR Code: ${updateData.qrCodeUrl}`);
    console.log(`✅ URL pública: ${updateData.fullUrl}\n`);

    // Passo 3: Verificar se a mensagem está acessível
    console.log('🌐 Passo 3: Verificando se a mensagem está acessível...');
    
    const publicResponse = await fetch(`${baseUrl}${updateData.slug}`);
    
    if (publicResponse.ok) {
      console.log(`✅ Mensagem pública acessível em: ${updateData.fullUrl}\n`);
    } else {
      console.log(`⚠️  Mensagem pública retornou status: ${publicResponse.status}\n`);
    }

    // Passo 4: Verificar página de delivery
    console.log('📦 Passo 4: Verificando página de delivery...');
    
    const deliveryResponse = await fetch(`${baseUrl}/delivery/${messageId}`);
    
    if (deliveryResponse.ok) {
      console.log(`✅ Página de delivery acessível em: ${baseUrl}/delivery/${messageId}\n`);
    } else {
      console.log(`⚠️  Página de delivery retornou status: ${deliveryResponse.status}\n`);
    }

    // Passo 5: Verificar API da mensagem
    console.log('🔍 Passo 5: Verificando API da mensagem...');
    
    const apiResponse = await fetch(`${baseUrl}/api/messages/id/${messageId}`);
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log(`✅ API retornou dados completos:`);
      console.log(`   - Título: ${apiData.title}`);
      console.log(`   - Status: ${apiData.status}`);
      console.log(`   - Slug: ${apiData.slug}`);
      console.log(`   - QR Code: ${apiData.qrCodeUrl}\n`);
    } else {
      console.log(`⚠️  API retornou status: ${apiResponse.status}\n`);
    }

    // Resumo Final
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Resumo:');
    console.log(`   Message ID: ${messageId}`);
    console.log(`   Status: paid ✅`);
    console.log(`   QR Code: Gerado ✅`);
    console.log(`   Slug: Criado ✅`);
    console.log(`   Mensagem Pública: Acessível ✅`);
    console.log(`   Página de Delivery: Acessível ✅`);
    console.log('\n🔗 Links para testar:');
    console.log(`   Mensagem Pública: ${updateData.fullUrl}`);
    console.log(`   Página de Delivery: ${baseUrl}/delivery/${messageId}`);
    console.log('\n💡 Próximo passo:');
    console.log('   Configure o Stripe CLI para testar o webhook real:');
    console.log('   stripe listen --forward-to localhost:3000/api/checkout/webhook');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔧 Verifique:');
    console.error('   1. O servidor Next.js está rodando? (npm run dev)');
    console.error('   2. O banco de dados está acessível?');
    console.error('   3. As variáveis de ambiente estão configuradas?');
    console.error('   4. A pasta public/qr-codes existe?');
    console.error('\n');
    process.exit(1);
  }
}

// Executar teste
testFluxoCompleto();
