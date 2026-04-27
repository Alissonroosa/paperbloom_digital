# Spec 2.4 — Editor: Foto Capa Única no Step 2

## Problema

Atualmente o editor pede até **12 uploads de foto individuais** (uma por carta) durante os Steps 3-5. Para o usuário isso é:

- **Trabalho pesado**: 12 uploads em sequência num celular tomam tempo real
- **Bloqueio percebido**: o prompt "Adicione 1 foto em cada carta!" gera culpa em quem pula
- **Personalização ilusória**: a maioria dos usuários acaba subindo a mesma foto (ou variações próximas) — o esforço não está agregando personalização real

Resultado: muitos usuários abandonam no meio dos uploads ou pulam todas as fotos (cartas ficam sem visual).

## Objetivo

Permitir o upload de **uma única foto "capa"** no Step 2 que será aplicada como background visual em todas as 12 cartas que **não tiverem foto individual definida**. Mantém a porta aberta para personalização por carta no futuro (MVP 2).

Comportamento de fallback: `card.imageUrl ?? collection.coverImageUrl ?? placeholder`.

## Escopo (in)

- **Schema**: adicionar coluna `cover_image_url TEXT NULLABLE` em `card_collections`
- **Type**: adicionar `coverImageUrl?: string | null` em `CardCollection` (em `src/types/card.ts` ou similar)
- **API**: `PATCH /api/card-collections/[id]` aceita campo `coverImageUrl` no body
- **Step2Intro**: bloco de upload da foto capa acima do textarea de mensagem
  - Reutiliza `PhotoUploadModal` ou implementa versão inline minimalista
  - Microcopy: "📸 Foto da capa (opcional) — usada em todas as cartas que você não personalizar"
- **Render fallback**: aplicar lógica `card.imageUrl ?? collection.coverImageUrl` em:
  - `CardGridView` (preview no editor)
  - `CardCollectionViewer` (produto final público em `/cartas/[slug]`)
- **Demo** (`/demo/card-collection`): adicionar capa estática para o demo continuar visual

## Escopo (out)

- Remoção da UI de foto por carta nos Steps 3-5 (continua funcionando — apenas vira opcional)
- Interface dedicada de personalização por carta (MVP 2)
- Migration de coleções existentes (não há retroactive — começam sem capa, comportamento atual)
- Foto capa em outros produtos (mensagem, revelação-virtual)

## Mudanças técnicas principais

### Schema
```sql
ALTER TABLE card_collections ADD COLUMN cover_image_url TEXT;
```
Safe em Postgres (ADD COLUMN nullable é não-bloqueante).

### Tipos
- `CardCollection` ganha `coverImageUrl?: string | null`
- Validador da API (zod/joi) aceita campo opcional

### API
- `PATCH /api/card-collections/[id]/route.ts` aceita `coverImageUrl` no body
- Reaproveita endpoint de upload existente (provavelmente `/api/uploads`)

### Frontend
- `Step2Intro.tsx`: bloco de upload novo no topo do form
- `CardGridView.tsx`: aplicar fallback no render de imagem da carta
- `CardCollectionViewer.tsx`: idem fallback

## Critérios de aceite

### Funcional
- [ ] Step 2 mostra área de upload "Foto da capa"
- [ ] Upload persiste em `card_collections.cover_image_url`
- [ ] Cartas sem foto própria renderizam com `coverImageUrl` como background no preview
- [ ] Cartas sem foto própria renderizam com `coverImageUrl` no produto final público
- [ ] Cartas com foto própria mantêm sua foto (precedência preservada)
- [ ] Coleções antigas sem capa: comportamento igual ao atual (sem regressão visual)

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Migration aplicada com sucesso (`prisma migrate deploy` ou equivalente)
- [ ] Sem regressão nos testes existentes (`npm test -- card-editor`)

### UX
- [ ] Upload da capa em mobile funciona com mesma facilidade do upload por carta
- [ ] Microcopy não pressiona (é "opcional", não "obrigatório")

## Dependências

- ✅ Sistema de upload já existe (`PhotoUploadModal`, `/api/uploads`)
- ✅ Schema migration: `ADD COLUMN nullable` é safe em Postgres
- ⚠️ Identificar exatamente onde o produto final renderiza as cartas:
  - Provavelmente `src/app/(fullscreen)/cartas/[slug]/page.tsx`
  - Componente: `CardCollectionViewer.tsx`

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Migration em produção quebra | Baixa | ADD COLUMN nullable é safe; testar em staging primeiro |
| Foto capa muito grande em mobile | Média | Reusar otimização do upload existente (resize/compress no cliente) |
| Conflito visual quando carta tem foto E coleção tem capa | Baixa | Precedência clara no código: `card.imageUrl` vence sempre |
| Cartas demo (`/demo/card-collection`) ficam sem visual | Média | Adicionar capa estática no mock do demo |
| Editor antigo (Steps 3-5) ainda pede foto por carta — atrito visual | Média | Spec 2.1 consolida em 1 step e suaviza esse prompt; idealmente 2.4 vem antes ou em paralelo a 2.1 |

## Estimativa

2-4h: 30min schema + 30min API + 30min validador + 1-2h UI no Step 2 + 30min render fallback + verificação

## Validação pós-deploy

- % de coleções com `cover_image_url` definido (esperado: alto, >70%)
- % de cartas com foto individual (esperado: cair drasticamente — usuário usa só a capa)
- Tempo médio no editor (esperado: cair, principalmente nos steps de cartas)
- Visual final do produto: % de cartas exibidas sem placeholder (esperado: subir muito)
