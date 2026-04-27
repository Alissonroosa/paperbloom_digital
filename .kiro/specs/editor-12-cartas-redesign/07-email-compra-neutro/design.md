# Spec 3.1 — Email de Compra Neutro + Recuperação de Acesso

## Problema

O email transacional atual de compra revela visualmente o produto ("12 Cartas Especiais para {Nome}!", QR code embutido, link das cartas em destaque). Isso quebra a privacidade do comprador em **dois cenários comuns**:

- **Tela pública**: comprador abre o email no trabalho, num celular emprestado, ou com a pessoa amada por perto — o conteúdo escapa antes da entrega planejada.
- **Notificação na lockscreen**: o assunto do email aparece como notificação push, dando spoiler.

Adicional: hoje **não existe forma de recuperar o link** se o comprador apagar o email ou trocar de email principal — o magic link some junto.

## Objetivo

Reformular o email de compra para ser **visualmente neutro** (Camada 1 de privacidade), e criar uma página `/recuperar-acesso` que reenvia o link do painel para qualquer email associado a uma compra.

A neutralidade é "comportamental, não criptográfica" — quem abre o email deliberadamente vê tudo. Mas:
- Assunto não revela conteúdo
- Preview de notificação não revela conteúdo
- O email só dá um botão "Acessar painel" — o produto fica atrás de um clique a mais

## Escopo (in)

### Email de compra
- Novo template em `EmailService.ts` (método `sendPaymentConfirmationEmail`)
- **Assunto**: "Seu presente está pronto 💌"
- **Pré-header**: "Acesse seu painel para ver e organizar"
- **Corpo**:
  - Logo Paperbloom (neutra, sem mencionar produto específico)
  - "Olá! Seu presente está pronto e te esperando no painel."
  - Botão grande: "Acessar painel" → `/painel/[token]`
  - Linha sutil: "Guarde este email — é a sua chave de acesso"
  - Footer com link para `/recuperar-acesso`
- **Sem QR code embutido**, **sem link direto das cartas**, **sem nome do destinatário no assunto**
- Trigger: webhook MP ao confirmar pagamento (substitui o email atual de "12 Cartas Especiais")

### Página `/recuperar-acesso`
- Rota: `src/app/(marketing)/recuperar-acesso/page.tsx`
- Form simples: input de email + botão "Enviar links"
- Backend: `POST /api/painel/recuperar-acesso` busca todas as `card_collections` com `contact_email = X` e dispara um email com **lista de painéis** (uma linha por coleção: "Para {Nome} — comprado em {data} — [Acessar]")
- Mensagem genérica de retorno: *"Se houver compras associadas a esse email, você receberá os links em instantes."* (não confirma se email existe — boa prática de privacidade)
- Sem captcha no MVP, mas com rate limit no servidor (3 requests/hora por IP)

## Escopo (out)

- **Camada 2 de privacidade** (PIN de acesso ao painel) — backlog MVP 2
- **Login com senha** — backlog MVP 2
- Email para o destinatário (`recipient_email`) — Spec 3.3 cuida do envio (manual via WhatsApp, não automático)
- Internacionalização do email (PT-BR apenas)
- Personalização visual avançada (apenas template básico no MVP)
- Histórico de envios de "recuperar acesso"

## Mudanças técnicas principais

### Schema
Coluna nova adicionada via migration `008_add_dashboard_token.sql` (compartilhada com Spec 3.2 — quem implementar primeiro cria, a outra reaproveita):
```sql
ALTER TABLE card_collections ADD COLUMN IF NOT EXISTS dashboard_token TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_card_collections_dashboard_token ON card_collections(dashboard_token);
```

### Backend
- `src/services/CardCollectionService.ts` — método `setDashboardToken(id, token)` (gera UUID v4 e persiste)
- `src/services/EmailService.ts` — método novo `sendPaymentConfirmationEmail(data)` substituindo o template antigo
- `src/app/api/payments/webhook/route.ts` (ou onde o webhook de MP processa) — após confirmar pagamento e criar token, chamar `sendPaymentConfirmationEmail`
- `src/app/api/painel/recuperar-acesso/route.ts` — endpoint POST com rate limit
- `src/services/EmailService.ts` — método `sendRecoverAccessEmail(email, panels[])`

### Frontend
- `src/app/(marketing)/recuperar-acesso/page.tsx` — form
- Footer global: link discreto "Perdi meu acesso" → `/recuperar-acesso`

## Critérios de aceite

### Funcional
- [ ] Após pagamento aprovado: email novo é disparado com assunto "Seu presente está pronto 💌"
- [ ] Email não contém o nome do destinatário em parte nenhuma
- [ ] Email não contém QR code nem link direto das cartas
- [ ] Único CTA do email é "Acessar painel" → `/painel/[token]`
- [ ] `/recuperar-acesso` aceita email e dispara email com lista de painéis associados
- [ ] Email com 0 compras associadas: nenhum email é enviado, mas resposta é igual à de email com compras (anti-enumeração)
- [ ] Rate limit: 3 requests/hora por IP retorna 429

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Migration `008` aplicada em staging
- [ ] Token único garantido por constraint UNIQUE no banco
- [ ] Webhook MP idempotente (não reenviar email se já enviou)

### UX
- [ ] Mobile (375px): email renderiza bem em Gmail/iOS Mail
- [ ] Notificação push do email mostra apenas "Seu presente está pronto"
- [ ] `/recuperar-acesso` funciona em tela 375px
- [ ] Microcopy do email é claro: comprador entende que precisa salvar/clicar para ver o presente

## Dependências

- ✅ EmailService já usa Resend e tem padrão de templates
- ⚠️ **Bloqueia em / coordena com Spec 3.2** — ambas precisam da migration `008_add_dashboard_token.sql`. Quem for implementada primeiro cria a migration; a segunda só usa.
- ✅ Webhook MP já existe e é onde o trigger entra

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Comprador pensa que email é spam (assunto vago) | Média | Pré-header explícito "Acesse seu painel para ver e organizar" + branding Paperbloom claro |
| Comprador apaga o email achando que não é importante | Média | Frase em destaque "Guarde este email — é a sua chave de acesso" |
| Token vaza em logs/analytics de URL | Média | Não logar `dashboard_token` em analytics; tratar como secret no backend |
| Webhook MP envia 2x e duplica email | Baixa | Idempotência: só envia se `dashboard_token` ainda não existe |
| `/recuperar-acesso` vira vetor de enumeração de emails | Média | Resposta sempre genérica, rate limit por IP |
| Template antigo continua sendo usado em algum fluxo | Baixa | Grep no código por `CardCollectionEmailData` antes de remover; MVP pode coexistir |

## Estimativa

3-5h: 30min migration + 1h webhook integration + 1.5h email templates novos + 1h página recuperar-acesso + verificação

## Validação pós-deploy

- Taxa de cliques no botão "Acessar painel" do email (esperado: alto, >70%)
- Volume de uso de `/recuperar-acesso` (esperado: baixo no início, sinaliza confusão se for alto)
- Reclamações no suporte sobre "perdi o link" (esperado: cair para zero)
- Tempo médio entre compra e primeiro acesso ao painel (esperado: <10 min)
