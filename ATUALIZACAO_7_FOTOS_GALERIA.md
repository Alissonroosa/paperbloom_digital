# Atualização: 7 Fotos na Galeria

## Resumo
Atualizado o sistema para permitir até **7 fotos secundárias** na galeria (anteriormente eram 3).

## Arquivos Modificados

### 1. Tipos e Validação
- **`src/types/wizard.ts`**
  - `initialWizardState.data.galleryImages`: Array expandido de 3 para 7 elementos `null`
  - `initialWizardState.uploads.galleryImages`: Array expandido de 3 para 7 objetos de upload
  - `step4Schema`: Limite máximo atualizado de 3 para 7 fotos

- **`src/lib/validation.ts`**
  - `IMAGE_CONSTRAINTS.maxGalleryImages`: Atualizado de 3 para 7

- **`src/types/message.ts`**
  - Comentário atualizado: `galleryImages: string[]` agora indica "max 7" em vez de "max 3"
  - Schema Zod: `.max(3)` atualizado para `.max(7)`

### 2. API e Backend
- **`src/app/api/messages/upload-image/route.ts`**
  - Validação de limite: Atualizado de 3 para 7 fotos
  - Mensagem de erro atualizada

### 3. Componente de Upload
- **`src/components/wizard/steps/Step4PhotoUpload.tsx`**
  - Estado `dragOver.gallery`: Array expandido de 3 para 7 elementos booleanos
  - `galleryInputRefs`: Array expandido de 3 para 7 refs
  - Grid de upload: Atualizado para renderizar 7 slots `{[0, 1, 2, 3, 4, 5, 6].map(...)}`
  - Grid CSS: Adicionado `md:grid-cols-4` para melhor layout em telas maiores
  - Texto atualizado: "Adicione até 7 fotos adicionais"
  - Comentário do componente atualizado

### 4. Documentação
- **`src/components/wizard/steps/Step4PhotoUpload.README.md`**
  - Todas as referências a "3 fotos" atualizadas para "7 fotos"
  - Estrutura do componente atualizada
  - Checklist de testes atualizado
  - Requirements mapping atualizado

### 5. Testes e Mock Data
- **`src/services/__tests__/verify-enhanced-messageservice.ts`**
  - Comentários e mensagens de teste atualizados de "max 3" para "max 7"

- **`src/lib/__tests__/verify-validation.ts`**
  - Validação atualizada (o valor já vem de `IMAGE_CONSTRAINTS.maxGalleryImages`)

- **`src/components/editor/EditorForm.tsx`**
  - Array padrão de galleryImages atualizado de 3 para 7

- **Todos os arquivos de teste atualizados:**
  - `src/components/editor/__tests__/EditorForm.test.tsx`
  - `src/components/editor/__tests__/verify-editor-form.ts`
  - `src/components/editor/__tests__/accessibility.test.tsx`
  - `src/components/wizard/steps/__tests__/Step7ContactInfo.integration.test.tsx`
  - `src/components/wizard/__tests__/PreviewPanel.test.tsx`
  - `src/lib/__tests__/validation.test.ts`
  - `src/lib/examples/validation-integration-example.ts`
  - `src/app/(marketing)/editor/test-preview-panel/page.tsx`

## Funcionalidades

### Upload
- ✅ 1 foto principal (obrigatória)
- ✅ 7 fotos secundárias (opcional)
- ✅ Drag & drop para todas as fotos
- ✅ Validação de formato (JPEG, PNG, WebP)
- ✅ Validação de tamanho (máx 5MB por foto)
- ✅ Preview de todas as fotos
- ✅ Remoção individual de fotos

### Visualização
- ✅ Página demo (`/demo/message`) exibe todas as fotos em rotação automática
- ✅ Preview no editor mostra todas as fotos em grid responsivo
- ✅ Layout adaptativo: 3 colunas em mobile, 4 colunas em desktop

## Layout Responsivo

### Mobile
```
Grid: 3 colunas
[Foto 1] [Foto 2] [Foto 3]
[Foto 4] [Foto 5] [Foto 6]
[Foto 7]
```

### Desktop (md+)
```
Grid: 4 colunas
[Foto 1] [Foto 2] [Foto 3] [Foto 4]
[Foto 5] [Foto 6] [Foto 7]
```

## Compatibilidade

### Componentes que já suportam 7 fotos (usam .map())
- ✅ `CinematicPreview.tsx` - Renderiza dinamicamente todas as fotos
- ✅ `demo/message/page.tsx` - Sistema de rotação automática
- ✅ `delivery/[messageId]/page.tsx` - Grid de galeria
- ✅ `delivery/test-delivery-preview/page.tsx` - Preview de entrega

### Backend
- ✅ API de upload (`/api/messages/upload-image`) - Sem alterações necessárias
- ✅ Banco de dados - Campo `gallery_images` já é um array JSON sem limite fixo
- ✅ Validação no servidor - Usa `IMAGE_CONSTRAINTS.maxGalleryImages`

## Testes Recomendados

1. **Upload de Fotos**
   - [ ] Fazer upload de 7 fotos secundárias
   - [ ] Verificar que não é possível adicionar mais de 7
   - [ ] Testar remoção individual
   - [ ] Testar substituição de fotos

2. **Visualização**
   - [ ] Verificar preview no editor com 7 fotos
   - [ ] Verificar página demo com 7 fotos
   - [ ] Testar em mobile e desktop
   - [ ] Verificar rotação automática na página demo

3. **Validação**
   - [ ] Tentar upload de formato inválido
   - [ ] Tentar upload de arquivo > 5MB
   - [ ] Verificar mensagens de erro

## Notas Técnicas

- O sistema usa arrays dinâmicos, então adicionar mais fotos no futuro é simples
- O layout em grid se adapta automaticamente ao número de fotos
- A rotação automática na página demo funciona com qualquer quantidade de fotos
- Não há impacto de performance significativo com 7 fotos vs 3 fotos
