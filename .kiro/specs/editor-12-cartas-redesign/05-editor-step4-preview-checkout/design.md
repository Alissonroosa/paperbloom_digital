# Spec 2.3 — Editor: Step Final Unificado (Preview + Checkout)

## Problema

O Step 6 atual é apenas um formulário de contato + resumo de pedido + botão de pagar. O usuário **nunca vê o produto antes de pagar** — só vai ver depois de pagar e abrir o link recebido por email. Falta de tangibilidade no momento mais crítico do funil.

Adicional: o formulário tem campo de **telefone obrigatório**, que cria fricção sem propósito (não há envio físico nem comunicação por WhatsApp planejada para o MVP).

## Objetivo

Transformar o último step em uma **experiência de convicção final** com 2 blocos verticais:

1. **Bloco superior — Demo ao vivo**: 1 carta real do usuário renderizada com animação de abertura (mostra a foto, mensagem, transição). As outras 11 cartas ficam visíveis num grid embaçado com ícone de cadeado.
2. **Bloco inferior — Checkout enxuto**: form com apenas nome + email (sem telefone) + CTA emocional "💌 Presentear {nome} agora" + order summary minimalista.

Microcopy de gatilho entre os blocos: "Veja como a 1ª carta ficou. Libere as outras 11 agora."

Reduz o editor de **5 → 4 steps** (após Spec 2.1 já ter reduzido de 6 → 5).

## Escopo (in)

- Criar `Step4Preview.tsx` em `src/app/(fullscreen)/editor/12-cartas/steps/`
- Reaproveitar componente de animação de carta (`CardCollectionViewer` ou similar — ver `src/components/card-viewer/`)
- Render: passar apenas `cards[0]` para o viewer no modo "1 carta destravada"
- Grid de 11 cartas embaçadas: simples grid com `filter: blur(6px)` + ícone de cadeado central
- Form: copiar lógica do Step6Contact existente, mas remover input/validação de `contactPhone`
- CTA: "💌 Presentear {nome} agora" (já implementado em Spec 1.2)
- Order summary: aplicar reframing já feito em Spec 1.2
- Atualizar `src/app/(fullscreen)/editor/12-cartas/page.tsx`:
  - Substituir `Step6Contact` por `Step4Preview` no bloco `currentStep === 3`
  - Atualizar `STEP_NAMES[3]: 'Dados para Envio' → 'Pré-visualização e Checkout'`
- Atualizar `CARD_COLLECTION_CONFIG.totalSteps: 5 → 4` em `src/types/interactive-wizard.ts`
- API `/api/checkout/card-collection`: tornar `contactPhone` opcional no validador
- Deletar `Step6Contact.tsx` após migração

## Escopo (out)

- Schema migration removendo coluna `contact_phone` (deixar nullable, nunca era usado de verdade)
- Mudanças no fluxo do Mercado Pago / webhook
- Página `/delivery` (Fase 3 funde com `/dashboard`)
- Captura de telefone para WhatsApp marketing (Fase futura)

## Mudanças técnicas principais

### Arquivos criados
- `src/app/(fullscreen)/editor/12-cartas/steps/Step4Preview.tsx`
- (opcional, se virar reutilizável) `src/components/interactive-wizard/LockedCardsGrid.tsx`

### Arquivos editados
- `src/app/(fullscreen)/editor/12-cartas/page.tsx` — substituir Step6Contact por Step4Preview, ajustar STEP_NAMES
- `src/types/interactive-wizard.ts` — `CARD_COLLECTION_CONFIG.totalSteps: 5 → 4`
- `src/app/api/checkout/card-collection/route.ts` (ou similar) — tornar `contactPhone` opcional no schema de validação

### Arquivos deletados
- `src/app/(fullscreen)/editor/12-cartas/steps/Step6Contact.tsx` (após copiar lógica de checkout)

## Critérios de aceite

### Funcional
- [ ] Editor abre em **4 steps** (após Spec 2.1 + 2.3 aplicadas)
- [ ] Step 4 mostra 1 carta real do usuário com animação de abertura funcional
- [ ] 11 cartas restantes visíveis em grid embaçado com ícone de cadeado
- [ ] Form mostra apenas nome + email (sem telefone)
- [ ] CTA "💌 Presentear {nome} agora" cria checkout MP corretamente
- [ ] Webhook MP processa pedido sem `contactPhone` (deixa nullable)

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Schema do banco aceita `contact_phone NULL` (já é nullable ou tornar)
- [ ] Sem regressão em coleções já criadas com telefone

### UX
- [ ] Mobile (375px): demo ao vivo carrega rápido, animação suave
- [ ] Animação não trava o scroll
- [ ] CTA acessível (não fica abaixo da dobra após scroll do form)
- [ ] Microcopy clara: usuário entende que está pagando pelas 12 cartas (não só pela 1ª)

## Dependências

- ⚠️ **Bloqueia em Spec 2.1** estar implementada (totalSteps já em 5)
- ⚠️ Identificar componente correto de animação:
  - `CardCollectionViewer.tsx` em `src/components/card-viewer/` parece ser o candidato
  - Verificar se aceita modo "preview" ou "1 carta only"
- ✅ Spec 1.2 já fez o reframing do CTA e do order summary

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Render da animação pesa o step | Média | Lazy load, render só quando step ativo |
| 1ª carta sem foto/mensagem editada vira placeholder feio | Alta | Garantir que template IA tenha conteúdo razoável (já tem); fallback "veja como vai ficar" |
| Webhook MP quebra sem `contactPhone` | Baixa | Tornar nullable; nunca era usado em lógica de envio |
| Usuário interpreta "1 carta destravada" como "comprei só 1 carta" | Média | Microcopy clara: "Veja a 1ª pronta. Libere as 11 restantes agora." + visual de cadeado óbvio |
| `CardCollectionViewer` não suporta modo "preview" | Média | Criar wrapper que passa só `cards.slice(0,1)` ou implementar visual estático com animação simples |

## Estimativa

3-5h: 2h preview/animação + 1h reestrutura form + 1-2h ajustes mobile + verificação E2E

## Validação pós-deploy

- Conversão Step 4 → checkout MP iniciado (esperado: subir significativamente)
- Tempo médio no Step 4 (esperado: subir — usuário interage com a demo)
- Taxa de abandono entre form preenchido e clique no CTA (esperado: cair)
- Comparação: telefone removido vs antes (impacto direto na conclusão do form)
