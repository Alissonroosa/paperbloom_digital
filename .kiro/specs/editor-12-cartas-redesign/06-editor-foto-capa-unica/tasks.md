# Spec 2.4 — Tarefas

## Preparação

- [x] **P1.** Localizar setup de migrations:
  - SQL puro: `migrations/*.sql`
- [x] **P2.** Identificar onde produto final renderiza cartas:
  - `src/app/(fullscreen)/cartas/[slug]/page.tsx`
  - Componente principal: `CardModal.tsx`
- [x] **P3.** Identificar shape atual do tipo `CardCollection` (`src/types/card.ts`)
- [x] **P4.** Verificar API de upload existente (`/api/upload/card-image`)

## Implementação

### Schema + tipos
- [x] **T1.** Criar migration adicionando `cover_image_url TEXT NULL` em `card_collections`
  - `migrations/007_add_cover_image_to_card_collections.sql`
- [x] **T2.** Atualizar type `CardCollection` adicionando `coverImageUrl?: string | null`
  - `src/types/card.ts` — campo em `CardCollection` + `CardCollectionRow` + `rowToCardCollection`
- [x] **T3.** Atualizar validador da API PATCH para aceitar `coverImageUrl` opcional

### API
- [x] **T4.** `CardCollectionService.ts`: bloco para `coverImageUrl` no método `update()`

### Frontend — Step 2
- [x] **T5.** Editar `Step2Intro.tsx`:
  - Bloco inline com `<input type="file">` para upload da capa
  - State `coverImageUrl` sincronizado com `collection.coverImageUrl`
  - Label "📸 Foto da capa (opcional)" + upload
  - Microcopy: "Será usada como fundo das cartas que você não personalizar individualmente"
  - handleNext persiste `coverImageUrl` junto com intro/música

### Frontend — Render fallback
- [x] **T6.** `CardModal.tsx`: aceita prop `coverImageUrl`, fallback `card.imageUrl ?? coverImageUrl`
- [x] **T7.** `src/app/(fullscreen)/cartas/[slug]/page.tsx`: passa `collection.coverImageUrl` ao `<CardModal>`
- [ ] **T8.** Demo (`/demo/card-collection`): adicionar `coverImageUrl` mockada no estado inicial

## Verificação

- [x] **V1.** `npm run build` passa
- [x] **V2.** `npx tsc --noEmit` passa (erros apenas em testes pré-existentes)
- [ ] **V3.** Migration roda local
- [ ] **V4.** Smoke test:
  1. Criar coleção nova
  2. Step 2: subir foto capa → ver no banco que persistiu
  3. Step 3: cartas sem foto própria mostram a capa
  4. Editar foto de 1 carta — só ela muda, demais continuam com a capa
  5. Submeter checkout — produto final público (`/cartas/[slug]`) mostra capa nas 11 sem foto
- [ ] **V5.** Regressão: coleção antiga sem capa → editor abre normalmente, sem placeholder feio
- [ ] **V6.** Demo (`/demo/card-collection`): visual continua bonito

## Out of scope

- UI dedicada de personalização por carta no MVP (continua via modal individual existente)
- Migration de dados de coleções antigas (sem necessidade)
- Foto capa em editores `/editor/mensagem` ou `/editor/revelacao-virtual`
- Crop/edição de foto no upload (usa whatever já existe)
