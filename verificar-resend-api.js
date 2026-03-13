/**
 * Verificar se a API Key do Resend está válida
 */

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function verificarResendAPI() {
  console.log('🔍 Verificando API Key do Resend...\n');

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY não encontrado no .env.local\n');
    return;
  }

  console.log(`📋 API Key encontrada: ${apiKey.substring(0, 15)}...\n`);

  try {
    const resend = new Resend(apiKey);

    console.log('🧪 Testando API Key...\n');

    // Tentar listar domínios (isso valida a API key)
    const domains = await resend.domains.list();
    
    console.log('✅ API KEY VÁLIDA!\n');
    console.log('📊 Informações da conta:');
    
    if (domains.data && domains.data.length > 0) {
      console.log(`   Domínios configurados: ${domains.data.length}`);
      domains.data.forEach(domain => {
        console.log(`   - ${domain.name} (${domain.status})`);
      });
    } else {
      console.log('   ⚠️  Nenhum domínio configurado');
      console.log('   💡 Você pode usar onboarding@resend.dev sem configurar domínio');
    }

    console.log('\n🎯 Tentando enviar email de teste...\n');

    const result = await resend.emails.send({
      from: 'Paper Bloom <onboarding@resend.dev>',
      to: 'alisson.roosa@gmail.com',
      subject: 'Teste Resend API - Paper Bloom',
      html: '<h1>Teste de Email</h1><p>Se você recebeu este email, a API está funcionando!</p>',
    });

    console.log('✅ EMAIL ENVIADO!\n');
    console.log('📋 Resposta do Resend:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n📬 Verifique seu email: alisson.roosa@gmail.com');
    console.log('🌐 Dashboard Resend: https://resend.com/emails');
    console.log('\n');

  } catch (error) {
    console.error('❌ ERRO AO VALIDAR API KEY:\n');
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('🔑 API Key INVÁLIDA ou EXPIRADA\n');
      console.error('💡 Solução:');
      console.error('   1. Acesse: https://resend.com/api-keys');
      console.error('   2. Crie uma NOVA API key');
      console.error('   3. Copie a key completa (começa com "re_")');
      console.error('   4. Substitua no .env.local:');
      console.error('      RESEND_API_KEY=re_nova_key_aqui');
      console.error('   5. Reinicie o servidor Next.js');
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.error('🚫 Acesso negado\n');
      console.error('💡 Possíveis causas:');
      console.error('   - Conta suspensa');
      console.error('   - Limite de envios atingido');
      console.error('   - API key sem permissões');
    } else if (error.message.includes('429')) {
      console.error('⏱️  Limite de requisições atingido\n');
      console.error('💡 Aguarde alguns minutos e tente novamente');
    } else {
      console.error('Erro:', error.message);
      console.error('\nDetalhes completos:');
      console.error(error);
    }
    
    console.error('\n🔧 Verificações:');
    console.error('   1. A API key está correta no .env.local?');
    console.error('   2. A API key não expirou?');
    console.error('   3. Você tem acesso à conta do Resend?');
    console.error('   4. A conta está ativa (não suspensa)?');
    console.error('\n');
  }
}

verificarResendAPI();
