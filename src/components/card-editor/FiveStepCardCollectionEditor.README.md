# FiveStepCardCollectionEditor

Editor de 12 cartas com fluxo de 5 etapas para uma experiência mais guiada e intuitiva.

## Visão Geral

O `FiveStepCardCollectionEditor` é um componente que organiza a edição de 12 cartas em 5 etapas sequenciais:

1. **Etapa 1: Mensagem Inicial** - Personalização da mensagem de abertura e campos De/Para
2. **Etapas 2-4: Blocos de Cartas** - Edição de 4 cartas por etapa (total de 12 cartas)
3. **Etapa 5: Dados para Envio** - Coleta de nome, telefone e email para entrega

## Estrutura das Etapas

### Etapa 1: Mensagem Inicial
- Campo de texto para mensagem de abertura personalizada
- Campo "De:" para nome do remetente
- Campo "Para:" para nome do destinatário
- Validação: todos os campos são obrigatórios

### Etapas 2-4: Blocos de Cartas
Cada etapa exibe 4 cartas em um grid:
- **Etapa 2**: Cartas 1-4
- **Etapa 3**: Cartas 5-8
- **Etapa 4**: Cartas 9-12

Para cada carta, o usuário pode:
- Editar mensagem (título e texto)
- Adicionar/editar foto
- Adicionar/editar música do YouTube

### Etapa 5: Dados para Envio
- Nome completo do destinatário
- Telefone de contato
- Email (com validação de formato)
- Validação: todos os campos são obrigatórios

## Navegação

- **Botão "Anterior"**: Volta para a etapa anterior (não aparece na primeira etapa)
- **Botão "Próximo"**: Avança para a próxima etapa
- **Botão "Finalizar"**: Aparece apenas na última etapa, salva os dados e procede para checkout

## Indicadores de Progresso

### Barra de Progresso de Etapas
- Mostra visualmente em qual etapa o usuário está
- Etapas concluídas: verde
- Etapa atual: azul
- Etapas futuras: cinza

### Progresso Geral de Cartas
- Badge no header mostrando quantas cartas foram completadas
- Percentual de conclusão
- Atualizado em tempo real

## Preview em Tempo Real

O editor inclui um painel de preview lateral (desktop) ou modal (mobile) que mostra:

### Visualização Desktop
- Mockup realista de MacBook Pro
- Preview da coleção completa de cartas
- Grid interativo com todas as 12 cartas
- Mensagem de introdução
- Clique em cartas para ver detalhes

### Visualização Mobile
- Mockup realista de iPhone 16 Pro Max
- Mesma funcionalidade da visualização desktop
- Escala ajustada para o dispositivo

### Características do Preview
- Atualização em tempo real (100ms debounce)
- Toggle entre Desktop/Mobile
- Botão flutuante no mobile
- Sticky no desktop
- Mostra foto e música quando adicionadas
- Indicadores visuais de conteúdo

## Validações

### Etapa 1 (Mensagem Inicial)
- Mensagem de abertura não pode estar vazia
- Nome do remetente não pode estar vazio
- Nome do destinatário não pode estar vazio

### Etapas 2-4 (Cartas)
- Não há validação obrigatória para avançar
- Usuário pode pular cartas e voltar depois

### Etapa 5 (Dados para Envio)
- Nome completo obrigatório
- Telefone obrigatório
- Email obrigatório e deve ter formato válido
- Todas as 12 cartas devem estar completas para finalizar

## Persistência de Dados

- Auto-save automático a cada 2 segundos
- Dados salvos em localStorage
- Sincronização com API do backend
- Indicador de salvamento no header

## Modais de Edição

### EditMessageModal
- Edição de título e mensagem da carta
- Contador de caracteres
- Validação de limites (título: 200 chars, mensagem: 500 chars)

### PhotoUploadModal
- Upload de imagem via drag-and-drop ou seleção
- Preview da imagem
- Validação de formato (JPEG, PNG, WebP)
- Validação de tamanho (máx 5MB)

### MusicSelectionModal
- Input para URL do YouTube
- Validação de URL em tempo real
- Preview do vídeo
- Opção de remover música

## Responsividade

- Layout adaptativo para mobile, tablet e desktop
- Modais em tela cheia no mobile
- Grid de cartas responsivo:
  - Mobile: 1 coluna
  - Tablet: 2 colunas
  - Desktop: 2 colunas

## Acessibilidade

- Navegação completa via teclado
- Labels ARIA para leitores de tela
- Indicadores de progresso com aria-live
- Contraste adequado de cores
- Touch targets mínimos de 44x44px

## Uso

```tsx
import { FiveStepCardCollectionEditor } from '@/components/card-editor/FiveStepCardCollectionEditor';

function EditorPage() {
  const handleFinalize = async () => {
    // Lógica para criar checkout e redirecionar
  };

  return (
    <CardCollectionEditorProvider autoSaveEnabled={true}>
      <FiveStepCardCollectionEditor
        onFinalize={handleFinalize}
        isProcessing={false}
      />
    </CardCollectionEditorProvider>
  );
}
```

## Props

```typescript
interface FiveStepCardCollectionEditorProps {
  onFinalize: () => Promise<void>;  // Callback ao finalizar
  isProcessing?: boolean;            // Estado de processamento
}
```

## Dependências

- `CardCollectionEditorContext` - Gerenciamento de estado
- `CardGridView` - Visualização em grid das cartas
- `CardCollectionPreview` - Preview em tempo real Desktop/Mobile
- `EditMessageModal` - Modal de edição de mensagem
- `PhotoUploadModal` - Modal de upload de foto
- `MusicSelectionModal` - Modal de seleção de música
- `AutoSaveIndicator` - Indicador de auto-save
- `Button`, `Badge` - Componentes UI

## Diferenças do GroupedCardCollectionEditor

O `FiveStepCardCollectionEditor` difere do `GroupedCardCollectionEditor` nos seguintes aspectos:

1. **Fluxo Linear**: Etapas sequenciais vs navegação livre entre momentos
2. **Mensagem Inicial**: Etapa dedicada para personalização da abertura
3. **Dados de Envio**: Etapa final para coleta de informações de contato
4. **Navegação**: Botões Anterior/Próximo vs navegação por momentos temáticos
5. **Validação**: Validação por etapa vs validação geral
6. **Preview**: Panel lateral com visualização Desktop/Mobile em tempo real
7. **Layout**: Grid de 2 colunas (editor + preview) no desktop

## Migração de Banco de Dados

Para suportar os novos campos, execute a migração:

```bash
npm run db:migrate
```

Ou execute manualmente o SQL:

```sql
ALTER TABLE card_collections
ADD COLUMN IF NOT EXISTS intro_message TEXT;

ALTER TABLE card_collections
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
```

## API Endpoints Utilizados

- `PATCH /api/card-collections/[id]` - Atualiza coleção (intro_message, contact_phone)
- `PATCH /api/cards/[id]` - Atualiza carta individual
- `GET /api/card-collections/[id]` - Busca coleção e cartas
- `POST /api/checkout/card-collection` - Cria sessão de checkout

## Notas de Implementação

- Lazy loading de modais para melhor performance
- Memoização de cálculos de progresso
- Debounce de auto-save (2 segundos)
- Scroll automático ao mudar de etapa
- Confirmação ao sair com alterações não salvas
