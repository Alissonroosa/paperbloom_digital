/**
 * Script de teste: Verificar se emojis são salvos corretamente
 * Testa o fluxo completo de criação de mensagem com emoji
 * 
 * Executar com: npx ts-node --project tsconfig.node.json testar-emoji-wizard.ts
 */

import { messageService } from './src/services/MessageService';

async function testarEmojiWizard() {
  console.log('🧪 Testando salvamento de emoji do wizard...\n');

  try {
    // Criar mensagem com dados do wizard incluindo emoji
    const messageData = {
      recipientName: 'Maria',
      senderName: 'João',
      messageText: 'Esta é uma mensagem de teste com emoji!',
      imageUrl: 'https://example.com/image.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Mensagem Especial',
      specialDate: new Date('2024-12-25'),
      closingMessage: 'Com carinho',
      signature: 'João',
      galleryImages: ['https://example.com/gallery1.jpg'],
      // Campos de tema do wizard
      backgroundColor: '#FDF6F0',
      theme: 'gradient' as const,
      customEmoji: '❤️',
      musicStartTime: 10,
      showTimeCounter: true,
      timeCounterLabel: 'Juntos há',
    };

    console.log('📝 Criando mensagem com os seguintes dados de tema:');
    console.log(`   - Cor de fundo: ${messageData.backgroundColor}`);
    console.log(`   - Tema: ${messageData.theme}`);
    console.log(`   - Emoji: ${messageData.customEmoji}`);
    console.log(`   - Início da música: ${messageData.musicStartTime}s`);
    console.log(`   - Mostrar contador: ${messageData.showTimeCounter}`);
    console.log(`   - Label do contador: ${messageData.timeCounterLabel}\n`);

    const message = await messageService.create(messageData);

    console.log('✅ Mensagem criada com sucesso!');
    console.log(`   ID: ${message.id}\n`);

    // Buscar mensagem para verificar se os dados foram salvos
    const retrievedMessage = await messageService.findById(message.id);

    if (!retrievedMessage) {
      throw new Error('Mensagem não encontrada após criação');
    }

    console.log('🔍 Verificando dados salvos:');
    console.log(`   ✓ Cor de fundo: ${retrievedMessage.backgroundColor || '❌ NULL'}`);
    console.log(`   ✓ Tema: ${retrievedMessage.theme || '❌ NULL'}`);
    console.log(`   ✓ Emoji: ${retrievedMessage.customEmoji || '❌ NULL'}`);
    console.log(`   ✓ Início da música: ${retrievedMessage.musicStartTime ?? '❌ NULL'}s`);
    console.log(`   ✓ Mostrar contador: ${retrievedMessage.showTimeCounter ?? '❌ NULL'}`);
    console.log(`   ✓ Label do contador: ${retrievedMessage.timeCounterLabel || '❌ NULL'}\n`);

    // Verificar se todos os campos foram salvos corretamente
    const allFieldsSaved = 
      retrievedMessage.backgroundColor === messageData.backgroundColor &&
      retrievedMessage.theme === messageData.theme &&
      retrievedMessage.customEmoji === messageData.customEmoji &&
      retrievedMessage.musicStartTime === messageData.musicStartTime &&
      retrievedMessage.showTimeCounter === messageData.showTimeCounter &&
      retrievedMessage.timeCounterLabel === messageData.timeCounterLabel;

    if (allFieldsSaved) {
      console.log('🎉 SUCESSO! Todos os campos de tema foram salvos corretamente!');
      console.log('✅ Os emojis agora aparecerão na mensagem final.');
    } else {
      console.log('❌ ERRO! Alguns campos não foram salvos corretamente.');
      console.log('\nComparação:');
      console.log('Esperado:', {
        backgroundColor: messageData.backgroundColor,
        theme: messageData.theme,
        customEmoji: messageData.customEmoji,
        musicStartTime: messageData.musicStartTime,
        showTimeCounter: messageData.showTimeCounter,
        timeCounterLabel: messageData.timeCounterLabel,
      });
      console.log('Recebido:', {
        backgroundColor: retrievedMessage.backgroundColor,
        theme: retrievedMessage.theme,
        customEmoji: retrievedMessage.customEmoji,
        musicStartTime: retrievedMessage.musicStartTime,
        showTimeCounter: retrievedMessage.showTimeCounter,
        timeCounterLabel: retrievedMessage.timeCounterLabel,
      });
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

testarEmojiWizard();
