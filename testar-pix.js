/**
 * Script para testar pagamentos PIX
 * Simula o fluxo completo de pagamento via PIX
 */

const { messageService } = require('./src/services/MessageService');

async function testarFluxoPix() {
  console.log('🧪 Testando fluxo de pagamento PIX...\n');

  try {
    // 1. Criar uma mensagem de teste
    console.log('1️⃣ Criando mensagem de teste...');
    const testMessage = await messageService.create({
      senderName: 'João Silva',
      recipientName: 'Maria Santos',
      message: 'Teste de pagamento PIX',
      specialDate: new Date('2024-12-25'),
      imageUrl: '/uploads/test-image.jpg',
      musicUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      theme: 'romantic',
      contactName: 'João Silva',
      contactEmail: 'joao@example.com',
      contactPhone: '11999999999',
    });
    
    console.log(`✅ Mensagem criada: ${testMessage.id}\n`);

    // 2. Criar checkout session
    console.log('2️⃣ Criando checkout session...');
    const response = await fetch('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: testMessage.id,
        contactName: 'João Silva',
        contactEmail: 'joao@example.com',
        contactPhone: '11999999999',
      }),
    });

    const data = await response.json();
    console.log(`✅ Checkout session criado: ${data.sessionId}`);
    console.log(`   URL: ${data.url}\n`);

    // 3. Instruções para teste
    console.log('3️⃣ Próximos passos:\n');
    console.log('   a) Abra a URL do checkout no navegador:');
    console.log(`      ${data.url}\n`);
    console.log('   b) Escolha "PIX" como método de pagamento\n');
    console.log('   c) Você verá um QR code PIX\n');
    console.log('   d) Para simular pagamento em DEV, use:');
    console.log('      stripe trigger checkout.session.async_payment_succeeded\n');
    console.log('   e) Para simular falha em DEV, use:');
    console.log('      stripe trigger checkout.session.async_payment_failed\n');
    console.log('   f) Verifique os logs do webhook para confirmar processamento\n');

    console.log('📊 Informações da mensagem:');
    console.log(`   ID: ${testMessage.id}`);
    console.log(`   Status: ${testMessage.status}`);
    console.log(`   Email: ${testMessage.contactEmail}`);
    console.log(`   Session: ${data.sessionId}\n`);

    console.log('🎉 Teste configurado com sucesso!');
    console.log('   Aguardando pagamento PIX...\n');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  }
}

// Executar teste
testarFluxoPix();
