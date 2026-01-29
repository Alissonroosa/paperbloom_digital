# Teste Completo - Editor 12 Cartas

## ✅ Implementação Completa

Todos os componentes, páginas e integrações estão prontos para teste.

## 🧪 Roteiro de Teste End-to-End

### Pré-requisitos
```bash
# 1. Verificar variáveis de ambiente
# .env.local deve ter:
DATABASE_URL=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
RESEND_API_KEY=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# 2. Verificar database schema
# Garantir que card_collections tem:
# - youtube_video_id (VARCHAR, nullable)
# - contact_name (VARCHAR, nullable)
```

### Passo 1: Iniciar Ambiente
```bash
# Terminal 1: Servidor Next.js
npm run dev

# Terminal 2: Stripe CLI (webhook)
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### Passo 2: Criar Coleção
1. Acessar: `http://localhost:3000/editor/12-cartas`
2. Verificar:
   - ✅ Página carrega sem erros
   - ✅ Coleção é criada automaticamente
   - ✅ Editor aparece com 5 steps

### Passo 3: Editar Informações Básicas (Step 1)
1. Preencher:
   - Nome do Remetente: "João"
   - Nome do Destinatário: "Maria"
   - Email para contato: "seu-email@teste.com"
2. Clicar "Próximo"
3. Verificar:
   - ✅ Dados salvos
   - ✅ Avança para Step 2

### Passo 4: Editar Cartas (Step 2)
1. Testar navegação entre momentos:
   - "Para Momentos Difíceis" (cartas 1-4)
   - "Para Momentos Felizes" (cartas 5-8)
   - "Para Momentos de Reflexão" (cartas 9-12)
2. Editar pelo menos 2 cartas:
   - Clicar em uma carta
   - Editar título e mensagem
   - Salvar
3. Verificar:
   - ✅ Modal abre e fecha
   - ✅ Alterações são salvas
   - ✅ Preview atualiza

### Passo 5: Adicionar Fotos (Step 3)
1. Clicar em "Adicionar Foto" em pelo menos 2 cartas
2. Fazer upload de imagens
3. Verificar:
   - ✅ Upload funciona
   - ✅ Preview mostra imagem
   - ✅ Imagem salva no R2

### Passo 6: Adicionar Música (Step 4)
1. Clicar em "Adicionar Música"
2. Colar URL do YouTube (ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
3. Verificar:
   - ✅ URL é validada
   - ✅ Título do vídeo aparece
   - ✅ Preview funciona

### Passo 7: Preview Final (Step 5)
1. Verificar preview mostra:
   - ✅ Todas as 12 cartas
   - ✅ Fotos adicionadas
   - ✅ Mensagens editadas
   - ✅ Player de música
2. Clicar em "Finalizar e Pagar"

### Passo 8: Checkout
1. Verificar:
   - ✅ Redirecionado para Stripe Checkout
   - ✅ Produto: "Coleção de 12 Cartas"
   - ✅ Preço correto
2. Usar cartão de teste:
   - Número: 4242 4242 4242 4242
   - Data: qualquer futura
   - CVC: qualquer 3 dígitos
3. Completar pagamento

### Passo 9: Webhook Processing
1. Verificar no terminal do Stripe CLI:
   - ✅ Evento `checkout.session.completed` recebido
   - ✅ Webhook processado com sucesso
2. Verificar logs do servidor:
   - ✅ Status atualizado para 'paid'
   - ✅ Slug gerado (formato: "joao-para-maria-abc123")
   - ✅ QR Code gerado
   - ✅ Email enviado

### Passo 10: Verificar Email
1. Checar email em "seu-email@teste.com"
2. Verificar:
   - ✅ Email recebido
   - ✅ Contém link para `/c/[slug]`
   - ✅ Contém QR Code
   - ✅ Instruções claras

### Passo 11: Acessar Página Pública
1. Clicar no link do email ou acessar: `http://localhost:3000/c/[slug]`
2. Verificar experiência completa:

#### Intro Sequence
- ✅ Intro 1: "João preparou 12 cartas para momentos especiais"
- ✅ Intro 2: "Cada carta serve para um momento específico..."
- ✅ Transições suaves

#### Blocos de Cartas
- ✅ Bloco 1: "Para Momentos Difíceis" (cartas 1-4)
- ✅ Bloco 2: "Para Momentos Felizes" (cartas 5-8)
- ✅ Bloco 3: "Para Momentos de Reflexão" (cartas 9-12)
- ✅ Cada bloco mostra 4 segundos
- ✅ Botão "Ver Cartas" aparece após bloco 3

#### Main View
- ✅ Todas as 12 cartas visíveis
- ✅ Cartas não abertas mostram cadeado
- ✅ Música começa a tocar automaticamente
- ✅ Controle de música funciona
- ✅ Falling emojis ❤️ aparecem

#### Abrir Cartas
1. Clicar em uma carta não aberta
2. Verificar:
   - ✅ Modal abre com imagem
   - ✅ Título e mensagem corretos
   - ✅ Aviso "primeira vez que abre"
   - ✅ Botão "Fechar"
3. Fechar modal
4. Verificar:
   - ✅ Carta marcada como aberta
   - ✅ Preview da imagem aparece
   - ✅ Ícone de cadeado aberto
5. Clicar novamente na mesma carta
6. Verificar:
   - ✅ Abre normalmente
   - ✅ Sem aviso de "primeira vez"

#### Sistema "Abrir Apenas Uma Vez"
1. Abrir 3-4 cartas diferentes
2. Recarregar a página (F5)
3. Verificar:
   - ✅ Cartas abertas continuam marcadas
   - ✅ Cartas não abertas continuam trancadas
   - ✅ localStorage funcionando

#### Cores e Design
- ✅ Background: #FFFAFA
- ✅ Accent: #E6C2C2
- ✅ Secondary: #D4A5A5
- ✅ Falling emojis: ❤️
- ✅ Design responsivo (testar mobile)

### Passo 12: Teste em Dispositivos
1. Desktop (Chrome, Firefox, Safari)
2. Mobile (iOS Safari, Android Chrome)
3. Tablet
4. Verificar:
   - ✅ Layout responsivo
   - ✅ Música funciona
   - ✅ Modais funcionam
   - ✅ Touch gestures funcionam

## 🐛 Problemas Conhecidos

### TypeScript Language Server
- ⚠️ Pode mostrar erro de import em `page.tsx`
- **Causa:** Cache do language server com paths especiais `[slug]`
- **Solução:** Ignorar - o código compila e funciona corretamente
- **Verificação:** `npm run build` deve passar sem erros

### Database Schema
- ⚠️ Verificar se colunas `youtube_video_id` e `contact_name` existem
- **Se não existirem:**
```sql
ALTER TABLE card_collections 
ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
```

## ✅ Checklist de Validação

### Funcionalidades Core
- [ ] Criar coleção automaticamente
- [ ] Editar informações básicas
- [ ] Editar cartas individuais
- [ ] Upload de fotos
- [ ] Adicionar música do YouTube
- [ ] Preview funciona
- [ ] Checkout Stripe
- [ ] Webhook processa pagamento
- [ ] Slug gerado corretamente
- [ ] QR Code gerado
- [ ] Email enviado

### Página Pública
- [ ] Intro sequence completa
- [ ] 3 blocos de cartas sequenciais
- [ ] Botão "Ver Cartas"
- [ ] Main view com 12 cartas
- [ ] Sistema de "abrir apenas uma vez"
- [ ] Modal de visualização
- [ ] Música funciona
- [ ] Controle de música
- [ ] Falling emojis
- [ ] Cores corretas
- [ ] Responsivo

### Integrações
- [ ] Database queries funcionam
- [ ] R2 upload funciona
- [ ] Stripe checkout funciona
- [ ] Webhook funciona
- [ ] Email enviado
- [ ] QR Code acessível

## 📝 Notas de Teste

### Dados de Teste Sugeridos

**Remetente:** João Silva
**Destinatário:** Maria Santos
**Email:** seu-email@teste.com

**Cartas para editar:**
1. Carta 1: "Quando você estiver triste" - "Lembre-se que eu sempre estarei aqui..."
2. Carta 5: "Quando você estiver feliz" - "Sua alegria ilumina meu dia..."
3. Carta 9: "Quando precisar de paz" - "Respire fundo e saiba que tudo vai ficar bem..."

**Música:** https://www.youtube.com/watch?v=dQw4w9WgXcQ

**Fotos:** Usar imagens de teste (paisagens, abstratas, etc.)

## 🎯 Critérios de Sucesso

✅ **Teste passa se:**
1. Consegue criar e editar coleção completa
2. Checkout funciona
3. Webhook processa corretamente
4. Email é enviado
5. Página pública carrega e funciona
6. Sistema de "abrir apenas uma vez" funciona
7. Música toca
8. Design está correto

❌ **Teste falha se:**
1. Erros no console
2. Webhook não processa
3. Email não enviado
4. Página pública não carrega
5. Cartas podem ser abertas múltiplas vezes
6. Música não funciona
7. Layout quebrado

## 🚀 Após Teste Bem-Sucedido

1. Commit das alterações
2. Deploy para staging
3. Teste em staging
4. Deploy para produção
5. Monitorar logs

---

**Criado:** 10/01/2025
**Status:** Pronto para teste
**Duração estimada:** 30-45 minutos

