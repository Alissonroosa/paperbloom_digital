# Spec 3.1 — Tarefas

## Preparação

- [ ] **P1.** Confirmar onde o webhook MP processa pagamento aprovado e dispara email atual (provavelmente `src/app/api/payments/webhook/route.ts` ou `src/app/api/webhook/mercadopago/route.ts` — grep por "sendCardCollectionEmail" ou similar)
- [ ] **P2.** Confirmar `EmailService` API (`sendCardCollectionEmail` é o método atual?) e padrão de templates
- [ ] **P3.** Verificar se existe utilitário de rate limit (ex: `lib/rate-limit.ts`); se não, decidir entre upstash/redis ou implementação simples em memória/banco

## Implementação

### Schema + tipos
- [ ] **T2.** Atualizar `CardCollection` interface + `CardCollectionRow` + `rowToCardCollection()` em `src/types/card.ts`
- [ ] **T3.** `CardCollectionService`:
  - Método `findByDashboardToken(token)`
  - Método `setDashboardToken(id, token)` (idempotente: se já existe, retorna o existente)

### Email neutro
- [ ] **T4.** `EmailService.sendPaymentConfirmationEmail(data: { contactEmail; contactName; collectionId; dashboardToken; })`:
  - Assunto: `Seu presente está pronto 💌`
  - Pré-header (preheader): `Acesse seu painel para ver e organizar`
  - Template HTML neutro com botão único "Acessar painel" → `${baseUrl}/painel/${dashboardToken}`
  - Sem nome do destinatário, sem QR, sem link direto das cartas
  - Footer: link discreto "Perdi meu acesso" → `/recuperar-acesso`
- [ ] **T5.** Webhook MP: ao confirmar pagamento, gerar token (uuid v4), persistir, e disparar `sendPaymentConfirmationEmail`. Garantir idempotência (não enviar se já enviou).
- [ ] **T6.** Deprecar/remover chamadas ao template antigo (`sendCardCollectionEmail`) — substituir pelo neutro

### Recuperar acesso
- [ ] **T7.** `src/app/api/painel/recuperar-acesso/route.ts`:
  - Validador zod: `{ email: string().email() }`
  - Rate limit: 3 requests/hora por IP (header `x-forwarded-for` ou `request.ip`)
  - Busca via `CardCollectionService.findByContactEmail(email)` (criar método se não existir)
  - Para cada coleção paga, gerar/recuperar token e montar lista
  - Disparar `EmailService.sendRecoverAccessEmail(email, panels[])`
  - Resposta sempre 200 com mensagem genérica
- [ ] **T8.** `EmailService.sendRecoverAccessEmail(email, panels)`:
  - Assunto: `Seus painéis Paperbloom`
  - Lista cada painel: "Para {recipientName} — comprado em {data} — [Acessar painel]" (link com token embutido)
- [ ] **T9.** `src/app/(marketing)/recuperar-acesso/page.tsx`:
  - Form com input email + botão "Enviar links"
  - Após submit: mensagem genérica "Se houver compras associadas a esse email, você receberá os links em instantes."
  - Estado: idle / loading / success / error
- [ ] **T10.** Footer global ou página de erro genérica: link "Perdi meu acesso" → `/recuperar-acesso`

## Verificação

- [ ] **V1.** `npm run build` passa
- [ ] **V2.** `npx tsc --noEmit` passa
- [ ] **V3.** Smoke test E2E:
  1. Fazer compra simulada (ambiente sandbox MP)
  2. Receber email com assunto "Seu presente está pronto 💌"
  3. Confirmar que email não menciona destinatário, não tem QR, só botão "Acessar painel"
  4. Clicar no botão → `/painel/[token]` carrega (página da Spec 3.2)
- [ ] **V5.** Testar `/recuperar-acesso`:
  1. Submeter email que tem compra → recebe lista de painéis
  2. Submeter email aleatório → recebe resposta genérica, sem email enviado
  3. 4ª request em <1h → retorna 429
- [ ] **V6.** Verificar em mobile (375px) que email renderiza bem em Gmail/Outlook/iOS Mail
- [ ] **V7.** Confirmar que push notification do email mostra só "Seu presente está pronto"

## Out of scope

- PIN de acesso ao painel (Camada 2) — backlog MVP 2
- Login com senha — backlog MVP 2
- Captcha no `/recuperar-acesso`
- Email para o destinatário (Spec 3.3 cobre via WhatsApp)
- A/B testing de assunto do email
- Personalização visual do email além do template básico
- Internacionalização (PT-BR apenas)
