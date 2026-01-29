require('dotenv').config({ path: '.env.local' });
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'messages.db');
const db = new sqlite3.Database(dbPath);

console.log('\n🔧 Processar Mensagem Pendente\n');
console.log('═══════════════════════════════════════════════════════\n');

// Função para processar uma mensagem pendente
async function processarMensagem(messageId) {
  return new Promise((resolve, reject) => {
    // Primeiro, buscar a mensagem
    db.get(
      'SELECT * FROM messages WHERE id = ?',
      [messageId],
      async (err, message) => {
        if (err) {
          reject(err);
          return;
        }

        if (!message) {
          reject(new Error('Mensagem não encontrada'));
          return;
        }

        console.log(`📝 Mensagem encontrada: ${message.id}`);
        console.log(`   Para: ${message.recipientName}`);
        console.log(`   De: ${message.senderName}`);
        console.log(`   Status atual: ${message.status}\n`);

        if (message.status === 'paid') {
          console.log('⚠️  Esta mensagem já foi processada!\n');
          resolve(message);
          return;
        }

        // Simular o webhook
        console.log('🔄 Simulando webhook do Stripe...\n');

        try {
          const response = await fetch('http://localhost:3000/api/checkout/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'stripe-signature': 'simulated_signature_for_testing'
            },
            body: JSON.stringify({
              type: 'checkout.session.completed',
              data: {
                object: {
                  id: 'cs_test_simulated',
                  metadata: {
                    messageId: message.id,
                    contactEmail: 'alisson.roosa@gmail.com',
                    contactName: message.senderName
                  },
                  customer_details: {
                    email: 'alisson.roosa@gmail.com'
                  }
                }
              }
            })
          });

          if (response.ok) {
            console.log('✅ Webhook processado com sucesso!\n');

            // Buscar mensagem atualizada
            db.get(
              'SELECT * FROM messages WHERE id = ?',
              [messageId],
              (err, updatedMessage) => {
                if (err) {
                  reject(err);
                  return;
                }

                console.log('📊 Status atualizado:');
                console.log(`   Status: ${updatedMessage.status}`);
                console.log(`   Slug: ${updatedMessage.slug}`);
                console.log(`   QR Code: ${updatedMessage.qrCodeUrl}\n`);

                console.log('🔗 Links:');
                console.log(`   Mensagem: http://localhost:3000${updatedMessage.slug}`);
                console.log(`   Delivery: http://localhost:3000/delivery/${updatedMessage.id}\n`);

                resolve(updatedMessage);
              }
            );
          } else {
            const error = await response.text();
            reject(new Error(`Webhook falhou: ${error}`));
          }
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

// Função para listar mensagens pendentes
function listarMensagensPendentes() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, recipientName, senderName, status, createdAt FROM messages WHERE status = ? ORDER BY createdAt DESC LIMIT 10',
      ['pending'],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
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
      // Listar mensagens pendentes
      console.log('📋 Mensagens Pendentes:\n');
      const pendentes = await listarMensagensPendentes();

      if (pendentes.length === 0) {
        console.log('   Nenhuma mensagem pendente encontrada.\n');
      } else {
        pendentes.forEach((msg, index) => {
          console.log(`${index + 1}. ${msg.id}`);
          console.log(`   Para: ${msg.recipientName}`);
          console.log(`   De: ${msg.senderName}`);
          console.log(`   Criada em: ${new Date(msg.createdAt).toLocaleString('pt-BR')}\n`);
        });

        console.log('💡 Para processar uma mensagem específica:');
        console.log(`   node processar-mensagem-pendente.js ${pendentes[0].id}\n`);

        // Perguntar se quer processar a mais recente
        console.log('🔄 Processando a mensagem mais recente...\n');
        await processarMensagem(pendentes[0].id);
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Concluído!\n');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    db.close();
  }
})();
