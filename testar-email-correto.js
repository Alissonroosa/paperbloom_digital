/**
 * Teste com o email correto da conta Resend
 */

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testarEmailCorreto() {
  console.log('📧 Enviando para o email da conta Resend...\n');

  const apiKey = process.env.RESEND_API_KEY;
  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: 'Paper Bloom <onboarding@resend.dev>',
      to: 'paperbloom.tm@gmail.com', // Email da conta Resend
      subject: '🎉 Paper Bloom - Sistema Funcionando!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px; }
              .alert { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .success { background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; }
              h1 { margin: 0; }
              ul { padding-left: 20px; }
              li { margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ Sistema Funcionando!</h1>
              <p>Paper Bloom - Envio de Emails Configurado</p>
            </div>
            <div class="content">
              <div class="success">
                <h2>🎉 Parabéns!</h2>
                <p><strong>O sistema de emails está funcionando perfeitamente!</strong></p>
              </div>

              <div class="alert">
                <h3>⚠️ IMPORTANTE - Conta em Modo de Teste</h3>
                <p>Sua conta Resend está em <strong>modo de teste</strong> e só pode enviar emails para:</p>
                <ul>
                  <li><strong>paperbloom.tm@gmail.com</strong> (email da conta)</li>
                </ul>
                <p>Para enviar para outros emails (como alisson.roosa@gmail.com), você precisa:</p>
                <ol>
                  <li>Verificar um domínio no Resend</li>
                  <li>Ou adicionar alisson.roosa@gmail.com como email de teste</li>
                </ol>
              </div>

              <h3>📋 Opções para Resolver:</h3>
              
              <h4>Opção 1: Adicionar Email de Teste (Mais Rápido)</h4>
              <ol>
                <li>Acesse: <a href="https://resend.com/settings/team">https://resend.com/settings/team</a></li>
                <li>Adicione alisson.roosa@gmail.com como membro da equipe</li>
                <li>Ou use apenas paperbloom.tm@gmail.com para testes</li>
              </ol>

              <h4>Opção 2: Verificar Domínio (Recomendado para Produção)</h4>
              <ol>
                <li>Acesse: <a href="https://resend.com/domains">https://resend.com/domains</a></li>
                <li>Clique em "Add Domain"</li>
                <li>Adicione: <strong>paperbloom.com.br</strong></li>
                <li>Configure os registros DNS:
                  <ul>
                    <li>SPF</li>
                    <li>DKIM</li>
                    <li>DMARC</li>
                  </ul>
                </li>
                <li>Aguarde verificação (até 48h)</li>
                <li>Depois poderá usar: noreply@paperbloom.com.br</li>
              </ol>

              <h4>Opção 3: Usar Apenas para Testes Internos</h4>
              <p>Continue usando <strong>paperbloom.tm@gmail.com</strong> para receber os emails de teste do sistema.</p>

              <h3>🚀 Status Atual:</h3>
              <ul>
                <li>✅ Resend configurado</li>
                <li>✅ API Key válida</li>
                <li>✅ Emails sendo enviados</li>
                <li>⚠️  Limitado ao email da conta</li>
              </ul>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                Paper Bloom Digital<br>
                Sistema de Mensagens Personalizadas<br>
                Data: ${new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ EMAIL ENVIADO COM SUCESSO!\n');
    console.log('📋 Resposta:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n📬 Verifique: paperbloom.tm@gmail.com');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   Sua conta Resend está em modo de teste.');
    console.log('   Só pode enviar para: paperbloom.tm@gmail.com');
    console.log('\n💡 Para enviar para alisson.roosa@gmail.com:');
    console.log('   1. Verifique um domínio no Resend');
    console.log('   2. Ou adicione o email como membro da equipe');
    console.log('\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  }
}

testarEmailCorreto();
