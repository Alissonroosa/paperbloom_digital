# Spec 3.4 — Emails de Marco + Timeline no Painel

## Problema

Após a entrega, o comprador **perde contato emocional** com o presente:

- Não sabe quando o destinatário abre as cartas
- Não tem motivo pra voltar ao painel após enviar
- Não recebe nenhum sinal de que o produto está cumprindo seu papel
- Não há gancho natural pra crosssell de outros produtos Paperbloom

O resultado é um produto que termina no checkout — o comprador esquece da Paperbloom até precisar de outro presente, e quando precisa não lembra que existiu.

## Objetivo

Criar um **loop emocional pós-entrega** com dois pilares:

1. **Emails automáticos de marco** disparados conforme o destinatário abre as cartas — cada email é um momento de retorno emocional do comprador para a Paperbloom.
2. **Timeline visual no painel** que registra eventos da coleção em ordem cronológica — o comprador vê o "filme" do presente.

Tudo idempotente (cada marco dispara só uma vez por coleção) e baseado em dados que já existem (`Card.openedAt`).

## Escopo (in)

### Eventos rastreados (timeline)
Cada um aparece no feed do painel com data/hora:
- "Compra confirmada" — `card_collections.created_at` quando `status='paid'`
- "Carta {N} aberta — {Nome} viu há {X tempo}" — cada `Card.openedAt` único
- Marcos especiais (linhas destacadas no feed):
  - "🎉 Primeira carta aberta!"
  - "💝 {Nome} já abriu metade (6 de 12)"
  - "✨ Todas as 12 cartas foram abertas!"

### 3 emails automáticos (MVP — só triggers diretos, sem cron)
| # | Trigger | Assunto | Conteúdo principal |
|---|---|---|---|
| E1 | 1ª carta aberta | "{Nome} acabou de abrir a primeira carta 💌" | Confirmação emocional + link painel |
| E2 | 6ª carta aberta (metade) | "{Nome} já tá no meio da jornada 💝" | Emocional + crosssell Mensagem Digital |
| E3 | 12ª carta aberta (todas) | "{Nome} abriu todas as 12 cartas ✨" | Emocional forte + crosssell forte + opção de "continuar" |

> **Adiados para V2** (precisam de cron job): email de encerramento (+7d após all_opened) e email de silêncio (+7d sem aberturas após compra).

### Schema novo
- Tabela `card_collection_email_milestones`:
  ```sql
  CREATE TABLE card_collection_email_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES card_collections(id) ON DELETE CASCADE,
    milestone TEXT NOT NULL CHECK (milestone IN ('first_opened', 'half_opened', 'all_opened')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (collection_id, milestone)
  );
  ```
  - UNIQUE garante idempotência — não enviar mesmo marco 2x
  - CHECK constraint inclui só os 3 marcos do MVP; quando V2 adicionar `closure` e `silence`, basta `ALTER TABLE` para expandir

### Triggers
- **E1, E2, E3** — disparados via `POST /api/cards/[id]/open`:
  - Após marcar carta como aberta, contar quantas estão abertas
  - Se for 1, 6 ou 12 → checar `card_collection_email_milestones` e disparar email + inserir registro
  - Falha no envio do email **não** quebra a abertura (try/catch + log)

### Reset e idempotência
- Reset de carta (Spec 3.2) **não remove** registros de `card_collection_email_milestones` — marcos já enviados ficam registrados
- Se comprador resetar todas e destinatário reabrir: marcos não disparam de novo (proteção contra spam de email)
- Reset de carta individual: contadores recomputam, mas marcos já enviados não disparam

### Timeline no painel (Spec 3.2 reaproveita)
- `src/components/painel/CollectionTimeline.tsx`
- Layout: feed vertical, item por item
- Eventos derivados de:
  - `collection.createdAt` (compra)
  - `cards[i].openedAt` (cada abertura)
  - Marcos disparados (lookup em `card_collection_email_milestones`)
- "Há X tempo" relativo (ex: "há 2 horas", "há 3 dias")
- Mostra os últimos 20 eventos (paginação fica para depois se necessário)

## Escopo (out)

- **Agendamento de envios pelo comprador** — backlog V2
- **Notificações push web** — backlog
- **SMS de marcos** — não no MVP
- **Webhook para integrações externas** (Zapier, etc)
- **Internacionalização dos emails** — PT-BR apenas
- Editar conteúdo dos emails de marco via CMS
- Personalização avançada (cores, templates por usuário)
- Analytics avançado dos emails (open rate, click rate dashboard) — usar painel padrão do Resend
- Email para o destinatário (continua sendo zero — Spec 3.3 confirma WhatsApp manual)

## Mudanças técnicas principais

### Schema
- Migration `009_create_card_collection_email_milestones.sql`

### Backend
- `src/services/MilestoneEmailService.ts` (orquestrador):
  - `triggerForCardOpened(collectionId, openedCount)` — checa 1, 6, 12 e dispara conforme
- `src/services/EmailService.ts` — 3 métodos novos:
  - `sendFirstOpenedEmail`
  - `sendHalfOpenedEmail`
  - `sendAllOpenedEmail`
- `src/services/CardCollectionMilestonesRepository.ts` (ou método em CardCollectionService):
  - `hasMilestone(collectionId, milestone): Promise<boolean>`
  - `recordMilestone(collectionId, milestone): Promise<boolean>` — idempotente via `ON CONFLICT DO NOTHING`
- Editar `POST /api/cards/[id]/open` para chamar `MilestoneEmailService.triggerForCardOpened`

### Frontend
- `src/components/painel/CollectionTimeline.tsx` — feed dos eventos
- Integração no `PainelClient.tsx` (entre o mapa e o crosssell)

## Critérios de aceite

### Funcional
- [ ] Abrir 1ª carta → email "primeira carta aberta" enviado em <1min ao comprador
- [ ] Abrir 6ª carta → email "metade" enviado
- [ ] Abrir 12ª carta → email "todas" enviado
- [ ] Mesmo marco nunca dispara 2x para mesma coleção (mesmo após reset)
- [ ] Reset de carta não dispara email (não há trigger no reset)
- [ ] Timeline no painel mostra: compra + cada abertura + marcos atingidos
- [ ] Crosssell de Mensagem Digital aparece nos emails E2 e E3
- [ ] Falha no envio de email não quebra resposta de `/api/cards/[id]/open`

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Migration `009` aplicada
- [ ] UNIQUE em `(collection_id, milestone)` garante idempotência

### UX
- [ ] Emails renderizam bem em Gmail/iOS Mail/Outlook (mobile + desktop)
- [ ] Crosssell nos emails é claro mas não agressivo
- [ ] Timeline no painel é legível em mobile (375px), eventos antigos podem ser ocultados após N
- [ ] "Há X tempo" usa formato natural em PT-BR ("há 5 minutos", "há 2 dias")

## Dependências

- ⚠️ **Bloqueia em Spec 3.2** (painel base e PainelClient)
- ⚠️ **Coordena com Spec 3.1** para template visual neutro dos emails (continuar usando logo neutro, sem revelar produto no assunto/preview)
- ✅ `Card.openedAt` já existe e é populado pelo `/api/cards/[id]/open`
- ✅ **Sem dependência de cron** — emails de encerramento e silêncio movidos para V2

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Email de marco vai pra spam | Média | Manter padrão Resend + SPF/DKIM já configurados; assunto sem "$$$" ou caps; texto natural |
| Múltiplas aberturas simultâneas → race condition no insert do marco | Média | UNIQUE constraint resolve no banco; tratar erro 23505 como "já enviado" |
| Comprador recebe 3 emails muito próximos (caso destinatário abra tudo de uma vez) | Média | Aceito no MVP — emails são curtos e celebratórios, não promocionais |
| Reset reseta marcos e gera novo email | Baixa | Marcos NÃO são removidos em reset (decisão explícita) |
| Crosssell vira spam | Média | Linguagem cuidadosa, link discreto ao final do email, não no centro |
| Falha no Resend trava `/api/cards/[id]/open` | Alta | try/catch + log; resposta da abertura é prioridade |

## Estimativa

6-8h: 1h schema + 1h repository + 2h templates de email (3×) + 1.5h triggers no /open + 2h timeline UI + 1h verificação E2E

## Validação pós-deploy

- Open rate dos emails de marco (esperado: >40% — emails curtos e relevantes)
- Click rate no link "Acessar painel" dos emails de marco (esperado: 15-25%)
- % de coleções que recebem ao menos 1 marco (E1) (esperado: alinha com taxa de envio + abertura)
- Crosssell de Mensagem Digital: cliques nos emails E2/E3 → conversão em /editor/mensagem
- % de aberturas em até 24h após o primeiro envio (sinal indireto da qualidade da Spec 3.3)
- Reclamações de "muitos emails" no suporte (esperado: zero — só 3 emails, espaçados pelo ritmo do destinatário)
