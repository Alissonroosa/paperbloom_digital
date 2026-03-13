# CardCollectionPreview

Componente de visualização em tempo real para coleções de 12 cartas.

## Visão Geral

O `CardCollectionPreview` exibe uma prévia interativa da coleção de cartas, permitindo ao usuário visualizar como o produto final ficará em diferentes dispositivos (desktop e mobile).

## Características

### Modos de Visualização

1. **Desktop (MacBook Pro Mockup)**
   - Mockup realista de MacBook Pro com notch
   - Scroll suave dentro da tela
   - Visualização em tamanho real

2. **Mobile (iPhone 16 Pro Max Mockup)**
   - Mockup realista de iPhone com Dynamic Island
   - Escala ajustada para caber no preview
   - Scroll touch-friendly

### Visualizações de Conteúdo

#### Grid de Cartas (Padrão)
- Mostra todas as 12 cartas em um grid responsivo
- Mensagem de introdução no topo (se configurada)
- Informações De/Para
- Cards clicáveis para ver detalhes
- Indicadores visuais de foto (📷) e música (🎵)

#### Carta Individual
- Visualização completa de uma carta específica
- Título destacado
- Imagem (se houver)
- Mensagem completa
- Player do YouTube (se houver música)
- Botão para voltar ao grid

### Responsividade

#### Desktop (lg+)
- Preview sticky no lado direito
- Sempre visível durante a edição
- Toggle entre Desktop/Mobile no topo

#### Mobile
- Botão flutuante no canto inferior direito
- Modal em tela cheia ao clicar
- Toggle entre Desktop/Mobile no header do modal

## Props

```typescript
interface CardCollectionPreviewProps {
  cards: Card[];                          // Array de 12 cartas
  introMessage?: string | null;           // Mensagem de introdução
  senderName?: string;                    // Nome do remetente
  recipientName?: string;                 // Nome do destinatário
  viewMode: 'desktop' | 'mobile';         // Modo de visualização atual
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;  // Callback para mudar modo
  className?: string;                     // Classes CSS adicionais
}
```

## Uso

### Integração com FiveStepCardCollectionEditor

```tsx
import { CardCollectionPreview } from './CardCollectionPreview';

function Editor() {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const { cards, collection } = useCardCollectionEditorState();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Editor Content */}
      <main className="lg:col-span-7">
        {/* Editor steps */}
      </main>

      {/* Preview Panel */}
      <aside className="lg:col-span-5">
        <CardCollectionPreview
          cards={cards}
          introMessage={collection?.introMessage}
          senderName={collection?.senderName}
          recipientName={collection?.recipientName}
          viewMode={previewMode}
          onViewModeChange={setPreviewMode}
        />
      </aside>
    </div>
  );
}
```

## Atualização em Tempo Real

O componente atualiza automaticamente quando:
- Cartas são editadas
- Mensagem de introdução é alterada
- Nomes de remetente/destinatário são modificados
- Fotos ou músicas são adicionadas/removidas

Debounce de 100ms para evitar atualizações excessivas.

## Interatividade

### Grid de Cartas
- Clique em qualquer carta para ver detalhes completos
- Hover effect com scale e shadow
- Indicadores visuais de conteúdo (foto/música)

### Carta Individual
- Botão "Voltar" para retornar ao grid
- Scroll suave para conteúdo longo
- Player do YouTube incorporado
- Imagens responsivas

## Mockups de Dispositivos

### MacBook Pro
- Notch realista
- Bordas e sombras precisas
- Base e suporte do teclado
- Scroll bar customizada

### iPhone 16 Pro Max
- Dynamic Island
- Bordas arredondadas
- Botões laterais
- Proporção 430:932 (aspect ratio real)
- Scroll sem scrollbar visível

## Acessibilidade

- Labels ARIA para botões de toggle
- Estados aria-pressed para indicar modo ativo
- Navegação por teclado
- Contraste adequado de cores
- Touch targets mínimos de 44x44px

## Estilos e Temas

### Cores
- Gradiente de fundo: purple-50 → pink-50 → blue-50
- Cards brancos com sombras
- Acentos em purple-600
- Texto em gray-700/900

### Animações
- Transições suaves (300ms)
- Hover effects nos cards
- Scale transform no hover
- Smooth scroll

## Performance

- Lazy rendering de conteúdo
- Debounce de atualizações (100ms)
- Memoização de componentes pesados
- Cleanup de timeouts

## Limitações Conhecidas

1. **YouTube Embeds**: Requer conexão com internet para carregar
2. **Imagens**: Devem estar hospedadas e acessíveis
3. **Scroll Mobile**: Pode ter comportamento diferente em dispositivos reais
4. **Scale no iPhone**: Conteúdo é reduzido para 45% para caber no mockup

## Melhorias Futuras

- [ ] Suporte para temas personalizados
- [ ] Animações de transição entre cartas
- [ ] Modo de apresentação (slideshow)
- [ ] Exportar preview como imagem
- [ ] Compartilhar preview via link
- [ ] Modo escuro
- [ ] Mais opções de dispositivos (iPad, Android)

## Dependências

- `lucide-react` - Ícones (Monitor, Smartphone, Eye)
- `@/components/ui/Button` - Botões
- `@/types/card` - Tipos TypeScript
- `@/lib/utils` - Utilitários (cn)

## Notas de Implementação

- Usa `position: sticky` para manter preview visível no desktop
- Modal fullscreen no mobile para melhor experiência
- Extração de YouTube ID via regex
- Transform scale para simular tela mobile
- CSS-in-JS para scrollbar customizada
