/**
 * Simulador de Webhook do Stripe
 * 
 * Este script simula o que o Stripe faria ao enviar um webhook
 * após um pagamento bem-sucedido, SEM precisar do Stripe CLI
 */

const crypto = require('crypto');

const baseUrl = 'http://localhost:3000';

async function simularWebhook() {
  console.log('🎭 Simulando webhook do Stripe...\n');

  try {
    // Passo 1: Criar uma mensagem de teste
    console.log('📝 Passo 1: Criando mensagem de teste...');
    
    const createResponse = await fetch(`${baseUrl}/api/messages/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientName: 'Ana Costa',
        senderName: 'Pedro Lima',
        messageText: 'Olá Ana! Esta é uma mensagem especial criada com muito carinho. Espero que você goste! 💝',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Feliz Aniversário Ana!',
        specialDate: new Date('2024-12-25').toISOString(),
        closingMessage: 'Que todos os seus sonhos se realizem!',
        signature: 'Com amor, Pedro',
        galleryImages: []
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Erro ao criar mensagem: ${createResponse.status}`);
    }

    const messageData = await createResponse.json();
    const messageId = messageData.id;
    
    console.log(`✅ Mensagem criada: ${messageId}\n`);

    // Passo 2: Criar uma sessão de checkout simulada
    console.log('💳 Passo 2: Criando sessão de checkout...');
    
    const sessionResponse = await fetch(`${baseUrl}/api/checkout/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: messageId,
        contactName: 'Pedro Lima',
        contactEmail: 'alisson.roosa@gmail.com', // MUDE PARA SEU EMAIL REAL!
        contactPhone: '(11) 98765-4321'
      })
    });

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json();
      throw new Error(`Erro ao criar sessão: ${JSON.stringify(errorData)}`);
    }

    const sessionData = await sessionResponse.json();
    const sessionId = sessionData.sessionId;
    
    console.log(`✅ Sessão criada: ${sessionId}\n`);

    // Passo 3: Simular o evento de checkout.session.completed
    console.log('🎯 Passo 3: Simulando webhook do Stripe...');
    console.log('   (Normalmente o Stripe enviaria isso automaticamente)\n');

    // Criar payload do webhook simulado
    const webhookPayload = {
      id: `evt_${crypto.randomBytes(12).toString('hex')}`,
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: sessionId,
          object: 'checkout.session',
          amount_total: 2999,
          currency: 'brl',
          customer_details: {
            email: 'alisson.roosa@gmail.com', // MUDE PARA SEU EMAIL REAL!
            name: 'Pedro Lima'
          },
          metadata: {
            messageId: messageId,
            contactName: 'Pedro Lima',
            contactEmail: 'alisson.roosa@gmail.com', // MUDE PARA SEU EMAIL REAL!
            contactPhone: '(11) 98765-4321'
          },
          payment_status: 'paid',
          status: 'complete'
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: null,
        idempotency_key: null
      },
      type: 'checkout.session.completed'
    };

    const payload = JSON.stringify(webhookPayload);
    
    // Gerar uma assinatura falsa (em produção, o Stripe gera isso)
    const timestamp = Math.floor(Date.now() / 1000);
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    const stripeSignature = `t=${timestamp},v1=${signature}`;

    console.log('📤 Enviando webhook para o servidor...\n');

    // Enviar webhook
    const webhookResponse = await fetch(`${baseUrl}/api/checkout/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature
      },
      body: payload
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.log(`⚠️  Webhook retornou status ${webhookResponse.status}`);
      console.log(`   Resposta: ${errorText}\n`);
      
      // Mesmo com erro no webhook, vamos processar manualmente
      console.log('🔧 Processando manualmente como fallback...\n');
      
      const fallbackResponse = await fetch(`${baseUrl}/api/test/update-message-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });

      if (!fallbackResponse.ok) {
        throw new Error('Erro no processamento manual');
      }

      const fallbackData = await fallbackResponse.json();
      console.log('✅ Processamento manual concluído!\n');
      
      printResults(messageId, fallbackData);
      return;
    }

    const webhookResult = await webhookResponse.json();
    console.log('✅ Webhook processado com sucesso!\n');

    // Passo 4: Verificar resultado
    console.log('🔍 Passo 4: Verificando resultado...\n');

    const messageResponse = await fetch(`${baseUrl}/api/messages/id/${messageId}`);
    const updatedMessage = await messageResponse.json();

    printResults(messageId, updatedMessage);

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\n🔧 Verifique:');
    console.error('   1. O servidor está rodando? (npm run dev)');
    console.error('   2. As variáveis de ambiente estão configuradas?');
    console.error('   3. O banco de dados está acessível?');
    console.error('\n');
    process.exit(1);
  }
}

function printResults(messageId, data) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 SIMULAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n📋 Resumo:');
  console.log(`   Message ID: ${messageId}`);
  console.log(`   Status: ${data.status} ✅`);
  console.log(`   Slug: ${data.slug} ✅`);
  console.log(`   QR Code: ${data.qrCodeUrl} ✅`);
  
  console.log('\n🔗 Links para testar:');
  console.log(`   Mensagem Pública: ${baseUrl}${data.slug}`);
  console.log(`   Página de Delivery: ${baseUrl}/delivery/${messageId}`);
  
  console.log('\n📧 Email:');
  console.log('   ⚠️  IMPORTANTE: Mude "seu-email@example.com" no script');
  console.log('   para seu email real e execute novamente para receber o email!');
  
  console.log('\n💡 Próximos passos:');
  console.log('   1. Acesse os links acima para ver a mensagem');
  console.log('   2. Verifique seu email (se configurou o Resend)');
  console.log('   3. Teste criando uma mensagem real no wizard:');
  console.log(`      ${baseUrl}/editor/mensagem`);
  console.log('\n');
}

// Executar simulação
simularWebhook();
