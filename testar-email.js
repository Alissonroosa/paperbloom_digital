/**
 * Teste Direto do Envio de Email
 * 
 * Testa se o Resend está configurado corretamente e consegue enviar emails
 */

const baseUrl = 'http://localhost:3000';

async function testarEmail() {
  console.log('📧 Testando envio de email...\n');

  try {
    // Dados de teste
    const testData = {
      recipientEmail: 'SEU-EMAIL-AQUI@example.com', // MUDE AQUI!
      recipientName: 'Teste',
      messageUrl: 'http://localhost:3000/mensagem/teste/123',
      qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      senderName: 'Sistema de Teste',
      messageTitle: 'Mensagem de Teste'
    };

    console.log('📤 Enviando requisição para API de teste de email...');
    console.log(`   Para: ${testData.recipientEmail}\n`);

    const response = await fetch(`${baseUrl}/api/test/send-qrcode-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    
    console.log(`📊 Status da resposta: ${response.status}\n`);

    if (!response.ok) {
      console.log('❌ Erro na resposta:');
      console.log(responseText);
      console.log('\n🔧 Possíveis causas:');
      console.log('   1. RESEND_API_KEY não está configurado no .env.local');
      console.log('   2. RESEND_FROM_EMAIL está incorreto');
      console.log('   3. O email remetente não está verificado no Resend');
      console.log('\n💡 Solução:');
      console.log('   Use: RESEND_FROM_EMAIL=onboarding@resend.dev');
      console.log('   Este email funciona sem verificação!\n');
      return;
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.log('⚠️  Resposta não é JSON válido:');
      console.log(responseText);
      return;
    }

    if (result.success) {
      console.log('✅ EMAIL ENVIADO COM SUCESSO!\n');
      console.log('📋 Detalhes:');
      console.log(`   Message ID: ${result.messageId || 'N/A'}`);
      console.log(`   Para: ${testData.recipientEmail}`);
      console.log(`   De: ${result.from || 'N/A'}`);
      console.log('\n📬 Verifique sua caixa de entrada!');
      console.log('   - Pode levar alguns segundos para chegar');
      console.log('   - Verifique a pasta de spam/lixo eletrônico');
      console.log('   - Procure por email de "Paper Bloom" ou "onboarding@resend.dev"');
    } else {
      console.log('❌ Falha ao enviar email\n');
      console.log('📋 Erro:');
      console.log(`   ${result.error || 'Erro desconhecido'}`);
      console.log('\n🔧 Verifique:');
      console.log('   1. RESEND_API_KEY no .env.local');
      console.log('   2. RESEND_FROM_EMAIL no .env.local');
      console.log('   3. Logs do servidor Next.js');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('\n🔧 Verifique:');
    console.error('   1. O servidor está rodando? (npm run dev)');
    console.error('   2. A API de teste existe?');
    console.error('   3. As variáveis de ambiente estão configuradas?');
    console.error('\n');
  }
}

// Executar teste
testarEmail();
