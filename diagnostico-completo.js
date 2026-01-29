/**
 * Diagnóstico Completo do Sistema de Email
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const http = require('http');

async function diagnosticoCompleto() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     DIAGNÓSTICO COMPLETO - SISTEMA DE EMAIL                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const problemas = [];
  const avisos = [];

  // 1. Verificar variáveis de ambiente
  console.log('1️⃣  VARIÁVEIS DE AMBIENTE');
  console.log('─'.repeat(60));
  
  const envVars = {
    'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
    'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
    'RESEND_API_KEY': process.env.RESEND_API_KEY,
    'RESEND_FROM_EMAIL': process.env.RESEND_FROM_EMAIL,
    'RESEND_FROM_NAME': process.env.RESEND_FROM_NAME,
    'NEXT_PUBLIC_BASE_URL': process.env.NEXT_PUBLIC_BASE_URL,
    'DATABASE_URL': process.env.DATABASE_URL,
  };

  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      if (key.includes('KEY') || key.includes('SECRET') || key.includes('URL')) {
        console.log(`   ✅ ${key}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`   ✅ ${key}: ${value}`);
      }
    } else {
      console.log(`   ❌ ${key}: AUSENTE`);
      problemas.push(`Variável ${key} não configurada`);
    }
  }

  // 2. Verificar conexão com banco de dados
  console.log('\n2️⃣  BANCO DE DADOS');
  console.log('─'.repeat(60));
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM messages WHERE status = $1', ['paid']);
    console.log(`   ✅ Conexão com banco: OK`);
    console.log(`   📊 Mensagens pagas: ${result.rows[0].total}`);
    
    // Verificar mensagens com email
    const withEmail = await pool.query('SELECT COUNT(*) as total FROM messages WHERE status = $1 AND contact_email IS NOT NULL', ['paid']);
    console.log(`   📧 Mensagens com email: ${withEmail.rows[0].total}`);
    
    if (withEmail.rows[0].total === '0') {
      avisos.push('Nenhuma mensagem paga tem email de contato');
    }
  } catch (error) {
    console.log(`   ❌ Erro ao conectar: ${error.message}`);
    problemas.push('Não foi possível conectar ao banco de dados');
  } finally {
    await pool.end();
  }

  // 3. Verificar Resend
  console.log('\n3️⃣  RESEND (SERVIÇO DE EMAIL)');
  console.log('─'.repeat(60));
  
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log(`   ✅ Resend inicializado`);
    console.log(`   📧 Email de envio: ${process.env.RESEND_FROM_EMAIL}`);
    console.log(`   👤 Nome de envio: ${process.env.RESEND_FROM_NAME}`);
    
    // Tentar enviar email de teste
    console.log(`   🔄 Testando envio de email...`);
    const testResult = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: process.env.RESEND_FROM_EMAIL,
      subject: 'Teste de Diagnóstico - Paper Bloom',
      html: '<h1>Teste OK</h1><p>O Resend está funcionando corretamente!</p>',
    });
    
    console.log(`   ✅ Email de teste enviado: ${testResult.data?.id}`);
  } catch (error) {
    console.log(`   ❌ Erro no Resend: ${error.message}`);
    problemas.push(`Resend não está funcionando: ${error.message}`);
  }

  // 4. Verificar servidor Next.js
  console.log('\n4️⃣  SERVIDOR NEXT.JS');
  console.log('─'.repeat(60));
  
  try {
    await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000', (res) => {
        console.log(`   ✅ Servidor rodando na porta 3000`);
        console.log(`   📡 Status: ${res.statusCode}`);
        resolve();
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ Servidor não está rodando`);
        problemas.push('Servidor Next.js não está rodando na porta 3000');
        reject(error);
      });
      
      req.setTimeout(2000, () => {
        req.destroy();
        console.log(`   ❌ Timeout ao conectar no servidor`);
        problemas.push('Timeout ao conectar no servidor Next.js');
        reject(new Error('Timeout'));
      });
    });
  } catch (error) {
    // Erro já logado acima
  }

  // 5. Verificar webhook endpoint
  console.log('\n5️⃣  WEBHOOK ENDPOINT');
  console.log('─'.repeat(60));
  
  console.log(`   📍 URL: http://localhost:3000/api/checkout/webhook`);
  console.log(`   ⚠️  Webhook precisa do Stripe CLI rodando`);
  console.log(`   💡 Execute: stripe listen --forward-to localhost:3000/api/checkout/webhook`);

  // 6. Verificar Stripe CLI
  console.log('\n6️⃣  STRIPE CLI');
  console.log('─'.repeat(60));
  
  const { exec } = require('child_process');
  
  try {
    await new Promise((resolve, reject) => {
      exec('stripe --version', (error, stdout, stderr) => {
        if (error) {
          console.log(`   ❌ Stripe CLI não instalado`);
          problemas.push('Stripe CLI não está instalado');
          reject(error);
        } else {
          console.log(`   ✅ Stripe CLI instalado: ${stdout.trim()}`);
          console.log(`   💡 Para iniciar: stripe listen --forward-to localhost:3000/api/checkout/webhook`);
          resolve();
        }
      });
    });
  } catch (error) {
    // Erro já logado acima
  }

  // Resumo
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                         RESUMO                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (problemas.length === 0 && avisos.length === 0) {
    console.log('✅ TUDO OK! Sistema pronto para funcionar.\n');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('   1. Certifique-se de que o servidor está rodando: npm run dev');
    console.log('   2. Inicie o webhook: stripe listen --forward-to localhost:3000/api/checkout/webhook');
    console.log('   3. Faça um pagamento de teste');
    console.log('   4. Verifique os logs nos terminais\n');
  } else {
    if (problemas.length > 0) {
      console.log('❌ PROBLEMAS ENCONTRADOS:\n');
      problemas.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p}`);
      });
      console.log('');
    }
    
    if (avisos.length > 0) {
      console.log('⚠️  AVISOS:\n');
      avisos.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a}`);
      });
      console.log('');
    }
  }

  console.log('📚 DOCUMENTAÇÃO:');
  console.log('   - RESOLVER_EMAIL_AGORA.md - Guia rápido');
  console.log('   - INICIAR_WEBHOOK_AGORA.md - Passo a passo');
  console.log('   - SOLUCAO_EMAIL_WEBHOOK.md - Diagnóstico completo\n');

  console.log('🛠️  SCRIPTS ÚTEIS:');
  console.log('   - node enviar-emails-pendentes.js - Enviar emails de mensagens antigas');
  console.log('   - node testar-resend-config.js - Testar Resend');
  console.log('   - node debug-webhook-email.js - Debug de mensagens');
  console.log('   - .\\iniciar-tudo.ps1 - Iniciar tudo automaticamente\n');
}

diagnosticoCompleto().catch(console.error);
