# Spec 3.3 — Tarefas

## Preparação

- [ ] **P1.** Confirmar que Spec 3.2 está implementada (`PainelClient` existe, `/painel/[token]` rota disponível)
- [ ] **P2.** Confirmar `analytics.ts` API atual e padrão de eventos (provavelmente PostHog ou similar)
- [ ] **P3.** Decidir microcopy da mensagem padrão com Alisson antes de codar (texto inicial congelado)

## Implementação

- [ ] **T1.** Helper `src/lib/share-message.ts`:
  ```ts
  export interface ShareMessageInput {
    recipientName: string;
    senderName: string;
    url: string;
  }
  export function buildShareMessage(input: ShareMessageInput): string {
    return `${input.recipientName}, preparei um presente especial pra você 💌\n\nPode abrir quando estiver com um momento só seu:\n${input.url}\n\nCom carinho,\n${input.senderName}`;
  }
  export function buildWhatsAppUrl(message: string): string {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  ```

- [ ] **T2.** Eventos novos em `src/lib/analytics.ts`:
  - `copyShareLink(collectionId: string)` — track 'painel_copy_link'
  - `openWhatsAppShare(collectionId: string)` — track 'painel_whatsapp_share'

- [ ] **T3.** Componente `src/components/painel/SendButton.tsx`:
  - Botão grande primary com label `"Enviar para {recipientName}"` (truncar se >30 chars)
  - Ícone de envelope/seta
  - Estado controlado: `isModalOpen` (vai para o componente pai)

- [ ] **T4.** Componente `src/components/painel/SendModal.tsx`:
  - Props: `{ isOpen; onClose; recipientName; senderName; collectionUrl; collectionId }`
  - Modal centralizado mobile-first (cobre tela em 375px)
  - Header: "Enviar presente para {Nome}"
  - Aviso explicativo
  - Bloco com mensagem padrão (computada via `buildShareMessage`)
  - Dois botões:
    - "📋 Copiar link" → `navigator.clipboard.writeText(url)` + analytics + feedback "Copiado!" 2s
    - "💬 Abrir WhatsApp" → `window.open(buildWhatsAppUrl(message), '_blank')` + analytics
  - Linha sutil sobre nova aba
  - Fecha ao clicar no overlay ou X

- [ ] **T5.** Integração no `PainelClient.tsx` (criado na Spec 3.2):
  - Importar `SendButton` e `SendModal`
  - Posicionar `SendButton` no topo (acima do `CardMap`)
  - Estado `[isSendOpen, setIsSendOpen]`
  - Renderizar `SendModal` quando aberto
  - Passar URL pública correta (`window.location.origin + '/cartas/' + collection.slug`)

- [ ] **T6.** Microcopy revisar com Alisson antes de publicar:
  - Aviso do modal
  - Mensagem padrão de WhatsApp
  - Labels dos botões

## Verificação

- [ ] **V1.** `npm run build` passa
- [ ] **V2.** `npx tsc --noEmit` passa
- [ ] **V3.** Smoke test mobile (375px):
  1. Acessar painel
  2. Clicar "Enviar para {Nome}" → modal abre
  3. Clicar "Copiar link" → feedback "Copiado!" + clipboard tem URL
  4. Clicar "WhatsApp" → app/aba abre com mensagem populada
  5. Fechar modal, reabrir várias vezes — sem efeitos estranhos
- [ ] **V4.** Testar em iOS Safari real ou simulador: `wa.me` abre no app nativo
- [ ] **V5.** Testar em Android: WhatsApp abre direto; se não instalado, abre `web.whatsapp.com` (fallback do navegador)
- [ ] **V6.** Confirmar que mensagem renderiza com quebras de linha corretas no WhatsApp (não vira tudo em uma linha só)
- [ ] **V7.** Eventos de analytics disparam (verificar no PostHog/console)

## Out of scope

- Tabela `card_collection_sends` (sem limite, sem necessidade)
- Cooldown / rate limit (sem limite)
- Mensagem editável pelo comprador
- Múltiplas variantes de mensagem
- Agendamento — backlog V2
- Email automático para destinatário
- SMS, Instagram Direct, outros canais
- Preview Open Graph do link no WhatsApp
- A/B test de mensagem padrão
