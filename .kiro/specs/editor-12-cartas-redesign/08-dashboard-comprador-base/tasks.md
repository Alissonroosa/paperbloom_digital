# Spec 3.2 — Tarefas

## Preparação

- [ ] **P1.** Localizar webhook MP que processa pagamento aprovado: grep por `payment.status === 'approved'` ou `MercadoPagoService` em `src/app/api/`
- [ ] **P2.** Confirmar `/success` page e como ela recebe `collectionId` (via query param? session?)
- [ ] **P3.** Inspecionar `/editor/12-cartas/[id]` (se existir) — aceita coleção paga? Tem flag de "modo edição"?
- [ ] **P4.** Confirmar shape do API `/api/card-collections/[id]` (PATCH precisa de guarda)
- [ ] **P5.** Ver onde QR code é gerado (provavelmente em `qrCodeService` ou inline no webhook)

## Implementação

### Schema + tipos (compartilhado com Spec 3.1)
- [ ] **T2.** Atualizar `src/types/card.ts`:
  - `CardCollection.dashboardToken: string | null`
  - `CardCollectionRow.dashboard_token: string | null`
  - `rowToCardCollection()` mapeando o campo
- [ ] **T3.** `CardCollectionService`:
  - `findByDashboardToken(token: string): Promise<CardCollection | null>`
  - `setDashboardToken(id: string, token?: string): Promise<string>` (gera UUID v4 se não passado; idempotente)
  - Adicionar bloco `if (data.dashboardToken !== undefined)` no `update()`

### Reset de cartas
- [ ] **T4.** `CardService.reset(cardId: string)` — `UPDATE cards SET status='unopened', opened_at=NULL, updated_at=NOW() WHERE id=$1`
- [ ] **T5.** `CardService.resetAllForCollection(collectionId: string)` — equivalente WHERE collection_id
- [ ] **T6.** `POST /api/cards/[id]/reset/route.ts` — chama service, retorna card atualizado
- [ ] **T7.** `POST /api/card-collections/[id]/reset-all/route.ts` — chama service

### Guarda de edição
- [ ] **T8.** Editar `PATCH /api/card-collections/[id]/route.ts`:
  - Antes de aplicar update, buscar cards e checar `cards.some(c => c.openedAt !== null)`
  - Se houver carta aberta E body contém `coverImageUrl/introMessage/youtubeVideoId/recipientName/senderName`: retornar 409 com mensagem "Conteúdo trancado — primeira carta já foi aberta"
  - Permitir update apenas dos campos `contactName/contactEmail/contactPhone/dashboardToken/status/paymentId`
- [ ] **T9.** Editar `PATCH /api/cards/[id]/route.ts` similarmente: rejeitar update do card se `card.openedAt !== null`

### Webhook MP + redirects
- [ ] **T10.** No webhook MP: ao confirmar pagamento, gerar token via `setDashboardToken()` e persistir antes de enviar email (idempotente)
- [ ] **T11.** Editar `src/app/(marketing)/success/page.tsx` (ou onde redireciona):
  - Após confirmar status pago, buscar `dashboard_token` da coleção
  - `router.replace('/painel/' + token)`
- [ ] **T12.** Editar `src/app/(marketing)/delivery/c/[collectionId]/page.tsx`:
  - Substituir o conteúdo por server-side redirect:
    ```ts
    // page.tsx vira async server component que busca token e usa redirect()
    import { redirect } from 'next/navigation';
    export default async function Page({ params }) {
      const collection = await cardCollectionService.findById(params.collectionId);
      if (!collection?.dashboardToken) redirect('/');
      redirect('/painel/' + collection.dashboardToken);
    }
    ```

### API do painel
- [ ] **T13.** `GET /api/painel/[token]/route.ts`:
  - Busca coleção via `findByDashboardToken(token)`
  - 404 se não achar
  - Busca cards via `CardService.findByCollectionId`
  - Retorna `{ collection, cards, stats: { total, opened, lastOpenedAt } }`

### UI do painel
- [ ] **T14.** `src/app/(marketing)/painel/[token]/page.tsx`:
  - Server component que chama `/api/painel/[token]` ou faz a query direto
  - 404 se token inválido (`notFound()`)
  - Renderiza `<PainelClient collection={...} cards={...} />`
- [ ] **T15.** `src/components/painel/PainelClient.tsx` (client wrapper que detém estado dos modais)
- [ ] **T16.** `src/components/painel/CardMap.tsx`:
  - Grid 4×3 (mobile) / 6×2 (desktop)
  - Cada item: aspect-ratio 3:4, cor por status, ícone (cadeado/check)
  - onClick → abre `<CardPreviewModal>`
- [ ] **T17.** `src/components/painel/CardPreviewModal.tsx`:
  - Reusa visual do `CardModal` mas com badge "PRÉ-VISUALIZAÇÃO" no topo
  - Não chama `/api/cards/[id]/open` — só renderiza
  - Usa fallback `card.imageUrl ?? collection.coverImageUrl`
- [ ] **T18.** `src/components/painel/SharePanel.tsx`:
  - Mostra QR (imagem)
  - Botão "Baixar QR Code" (porta lógica de `delivery/c/[id]/page.tsx:94-104`)
  - Input readonly com link público + botão "Copiar"
- [ ] **T19.** `src/components/painel/EditPanel.tsx`:
  - Se nenhuma carta aberta: botão "Editar conteúdo" → link para editor
  - Senão: card cinza "Conteúdo trancado — primeira carta já foi aberta"
- [ ] **T20.** `src/components/painel/ResetPanel.tsx`:
  - Lista cartas abertas com botão "Resetar" individual
  - Se ≥2 abertas: botão grande "Resetar todas as cartas abertas"
  - Confirmação modal: *"Esta carta voltará a ser uma surpresa. {Nome} poderá abri-la de novo."*
  - Após confirmar: chama API e atualiza estado local
- [ ] **T21.** `src/components/painel/CrossSellCard.tsx`:
  - Card discreto no rodapé: "Já tem 12 cartas. Que tal uma Mensagem Digital pra outra ocasião?"
  - Link → `/mensagem-digital`

### Editor para coleção paga
- [ ] **T22.** Verificar se `/editor/12-cartas/[id]` aceita coleção paga. Se não:
  - Opção A: adicionar prop `allowEditAfterPaid` no editor (com guarda visual de "modo edição pós-compra")
  - Opção B: criar `/painel/[token]/editar/page.tsx` que monta o editor com collection carregada
  - Decidir na implementação após inspeção

## Verificação

- [ ] **V1.** `npm run build` passa
- [ ] **V2.** `npx tsc --noEmit` passa
- [ ] **V3.** Smoke test E2E:
  1. Compra simulada → recebe email com link `/painel/[token]`
  2. Acessa painel: vê 12 cartas no mapa, todas brancas
  3. Clica em uma carta no mapa → abre modal preview, fecha sem alterar nada
  4. Clica "Baixar QR Code" → arquivo baixa
  5. Clica "Copiar link" → clipboard tem URL pública
  6. Clica "Editar conteúdo" → abre editor
  7. Acessa URL pública das cartas, abre carta 1 → status muda
  8. Volta ao painel: carta 1 verde, botão "Resetar" aparece, "Editar" troca por "Trancado"
  9. Clica "Resetar" na carta 1 → confirma → carta volta a branca
  10. Editar volta a estar disponível
- [ ] **V5.** Verificar `/delivery/c/[collectionId]` antigo: redireciona para `/painel/[token]`
- [ ] **V6.** Mobile 375px: layout vertical funcional, mapa toca-ável
- [ ] **V7.** Token inválido (`/painel/foo`): retorna 404

## Out of scope

- Botão "Enviar para {Nome}" e modal WhatsApp — Spec 3.3
- Timeline cronológica de eventos — Spec 3.4
- Agendamento de envios — backlog V2
- PIN/login — backlog MVP 2
- Painel para Mensagem Digital ou Revelação Virtual
- Edição de conteúdo após 1ª abertura
- Personalização visual do painel (cores, temas)
