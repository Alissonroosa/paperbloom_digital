# Design Document - Editor Agrupado de 12 Cartas

## Overview

Este documento descreve o design da melhoria do editor de 12 cartas, transformando a experiência atual de 12 etapas sequenciais em 3 etapas agrupadas por momentos temáticos. A solução reduz significativamente o número de cliques necessários (de 12 para 3) e torna a experiência de edição mais fluida e intuitiva.

A abordagem principal é substituir o wizard step-by-step atual por uma interface de visualização em grupo, onde o usuário vê todas as cartas de um momento temático simultaneamente e pode editar cada uma através de modais dedicados.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Editor Page (Next.js)                     │
│  /editor/12-cartas/page.tsx                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           CardCollectionEditorProvider (Context)             │
│  - Gerencia estado das 12 cartas                            │
│  - Controla momento temático atual                          │
│  - Auto-save para localStorage                              │
│  - Sincronização com API                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          GroupedCardCollectionEditor (Component)             │
│  - Exibe navegação entre 3 momentos                         │
│  - Renderiza cartas do momento atual                        │
│  - Indicadores de progresso                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  MomentNavigation│    │  CardGridView    │
│  - 3 botões      │    │  - Grid de cartas│
│  - Indicador     │    │  - 4 cards/grupo │
│    ativo         │    │  - Botões ação   │
└──────────────────┘    └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │EditModal │  │PhotoModal│  │MusicModal│
            │  - Texto │  │  - Upload│  │  - YouTube│
            │  - Save  │  │  - Preview│  │  - Preview│
            └──────────┘  └──────────┘  └──────────┘
```

### Component Hierarchy

```
CardCollectionEditorPage
└── CardCollectionEditorProvider
    └── GroupedCardCollectionEditor
        ├── Header (com progresso geral)
        ├── MomentNavigation
        │   ├── MomentButton (x3)
        │   └── ProgressIndicator
        ├── CardGridView
        │   └── CardPreviewCard (x4 por momento)
        │       ├── CardTitle
        │       ├── CardMessage (preview)
        │       ├── MediaIndicators (foto/música)
        │       └── ActionButtons
        │           ├── EditMessageButton
        │           ├── AddPhotoButton
        │           └── AddMusicButton
        ├── EditMessageModal
        ├── PhotoUploadModal
        ├── MusicSelectionModal
        └── Footer (navegação Anterior/Próximo/Finalizar)
```

## Components and Interfaces

### 1. GroupedCardCollectionEditor

Componente principal que substitui o `CardCollectionEditor` atual.

**Props:**
```typescript
interface GroupedCardCollectionEditorProps {
  onFinalize: () => Promise<void>;
  isProcessing?: boolean;
}
```

**State:**
```typescript
interface EditorState {
  currentMomentIndex: number; // 0, 1, ou 2
  activeModal: 'message' | 'photo' | 'music' | null;
  activeCardId: string | null;
}
```

**Responsibilities:**
- Gerenciar navegação entre os 3 momentos temáticos
- Controlar abertura/fechamento de modais
- Exibir indicadores de progresso
- Coordenar salvamento automático

### 2. MomentNavigation

Componente de navegação entre momentos temáticos.

**Props:**
```typescript
interface MomentNavigationProps {
  moments: ThematicMoment[];
  currentMomentIndex: number;
  onMomentChange: (index: number) => void;
  completionStatus: Record<number, MomentCompletionStatus>;
}

interface ThematicMoment {
  index: number;
  title: string;
  description: string;
  cardIndices: number[]; // [0,1,2,3] ou [4,5,6,7] ou [8,9,10,11]
}

interface MomentCompletionStatus {
  totalCards: number;
  completedCards: number;
  percentage: number;
}
```

**Responsibilities:**
- Renderizar 3 botões de navegação
- Indicar momento ativo visualmente
- Mostrar progresso de cada momento
- Permitir navegação direta entre momentos

### 3. CardGridView

Componente que exibe as cartas do momento atual em grid.

**Props:**
```typescript
interface CardGridViewProps {
  cards: Card[];
  onEditMessage: (cardId: string) => void;
  onEditPhoto: (cardId: string) => void;
  onEditMusic: (cardId: string) => void;
}
```

**Layout:**
- Grid responsivo: 1 coluna (mobile), 2 colunas (tablet), 2 colunas (desktop)
- Cada card mostra: título, preview da mensagem, indicadores de mídia, 3 botões de ação

**Responsibilities:**
- Renderizar 4 cartas do momento atual
- Exibir preview de conteúdo
- Mostrar indicadores visuais (foto/música presente)
- Disparar abertura de modais

### 4. CardPreviewCard

Componente individual de preview de carta no grid.

**Props:**
```typescript
interface CardPreviewCardProps {
  card: Card;
  onEditMessage: () => void;
  onEditPhoto: () => void;
  onEditMusic: () => void;
}
```

**Visual Elements:**
- Título da carta (destaque)
- Preview da mensagem (primeiras 100 caracteres)
- Badges indicando foto/música presente
- 3 botões de ação claramente visíveis

**Responsibilities:**
- Exibir preview da carta
- Mostrar status de completude
- Adaptar labels dos botões (Adicionar vs Editar)

### 5. EditMessageModal

Modal para edição de texto da carta.

**Props:**
```typescript
interface EditMessageModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, data: { title: string; messageText: string }) => Promise<void>;
}
```

**Features:**
- Campo de título (200 caracteres max)
- Textarea de mensagem (500 caracteres max)
- Contador de caracteres em tempo real
- Botões: Salvar, Cancelar
- Confirmação ao fechar com alterações não salvas

**Responsibilities:**
- Validar entrada do usuário
- Salvar alterações via context
- Prevenir perda de dados

### 6. PhotoUploadModal

Modal para upload e edição de foto.

**Props:**
```typescript
interface PhotoUploadModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, imageUrl: string) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
}
```

**Features:**
- Área de drag-and-drop
- Preview da foto atual (se existir)
- Validação de formato (JPEG, PNG, WebP)
- Validação de tamanho (max 5MB)
- Botões: Salvar, Remover Foto, Cancelar
- Indicador de progresso de upload

**Responsibilities:**
- Gerenciar upload de imagem
- Validar arquivo antes do upload
- Exibir preview
- Permitir remoção de foto

### 7. MusicSelectionModal

Modal para seleção de música do YouTube.

**Props:**
```typescript
interface MusicSelectionModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, youtubeUrl: string) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
}
```

**Features:**
- Input para URL do YouTube
- Validação de URL em tempo real
- Preview do vídeo (iframe embed)
- Extração automática de video ID
- Botões: Salvar, Remover Música, Cancelar

**Responsibilities:**
- Validar URL do YouTube
- Extrair video ID
- Exibir preview do vídeo
- Permitir remoção de música

## Data Models

### ThematicMoment

```typescript
interface ThematicMoment {
  index: number;
  title: string;
  description: string;
  cardIndices: number[];
}

const THEMATIC_MOMENTS: ThematicMoment[] = [
  {
    index: 0,
    title: 'Momentos Emocionais e de Apoio',
    description: 'Cartas para momentos difíceis e de vulnerabilidade',
    cardIndices: [0, 1, 2, 3], // Cartas 1-4
  },
  {
    index: 1,
    title: 'Momentos de Celebração e Romance',
    description: 'Cartas para celebrar amor e conquistas',
    cardIndices: [4, 5, 6, 7], // Cartas 5-8
  },
  {
    index: 2,
    title: 'Momentos para Resolver Conflitos e Rir',
    description: 'Cartas para superar desafios e relaxar',
    cardIndices: [8, 9, 10, 11], // Cartas 9-12
  },
];
```

### Extended Context State

O `CardCollectionEditorContext` existente será estendido com:

```typescript
interface ExtendedEditorContextType extends CardCollectionEditorContextType {
  // Novo estado para momentos
  currentMomentIndex: number;
  setCurrentMomentIndex: (index: number) => void;
  
  // Helpers para momentos
  getCurrentMomentCards: () => Card[];
  getMomentCompletionStatus: (momentIndex: number) => MomentCompletionStatus;
  getAllMomentsCompletionStatus: () => Record<number, MomentCompletionStatus>;
  
  // Navegação entre momentos
  nextMoment: () => void;
  previousMoment: () => void;
  goToMoment: (index: number) => void;
  isFirstMoment: boolean;
  isLastMoment: boolean;
}
```

## Correctness Properties

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas de um sistema - essencialmente, uma declaração formal sobre o que o sistema deve fazer. As propriedades servem como ponte entre especificações legíveis por humanos e garantias de correção verificáveis por máquina.*

### Property 1: Agrupamento Correto de Cartas
*Para qualquer* conjunto de 12 cartas, o sistema deve agrupá-las em exatamente 3 momentos temáticos, com cada momento contendo exatamente 4 cartas, e todas as 12 cartas devem estar presentes nos grupos.

**Validates: Requirements 1.1, 1.6**

### Property 2: Labels dos Momentos Temáticos
*Para qualquer* estado do editor, os 3 momentos devem ter os labels corretos: "Momentos Emocionais e de Apoio" (momento 0), "Momentos de Celebração e Romance" (momento 1), e "Momentos para Resolver Conflitos e Rir" (momento 2).

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 3: Visualização Simultânea de Cartas
*Para qualquer* momento temático ativo, todas as 4 cartas daquele momento devem ser exibidas simultaneamente na interface.

**Validates: Requirements 2.1**

### Property 4: Exibição de Conteúdo das Cartas
*Para qualquer* carta exibida no grid, o sistema deve mostrar tanto o título quanto o conteúdo/mensagem da carta.

**Validates: Requirements 2.2, 2.3**

### Property 5: Indicadores de Mídia
*Para qualquer* carta que possui foto, o sistema deve exibir um indicador visual de foto; e para qualquer carta que possui música, o sistema deve exibir um indicador visual de música.

**Validates: Requirements 2.4, 2.5**

### Property 6: Botões de Ação Presentes
*Para qualquer* carta exibida, o sistema deve mostrar exatamente 3 botões de ação com os labels "Editar Mensagem", "Adicionar Foto" (ou "Editar Foto"), e "Adicionar Música" (ou "Editar Música").

**Validates: Requirements 3.1**

### Property 7: Abertura de Modal de Mensagem
*Para qualquer* carta, quando o usuário clica no botão "Editar Mensagem", o sistema deve abrir um modal contendo um campo de texto editável com o conteúdo atual da carta.

**Validates: Requirements 3.2, 4.1, 4.2**

### Property 8: Abertura de Modal de Foto
*Para qualquer* carta, quando o usuário clica no botão de foto, o sistema deve abrir um modal com área de upload de imagem.

**Validates: Requirements 3.3, 5.1**

### Property 9: Abertura de Modal de Música
*Para qualquer* carta, quando o usuário clica no botão de música, o sistema deve abrir um modal com opções de seleção de música do YouTube.

**Validates: Requirements 3.4, 6.1**

### Property 10: Labels Dinâmicos dos Botões
*Para qualquer* carta, se a carta já possui foto, o botão deve exibir "Editar Foto" em vez de "Adicionar Foto"; e se a carta já possui música, o botão deve exibir "Editar Música" em vez de "Adicionar Música".

**Validates: Requirements 3.5, 3.6**

### Property 11: Salvamento de Edições
*Para qualquer* carta, quando o usuário edita o texto em um modal e clica em "Salvar", o sistema deve atualizar o conteúdo da carta, persistir os dados, e fechar o modal.

**Validates: Requirements 4.4, 8.1**

### Property 12: Cancelamento de Edições
*Para qualquer* modal de edição, quando o usuário clica em "Cancelar", o sistema deve descartar as alterações não salvas e fechar o modal.

**Validates: Requirements 4.5, 5.7, 6.6**

### Property 13: Validação de Imagem
*Para qualquer* arquivo de imagem, o sistema deve validar o formato (JPEG, PNG, WebP) e o tamanho (máximo 5MB) antes de permitir o upload.

**Validates: Requirements 5.3, 5.4**

### Property 14: Remoção de Mídia
*Para qualquer* carta com foto ou música, quando o usuário clica em "Remover Foto" ou "Remover Música", o sistema deve remover a mídia da carta e atualizar os indicadores visuais.

**Validates: Requirements 5.6, 6.5**

### Property 15: Preview de Música
*Para qualquer* URL válida do YouTube inserida no modal de música, o sistema deve exibir um preview do vídeo usando iframe embed.

**Validates: Requirements 6.3**

### Property 16: Navegação entre Momentos
*Para qualquer* momento temático, quando o usuário clica no botão de navegação de outro momento, o sistema deve exibir as cartas daquele momento e preservar todas as edições realizadas.

**Validates: Requirements 7.2, 7.3**

### Property 17: Indicador de Momento Ativo
*Para qualquer* estado do editor, o sistema deve indicar visualmente qual momento temático está sendo exibido atualmente.

**Validates: Requirements 7.4**

### Property 18: Persistência de Dados
*Para qualquer* edição realizada, quando o usuário navega entre momentos ou recarrega a página, o sistema deve manter todas as alterações através de localStorage e sincronização com a API.

**Validates: Requirements 8.2, 8.3, 8.5**

### Property 19: Indicadores de Progresso
*Para qualquer* estado do editor, o sistema deve exibir um indicador de progresso geral mostrando quantas cartas foram editadas, e indicadores visuais individuais para cartas com mensagem personalizada, foto ou música.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 20: Responsividade
*Para qualquer* tamanho de viewport (mobile, tablet, desktop), o sistema deve adaptar o layout apropriadamente, com modais ocupando tela completa em mobile.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

### Property 21: Acessibilidade
*Para qualquer* elemento interativo, o sistema deve manter acessibilidade via teclado e fornecer labels adequados para leitores de tela.

**Validates: Requirements 10.5, 10.6**

## Error Handling

### Validation Errors

1. **Título vazio ou muito longo**
   - Exibir mensagem: "O título é obrigatório" ou "O título deve ter no máximo 200 caracteres"
   - Prevenir salvamento até correção

2. **Mensagem vazia ou excedendo limite**
   - Exibir mensagem: "A mensagem é obrigatória" ou "A mensagem deve ter no máximo 500 caracteres"
   - Mostrar contador de caracteres em vermelho quando exceder
   - Prevenir salvamento até correção

3. **Formato de imagem inválido**
   - Exibir mensagem: "Formato inválido. Use JPEG, PNG ou WebP"
   - Não iniciar upload

4. **Imagem muito grande**
   - Exibir mensagem: "Arquivo muito grande. Máximo 5MB. (X.XX MB)"
   - Não iniciar upload

5. **URL do YouTube inválida**
   - Exibir mensagem: "Deve ser uma URL do YouTube válida"
   - Não permitir salvamento até correção
   - Validar em tempo real enquanto usuário digita

### Network Errors

1. **Falha no upload de imagem**
   - Exibir mensagem de erro específica
   - Oferecer botão "Tentar Novamente"
   - Manter dados locais para retry

2. **Falha ao salvar carta**
   - Exibir toast de erro
   - Manter alterações em memória
   - Tentar auto-save novamente após delay

3. **Falha ao carregar coleção**
   - Exibir tela de erro com botão "Tentar Novamente"
   - Oferecer opção de voltar à página inicial

### User Experience Errors

1. **Fechar modal com alterações não salvas**
   - Exibir confirmação: "Você tem alterações não salvas. Deseja salvar antes de fechar?"
   - Opções: Salvar, Descartar, Cancelar

2. **Tentar finalizar com cartas incompletas**
   - Desabilitar botão "Finalizar"
   - Exibir tooltip: "Complete todas as cartas antes de finalizar"
   - Destacar cartas incompletas visualmente

## Testing Strategy

### Unit Tests

Focar em casos específicos e condições de borda:

1. **Agrupamento de Cartas**
   - Testar que 12 cartas são divididas em 3 grupos de 4
   - Testar que os índices corretos são atribuídos a cada grupo

2. **Validação de Entrada**
   - Testar validação de título vazio
   - Testar validação de mensagem excedendo 500 caracteres
   - Testar validação de formato de imagem
   - Testar validação de URL do YouTube

3. **Navegação entre Momentos**
   - Testar mudança de momento atualiza cartas exibidas
   - Testar que edições são preservadas ao navegar

4. **Modais**
   - Testar abertura e fechamento de cada tipo de modal
   - Testar salvamento de dados através de modais
   - Testar cancelamento descarta alterações

### Property-Based Tests

Usar biblioteca de property-based testing (fast-check para TypeScript) com mínimo 100 iterações por teste:

1. **Property Test: Agrupamento Correto**
   - Gerar conjuntos aleatórios de 12 cartas
   - Verificar que agrupamento sempre resulta em 3 grupos de 4 cartas
   - **Feature: editor-agrupado-12-cartas, Property 1: Agrupamento Correto de Cartas**

2. **Property Test: Visualização Simultânea**
   - Para qualquer momento (0, 1, ou 2), verificar que 4 cartas são exibidas
   - **Feature: editor-agrupado-12-cartas, Property 3: Visualização Simultânea de Cartas**

3. **Property Test: Indicadores de Mídia**
   - Gerar cartas com/sem foto e música aleatoriamente
   - Verificar que indicadores são exibidos corretamente
   - **Feature: editor-agrupado-12-cartas, Property 5: Indicadores de Mídia**

4. **Property Test: Labels Dinâmicos**
   - Gerar cartas com diferentes estados de mídia
   - Verificar que labels dos botões mudam apropriadamente
   - **Feature: editor-agrupado-12-cartas, Property 10: Labels Dinâmicos dos Botões**

5. **Property Test: Persistência de Dados**
   - Gerar edições aleatórias em cartas
   - Simular navegação e reload
   - Verificar que dados são preservados
   - **Feature: editor-agrupado-12-cartas, Property 18: Persistência de Dados**

6. **Property Test: Validação de Imagem**
   - Gerar arquivos com diferentes formatos e tamanhos
   - Verificar que validação aceita/rejeita corretamente
   - **Feature: editor-agrupado-12-cartas, Property 13: Validação de Imagem**

7. **Property Test: Responsividade**
   - Gerar diferentes tamanhos de viewport
   - Verificar que layout se adapta corretamente
   - **Feature: editor-agrupado-12-cartas, Property 20: Responsividade**

### Integration Tests

1. **Fluxo Completo de Edição**
   - Navegar pelos 3 momentos
   - Editar todas as 12 cartas
   - Adicionar fotos e músicas
   - Verificar que checkout é habilitado

2. **Persistência End-to-End**
   - Criar coleção
   - Editar cartas
   - Recarregar página
   - Verificar que estado é restaurado

3. **Upload de Imagem**
   - Fazer upload de imagem válida
   - Verificar que URL é retornada
   - Verificar que imagem é exibida

### Accessibility Tests

1. **Navegação por Teclado**
   - Testar que todos os botões são acessíveis via Tab
   - Testar que Enter/Space ativam botões
   - Testar que Escape fecha modais

2. **Screen Reader**
   - Verificar que todos os elementos têm aria-labels
   - Verificar que mudanças de estado são anunciadas
   - Testar com ferramentas de screen reader

## Implementation Notes

### Reuso de Código Existente

1. **Context**: Estender `CardCollectionEditorContext` em vez de criar novo
2. **Modais**: Reutilizar lógica de validação de `CardEditorStep`
3. **Upload**: Usar mesma API de upload de imagem existente
4. **Persistência**: Usar mesmo mecanismo de localStorage e auto-save

### Performance Considerations

1. **Lazy Loading de Modais**: Carregar componentes de modal apenas quando necessário
2. **Memoização**: Usar `React.memo` para `CardPreviewCard` para evitar re-renders desnecessários
3. **Debounce**: Aplicar debounce em validações de URL do YouTube
4. **Image Optimization**: Usar Next.js Image component para otimização automática

### Accessibility Guidelines

1. **ARIA Labels**: Todos os botões e controles devem ter labels descritivos
2. **Focus Management**: Gerenciar foco ao abrir/fechar modais
3. **Keyboard Navigation**: Suportar navegação completa via teclado
4. **Color Contrast**: Garantir contraste mínimo de 4.5:1 para texto
5. **Screen Reader**: Anunciar mudanças de estado e validações

### Mobile Considerations

1. **Touch Targets**: Mínimo 44x44px para todos os botões
2. **Modal Fullscreen**: Modais ocupam tela completa em mobile
3. **Scroll Behavior**: Prevenir scroll do body quando modal está aberto
4. **Viewport Units**: Usar vh/vw com cuidado devido a barras de navegação móvel

## Migration Strategy

### Fase 1: Criar Novos Componentes
- Implementar `GroupedCardCollectionEditor`
- Implementar `MomentNavigation`
- Implementar `CardGridView` e `CardPreviewCard`
- Implementar modais dedicados

### Fase 2: Estender Context
- Adicionar estado de momento temático ao context
- Adicionar helpers para agrupamento
- Manter compatibilidade com código existente

### Fase 3: Integração
- Substituir `CardCollectionEditor` por `GroupedCardCollectionEditor` na página
- Testar fluxo completo
- Verificar que persistência funciona

### Fase 4: Cleanup
- Remover componentes antigos não utilizados
- Atualizar testes
- Atualizar documentação

### Rollback Plan

Se necessário reverter:
1. Restaurar import de `CardCollectionEditor` na página
2. Manter novos componentes para iteração futura
3. Não há mudanças no backend ou banco de dados
