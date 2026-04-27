# Editor 12 Cartas — Redesenho Completo

## Visão Geral

Este conjunto de specs representa o redesenho completo da experiência do produto "12 Cartas" — desde o editor até o pós-pagamento. O objetivo central é resolver a queda de conversão observada em campanhas Meta Ads onde usuários clicam, navegam pelo editor mas não chegam ao checkout.

**Hipótese principal:** o usuário investe tempo significativo preenchendo o editor sem ver preço nem elementos de convicção, e quando finalmente chega ao checkout, abandona por falta de ancoragem de valor.

**Estratégia:** transformar o editor em uma experiência de venda guiada que:
1. Ancora preço e prova social desde o primeiro step
2. Reduz o trabalho pesado antes do checkout (templates pré-aplicados)
3. Reposiciona copy de "compra" para "presente"
4. Cria loop emocional pós-compra (dashboard + emails de marco)

## Fases e Specs

### Fase 1 — Quick wins no editor atual (1-2 dias, alto ROI, baixo risco)

Mudanças aditivas que preservam o fluxo atual de 6 steps. Objetivo: mover métrica de conversão antes de refatorar estrutura.

| ID | Spec | Status | Resumo |
|---|---|---|---|
| 1.1 | [editor-ancoragem-preco](./01-editor-ancoragem-preco/design.md) | ✅ Implementado | Badge persistente de preço (De/Por) em todos os steps do editor |
| 1.2 | [editor-copy-presente](./02-editor-copy-presente/design.md) | ✅ Implementado | Reframing de copy: "presentear {nome}" em vez de "finalizar compra" |

### Fase 2 — Refactor do editor (1 semana)

Reduz 6 steps para 4 e elimina a maior parte do trabalho manual obrigatório.

| ID | Spec | Status | Resumo |
|---|---|---|---|
| 2.1 | [editor-step3-grid-consolidado](./03-editor-step3-grid-consolidado/design.md) | ✅ Implementado | Consolida Steps 3-5 em grid único de 12 cartas com templates pré-aplicados + edição opcional |
| 2.2 | [editor-step1-mini-hero](./04-editor-step1-mini-hero/design.md) | ✅ Implementado | Mini-hero no Step 1 (headline + vídeo MP4 real + social proof). Assets de vídeo pendentes — fallback ativo |
| 2.3 | [editor-step4-preview-checkout](./05-editor-step4-preview-checkout/design.md) | ✅ Implementado | Step 4 unificado: preview da 1ª carta + 11 embaçadas + checkout enxuto (só nome + email) |
| 2.4 | [editor-foto-capa-unica](./06-editor-foto-capa-unica/design.md) | ✅ Implementado | Step 2 com foto capa única reaproveitada em todas as cartas |

### Fase 3 — Dashboard + comunicação (2 semanas)

Pós-compra: cria loop emocional contínuo e estabelece base para crosssell.

| ID | Spec | Status | Resumo |
|---|---|---|---|
| 3.1 | [email-compra-neutro](./07-email-compra-neutro/design.md) | 📝 Spec pronta | Email de compra visualmente neutro (assunto "Seu presente está pronto 💌") + `/recuperar-acesso` com rate limit |
| 3.2 | [dashboard-comprador-base](./08-dashboard-comprador-base/design.md) | 📝 Spec pronta | `/painel/[token]` com magic link sem expiração + mapa visual das 12 cartas + preview + QR (download) + editar (até 1ª abertura) + reset individual/total + crosssell. Redirect 301 de `/delivery/c/[id]` |
| 3.3 | [dashboard-acoes-envio](./09-dashboard-acoes-envio/design.md) | 📝 Spec pronta | Botão "Enviar para {Nome}" + modal com mensagem padrão + copiar link / abrir WhatsApp. Sem limite, sem cooldown, sem agendamento (V2) |
| 3.4 | [emails-marcos-emocionais](./10-emails-marcos-emocionais/design.md) | 📝 Spec pronta | 3 emails de marco (1ª carta, metade, todas) disparados no `/api/cards/[id]/open` + crosssell Mensagem Digital + timeline visual no painel. Idempotente via tabela de marcos. Sem cron — emails de encerramento/silêncio movidos para V2 |

## Backlog (MVP 2)

Decisões explicitamente adiadas para uma segunda iteração após validação do MVP 1:

- Nudge de personalização no Step 3 ("que tal personalizar pelo menos 1-2?")
- Foto personalizada por carta (interface no Step 2)
- Camada 2 de privacidade (PIN no dashboard)
- Login com senha
- Calendário completo de campanhas sazonais (Dia dos Namorados, Dia das Mães etc.)
- Upsell automatizado dentro do dashboard (banners, popups)
- **3.5 — Agendamento de envios** (escolher data/hora futura, lembrete por email, cancelar/editar agendamento)
- **Emails de encerramento e silêncio** (E4 e E5 da Spec 3.4 — precisam de cron job)
- Mensagem padrão de WhatsApp editável pelo comprador
- Email automático para o destinatário (alternativa ao WhatsApp manual)
- Opt-out granular de emails de marco

## Princípios de execução

1. **Aditivo > destrutivo**: componentes novos convivem com os antigos até estarem validados. Rotas antigas continuam funcionando.
2. **Reuso do que já existe**: `usePrices`, `FullscreenStep`, `InteractiveWizardContext`, `CardCollectionEditorContext`, `analytics.*` — aproveitar em vez de recriar.
3. **Mudança mínima por spec**: cada spec toca o menor conjunto de arquivos possível. Sem refactor oportunista.
4. **Sem quebrar contratos**: APIs existentes (`/api/card-collections/*`, `/api/checkout/*`) continuam retornando o mesmo shape.
5. **Mobile-first**: 90%+ do tráfego é Meta Ads em mobile. Cada spec valida em 375px de largura.

## Ordem de execução recomendada

```
Fase 1 (paralelo: 1.1 + 1.2)
  ↓
[Validação 1-2 semanas com dados reais de conversão]
  ↓
Fase 2 (sequencial: 2.4 → 2.1 → 2.2 → 2.3, pois 2.3 depende dos outros)
  ↓
[Validação 1 semana]
  ↓
Fase 3 (paralelo: 3.1 + 3.2 → 3.3 → 3.4)
```

## Métricas a acompanhar

**Funil:**
- Taxa de avanço em cada step do editor
- Taxa de chegada no checkout
- Taxa de conversão do checkout (% que paga após chegar no Step 6)
- Receita por visitante do editor

**Pós-compra (após Fase 3):**
- Taxa de acesso ao dashboard após compra
- Taxa de envio (por modalidade)
- Taxa de aberturas em até 24h após envio
- Taxa de cumprimento (12/12 cartas abertas)
- Conversão dos emails de crosssell

## Referências

- Decisões consolidadas: registro acumulado da conversa de planejamento (Abr/2026)
- Schema atual: [src/types/card.ts](../../../src/types/card.ts) — `openedAt` já existe
- Pricing dinâmico: [src/hooks/usePrices.ts](../../../src/hooks/usePrices.ts) — já suporta `priceFromFormatted`
- Padrão de wizard: [src/types/interactive-wizard.ts](../../../src/types/interactive-wizard.ts)
