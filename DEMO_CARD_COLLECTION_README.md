# Demo das 12 Cartas - Guia Completo

## 📋 Visão Geral

Criamos uma experiência demo completa para as 12 cartas, similar ao `/demo/message`, que permite visualizar o produto final de forma cinematográfica.

## 🎯 Páginas Criadas

### 1. `/demo/card-collection` - Experiência Cinematográfica (PRODUTO FINAL)
**Arquivo:** `src/app/(fullscreen)/demo/card-collection/page.tsx`

**Esta é a demonstração do produto final que os clientes receberão!**

Página fullscreen que mostra a experiência final das 12 cartas com dados pré-carregados:

**Como Acessar:**
```
http://localhost:3000/demo/card-collection
```

**O que acontece:**
- Carrega automaticamente dados demo padrão (12 cartas prontas)
- Mostra a experiência cinematográfica completa
- Não requer criação de coleção no banco
- Perfeito para mostrar para clientes/investidores

**Sequência da Experiência:**
1. **Intro 1** - "[Nome do Remetente] preparou 12 cartas para momentos especiais"
2. **Intro 2** - "Cada carta serve para um momento específico. Abra quando estiver precisando..."
3. **Bloco 1** - "Para Momentos Difíceis" (4 cartas: 1-4)
   - Quando estiver triste
   - Quando precisar de coragem
   - Quando se sentir sozinho(a)
   - Quando conquistar algo
4. **Bloco 2** - "Para Momentos Felizes" (4 cartas: 5-8)
   - Quando estiver feliz
   - Quando quiser sorrir
   - Quando precisar rir
   - Quando sentir saudade
5. **Bloco 3** - "Para Momentos de Reflexão" (4 cartas: 9-12)
   - Quando precisar de paz
   - Quando quiser agradecer
   - Quando sonhar com o futuro
   - Quando quiser lembrar de mim
6. **Botão "Ver Cartas"** - Aparece após o 3º bloco
7. **Main View** - Página final onde as cartas podem ser abertas:
   - Cartas fechadas: Mostram ícone de cadeado e título
   - Cartas abertas: Mostram preview da imagem e marcação "Aberta"
   - Cada carta só pode ser aberta UMA VEZ (salvo no localStorage)
   - Ao clicar, abre modal com imagem, mensagem completa e aviso se é primeira abertura

**Recursos:**
- ✅ **Cores da identidade visual** (Primary: #E6C2C2, Secondary: #D4A5A5, Background: #FFFAFA)
- ✅ Sistema de "abrir apenas uma vez" por carta
- ✅ Indicador visual de cartas abertas vs fechadas
- ✅ Música de fundo (YouTube)
- ✅ Controle de volume
- ✅ Modal de detalhes da carta
- ✅ Persistência no localStorage
- ✅ Emojis caindo em todas as telas (❤️ por padrão)
- ✅ Temas personalizados
- ✅ Animações suaves com Framer Motion
- ✅ Responsivo (mobile e desktop)
- ✅ Experiência que desperta curiosidade
- ✅ **CTA final: "Criar uma mensagem igual a essa"**

### 2. `/editor/demo/card-collection` - Editor Demo (OPCIONAL)
**Arquivo:** `src/app/(marketing)/editor/demo/card-collection/page.tsx`

**Use esta página apenas se quiser personalizar a demo antes de visualizar.**

Página de edição que permite criar uma coleção demo customizada:

**Como Acessar:**
```
http://localhost:3000/editor/demo/card-collection
```

**O que acontece:**
- Cria uma coleção no banco de dados
- Permite editar todas as 12 cartas
- Salva dados customizados no localStorage
- Redireciona para `/demo/card-collection` ao finalizar

**Funcionalidades:**
- Cria automaticamente uma coleção demo ao carregar
- Usa o `FiveStepCardCollectionEditor` completo
- Permite editar todas as 12 cartas
- Salva dados no localStorage
- Redireciona para `/demo/card-collection` ao finalizar

## 🚀 Como Usar

### ⭐ Opção 1: Ver Demo do Produto Final (RECOMENDADO)

**Esta é a forma mais rápida de ver o produto final!**

1. Acesse diretamente: `http://localhost:3000/demo/card-collection`
2. A página carregará automaticamente com 12 cartas prontas
3. Clique em "Abrir Cartas ♥" para iniciar a experiência
4. Navegue pelas cartas e veja a experiência completa

**Não precisa criar nada no banco de dados!**

### Opção 2: Criar Sua Própria Demo Personalizada (Opcional)

1. Acesse: `http://localhost:3000/editor/demo/card-collection`
2. Preencha as 12 cartas com suas mensagens e fotos
3. Personalize cores, temas e música
4. Clique em "Visualizar Demo"
5. Será redirecionado para a experiência cinematográfica

## 📊 Estrutura de Dados

### DemoData Interface

```typescript
interface DemoData {
    introText1: string;              // Texto da primeira intro
    introText2: string;              // Texto da segunda intro
    collectionTitle: string;         // Título da coleção
    recipientName: string;           // Nome do destinatário
    cards: CardData[];               // Array com 12 cartas
    youtubeVideoId: string;          // ID do vídeo do YouTube
    backgroundColor?: string;        // Cor de fundo
    theme?: string;                  // Tema (gradient, bright, etc.)
    customEmoji?: string | null;    // Emoji personalizado
    showTimeCounter?: boolean;       // Mostrar contador de tempo
    timeCounterLabel?: string;       // Label do contador
    specialDateISO?: string;         // Data especial (ISO)
}
```

### CardData Interface

```typescript
interface CardData {
    id: string;           // ID único da carta
    order: number;        // Ordem (1-12)
    title: string;        // Título da carta (ex: "Quando estiver triste")
    message: string;      // Mensagem da carta
    imageUrl: string;     // URL da imagem
    momentLabel: string;  // Label do momento (ex: "Para Momentos Difíceis")
    isOpened: boolean;    // Se a carta já foi aberta
}
```

## 🔒 Sistema de "Abrir Apenas Uma Vez"

As cartas são salvas no localStorage quando abertas pela primeira vez:

```javascript
// Salvar carta aberta
localStorage.setItem('paperbloom-opened-cards', JSON.stringify(['1', '3', '5']));

// Limpar todas as cartas abertas (resetar demo)
localStorage.removeItem('paperbloom-opened-cards');
```

### Estados das Cartas

1. **Fechada (Não Aberta):**
   - Ícone de cadeado
   - Fundo branco/cinza claro
   - Título visível
   - Hover effect

2. **Aberta:**
   - Preview da imagem
   - Ícone de cadeado aberto
   - Marcação "Aberta"
   - Opacidade reduzida

3. **Visualizando:**
   - Modal fullscreen
   - Imagem grande
   - Mensagem completa
   - Aviso se é primeira abertura

## 🎨 Personalização

### Temas Disponíveis
- `gradient` - Gradiente suave (padrão)
- `bright` - Cores vibrantes
- `matte` - Cores foscas
- `pastel` - Cores pastéis
- `neon` - Cores neon
- `vintage` - Estilo vintage

### Momentos Padrão (3 Blocos de 4 Cartas)

**Bloco 1: Para Momentos Difíceis (Cartas 1-4)**
1. "Quando estiver triste"
2. "Quando precisar de coragem"
3. "Quando se sentir sozinho(a)"
4. "Quando conquistar algo"

**Bloco 2: Para Momentos Felizes (Cartas 5-8)**
5. "Quando estiver feliz"
6. "Quando quiser sorrir"
7. "Quando precisar rir"
8. "Quando sentir saudade"

**Bloco 3: Para Momentos de Reflexão (Cartas 9-12)**
9. "Quando precisar de paz"
10. "Quando quiser agradecer"
11. "Quando sonhar com o futuro"
12. "Quando quiser lembrar de mim"

## 🔧 Integração com LocalStorage

Os dados são salvos em:
```javascript
localStorage.setItem('paperbloom-card-collection-demo-data', JSON.stringify(demoData));
```

Para limpar:
```javascript
localStorage.removeItem('paperbloom-card-collection-demo-data');
```

## 🎵 Música de Fundo

A página usa a YouTube IFrame API para tocar música:
- Música padrão: "Perfect" - Ed Sheeran
- Volume inicial: 0 (fade in até 60%)
- Controles: Play/Pause no canto superior direito

## 📱 Responsividade

A experiência é otimizada para:
- ✅ Desktop (1920x1080+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

## 🧪 Testando

### Teste Rápido
```bash
npm run dev
# Acesse: http://localhost:3000/demo/card-collection
```

### Teste Completo
1. Acesse `/editor/demo/card-collection`
2. Preencha todas as 12 cartas
3. Adicione fotos (serão salvas no R2)
4. Escolha uma música do YouTube
5. Personalize cores e tema
6. Clique em "Visualizar Demo"
7. Navegue por todas as cartas
8. Teste os controles de música
9. Teste o botão de reiniciar

## 🎯 Próximos Passos

Para integrar com o fluxo real de produção:

1. **Conectar com Stripe:**
   - Após pagamento aprovado, redirecionar para `/demo/card-collection`
   - Passar o `collectionId` via query param

2. **Email de Entrega:**
   - Enviar link único: `https://paperbloom.com/c/[slug]`
   - Link abre a experiência cinematográfica

3. **Página de Visualização:**
   - Criar `/c/[slug]/page.tsx` que carrega dados do banco
   - Usar o mesmo componente da demo

## 📝 Notas Técnicas

- **Framer Motion:** Todas as animações usam Framer Motion
- **Next.js Image:** Otimização automática de imagens
- **YouTube API:** Carregamento assíncrono da API
- **Themes:** Sistema de temas do `theme-utils.ts`
- **TypeScript:** Totalmente tipado

## 🐛 Troubleshooting

### Música não toca
- Verifique se o YouTube Video ID está correto
- Alguns vídeos têm restrições de embed
- Teste com: `nSDgHBxUbVQ` (Ed Sheeran - Perfect)

### Imagens não carregam
- Verifique URLs das imagens
- Certifique-se que são URLs públicas
- Use Unsplash para testes

### Dados não salvam
- Verifique o console do navegador
- Limpe o localStorage e tente novamente
- Verifique se a API está rodando

## ✅ Checklist de Validação

- [ ] Intro sequence funciona
- [ ] Música toca e controles funcionam
- [ ] Todas as 12 cartas aparecem no grid
- [ ] Navegação entre cartas funciona
- [ ] Imagens carregam corretamente
- [ ] Animações são suaves
- [ ] Responsivo em mobile
- [ ] Botão de reiniciar funciona
- [ ] Temas aplicam corretamente
- [ ] Contador de tempo funciona (se habilitado)

---

**Criado em:** 06/01/2025
**Versão:** 1.0.0
