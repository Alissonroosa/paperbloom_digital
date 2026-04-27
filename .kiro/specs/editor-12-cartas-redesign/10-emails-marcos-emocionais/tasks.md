# Spec 3.4 — Tarefas

## Preparação

- [ ] **P1.** Confirmar Spec 3.2 implementada (painel + PainelClient existem)
- [ ] **P2.** Confirmar Spec 3.1 implementada (template de email neutro como base visual)
- [ ] **P3.** Inspecionar `POST /api/cards/[id]/open` para entender onde inserir trigger de marco
- [ ] **P4.** Decidir microcopy dos 3 emails com Alisson (texto inicial congelado antes de codar)

## Implementação

### Schema
- [ ] **T1.** Migration `migrations/009_create_card_collection_email_milestones.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS card_collection_email_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES card_collections(id) ON DELETE CASCADE,
    milestone TEXT NOT NULL CHECK (milestone IN ('first_opened', 'half_opened', 'all_opened')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (collection_id, milestone)
  );
  CREATE INDEX IF NOT EXISTS idx_milestones_collection ON card_collection_email_milestones(collection_id);
  ```

### Repositório
- [ ] **T2.** `src/services/CollectionMilestonesRepository.ts`:
  - `hasMilestone(collectionId, milestone): Promise<boolean>`
  - `recordMilestone(collectionId, milestone): Promise<boolean>` — INSERT com `ON CONFLICT DO NOTHING`, retorna true se inseriu (false se já existia)

### Email templates
- [ ] **T3.** `EmailService.sendFirstOpenedEmail(data)`:
  - Assunto: `{recipientName} acabou de abrir a primeira carta 💌`
  - Body: confirmação emocional + botão "Acessar painel"
- [ ] **T4.** `EmailService.sendHalfOpenedEmail(data)`:
  - Assunto: `{recipientName} já tá no meio da jornada 💝`
  - Body: emocional + crosssell discreto Mensagem Digital ao final
- [ ] **T5.** `EmailService.sendAllOpenedEmail(data)`:
  - Assunto: `{recipientName} abriu todas as 12 cartas ✨`
  - Body: emocional forte + crosssell de destaque Mensagem Digital + link `/produtos`

### Orquestrador
- [ ] **T6.** `src/services/MilestoneEmailService.ts`:
  - `triggerForCardOpened(collectionId, openedCount)`:
    - Se `openedCount === 1` → tenta `recordMilestone('first_opened')`; se inseriu, dispara E1
    - Se `openedCount === 6` → idem para `half_opened` e E2
    - Se `openedCount === 12` → idem para `all_opened` e E3

### Trigger nas aberturas
- [ ] **T7.** Editar `POST /api/cards/[id]/open/route.ts`:
  - Após marcar carta como aberta, contar `cards.filter(c => c.openedAt !== null).length`
  - Chamar `MilestoneEmailService.triggerForCardOpened(collectionId, openedCount)` em try/catch
  - Erros do email NÃO devem quebrar a resposta da abertura — log e segue

### Timeline UI
- [ ] **T8.** `src/components/painel/CollectionTimeline.tsx`:
  - Props: `{ collection; cards; milestones }` — `milestones` vem do `GET /api/painel/[token]`
  - Computa eventos derivados:
    - `{ type: 'purchase', at: collection.createdAt }`
    - Para cada `card.openedAt`: `{ type: 'card_opened', at, card }`
    - Para cada milestone: `{ type: 'milestone', at: milestone.sentAt, milestone: milestone.milestone }`
  - Ordena por `at` decrescente
  - Renderiza feed com ícone + "Há X tempo" + label
  - Marcos têm visual destacado (fundo levemente colorido)
  - Limita a 20 itens; "Ver mais" se >20
- [ ] **T9.** Atualizar `GET /api/painel/[token]` (Spec 3.2) para incluir `milestones` no payload
- [ ] **T10.** Integrar `CollectionTimeline` no `PainelClient` (Spec 3.2): posicionar entre o mapa e o crosssell

### Helper de tempo relativo
- [ ] **T11.** Verificar se já existe `formatRelativeTime` ou similar; se não, criar `src/lib/relative-time.ts` (PT-BR: "há 5 minutos", "há 2 dias", "há 3 semanas")

## Verificação

- [ ] **V1.** `npm run build` passa
- [ ] **V2.** `npx tsc --noEmit` passa
- [ ] **V3.** Migration aplicada local
- [ ] **V4.** Smoke test E2E:
  1. Compra simulada paga → painel acessível
  2. Abrir carta 1 (via URL pública) → email E1 chega ao comprador
  3. Voltar ao painel → timeline mostra "carta 1 aberta" + marco "Primeira carta aberta!"
  4. Abrir cartas 2-5 → cada uma vira evento na timeline (sem email)
  5. Abrir carta 6 → email E2 chega + marco na timeline
  6. Abrir 7-11 → eventos
  7. Abrir 12 → email E3 chega + marco
  8. Tentar reabrir o mesmo cenário (não disparar emails duplicados)
- [ ] **V5.** Testar idempotência: chamar `recordMilestone` 2x para o mesmo `(collection, milestone)` → segunda retorna false, sem erro
- [ ] **V6.** Reset de cartas: resetar todas após emails enviados, reabrir → emails NÃO disparam de novo
- [ ] **V7.** Mobile (375px): timeline renderiza bem; itens longos truncam apropriadamente
- [ ] **V8.** Verificar que erro no envio de email não quebra `/api/cards/[id]/open`

## Out of scope

- **Email de encerramento (E4)** — precisa de cron, V2
- **Email de silêncio (E5)** — precisa de cron, V2
- Agendamento de envios — backlog V2
- Notificação push web ou SMS
- Webhook externo (Zapier, IFTTT)
- Editor de templates de email no admin
- Internacionalização
- Opt-out de emails individuais (MVP envia todos)
- Email para o destinatário (continua zero)
- A/B testing dos assuntos
- Analytics avançado dentro do painel além da timeline
