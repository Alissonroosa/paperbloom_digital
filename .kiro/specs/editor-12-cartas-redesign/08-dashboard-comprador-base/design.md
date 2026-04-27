# Spec 3.2 — Dashboard do Comprador (Base)

## Problema

Após pagamento aprovado, o comprador é jogado em `/delivery/c/[collectionId]`, uma página estática que mostra QR + link + crosssell físico. Faltam **ações reais de pós-compra**:

- Não dá para preview do produto sem expor para o destinatário
- Não dá para reabrir/resetar carta aberta sem querer
- Não dá para editar conteúdo após pagar (mesmo antes de qualquer abertura)
- Não dá para acompanhar status (quem abriu o quê)
- Não dá para entender que o "presente" continua vivo — a página parece final
- Não tem modo persistente de acesso (depende do email único enviado uma vez)

A consequência é que o comprador trata a entrega como evento único e não retorna — o que mata a base para emails de marco, crosssell e timeline emocional (Spec 3.4).

## Objetivo

Criar `/painel/[token]` como **lar permanente do comprador** após a compra, acessado via magic link sem expiração. Esta spec entrega a **base estrutural** do painel (estado, dados, layout). As ações de envio ficam na Spec 3.3 e a timeline emocional fica na Spec 3.4.

A página `/delivery/c/[collectionId]` antiga é descontinuada — redirect 301 para `/painel/[token]`.

## Escopo (in)

### Schema
- Migration `008_add_dashboard_token.sql` (compartilhada com Spec 3.1):
  ```sql
  ALTER TABLE card_collections ADD COLUMN IF NOT EXISTS dashboard_token TEXT UNIQUE;
  CREATE INDEX IF NOT EXISTS idx_card_collections_dashboard_token ON card_collections(dashboard_token);
  ```
- Webhook MP gera token (uuid v4) ao confirmar pagamento (compartilhado com Spec 3.1)

### Rota e API
- `src/app/(marketing)/painel/[token]/page.tsx` — página principal do painel
- `src/app/api/painel/[token]/route.ts` — GET retorna `{ collection, cards, stats }`
- 404 se token inválido; nunca expor `collection.id` na URL pública

### Layout do painel
Vertical, mobile-first, max-width ~600px:

1. **Header**: "Para {recipientName}" + status pill (`Não enviado` / `Enviado` / `Em andamento` / `Completo`)
2. **Mapa visual das 12 cartas**: grid 4×3 com cada carta colorida por status:
   - 🟢 verde: aberta com `openedAt`
   - ⚪️ branca: ainda não aberta
   - Cada carta clicável → `CardActionModal` (ver seção "Edição inline" abaixo)
3. **Bloco "Detalhes do presente"** (edição inline dos dados globais — ver seção "Edição inline" abaixo)
4. **Bloco de compartilhamento**:
   - QR code (imagem grande)
   - Botão "Baixar QR Code" (porta `handleDownloadQRCode` da página delivery atual)
   - Link compartilhável + botão copiar
5. **Card de crosssell** (discreto): "Já tem 12 cartas. Que tal uma Mensagem Digital pra outra ocasião?" → link `/mensagem-digital`
6. **Footer**: link "Perdi meu acesso" → `/recuperar-acesso`

### Edição inline (decisão de UX)

Toda a edição acontece **dentro do painel**, sem abrir o editor `/editor/12-cartas`. Reusa os modais que já existem (`EditMessageModal.tsx`, `PhotoUploadModal.tsx`).

#### Camada 1 — Cartas individuais (mapa)
Clique numa carta abre **`CardActionModal`** (componente novo, simples wrapper de estado):

- **Se carta NÃO foi aberta** (`openedAt === null`):
  - Conteúdo: preview do que está salvo (título + mensagem + foto se houver) + badge "PRÉ-VISUALIZAÇÃO"
  - Botões no rodapé:
    - `✏️ Editar mensagem` → abre `EditMessageModal` (existente)
    - `📸 Editar foto` → abre `PhotoUploadModal` (existente)
- **Se carta FOI aberta** (`openedAt !== null`):
  - Conteúdo: preview + badge "JÁ ABERTA POR {Nome}" + data de abertura
  - Botão único: `🔓 Resetar carta` (com confirmação: *"Esta carta voltará a ser uma surpresa. {Nome} poderá abri-la de novo."*)

#### Camada 2 — Detalhes globais (bloco "Detalhes do presente")
5 itens em formato de lista clicável dentro de um card:

| Item | Estado vazio | Estado preenchido | Modal aberto |
|---|---|---|---|
| 📸 Foto da capa | "Adicionar capa" | thumbnail + "Trocar" | `EditCoverPhotoModal` (novo, inline upload simples) |
| 💬 Mensagem inicial | "Adicionar mensagem" | preview 2 linhas + "Editar" | `EditIntroMessageModal` (novo, textarea) |
| 🎵 Música de fundo | "Adicionar música" | título do vídeo + "Mudar" | `EditMusicModal` (novo, input de URL YouTube) |
| 💝 Para: {Nome} | sempre preenchido | nome + "Renomear" | `EditFieldModal` genérico (input texto) |
| 💜 De: {Nome} | sempre preenchido | nome + "Renomear" | `EditFieldModal` genérico (input texto) |

Cada modal é **pequeno e focado** num único campo. Salva via `PATCH /api/card-collections/[id]` (já existe).

#### Bloqueio quando alguma carta foi aberta
Se `cards.some(c => c.openedAt !== null)`:
- **Camada 1**: cartas abertas só mostram preview + reset (já é o comportamento). Cartas fechadas continuam editáveis normalmente — *cada carta tem seu próprio bloqueio*.
- **Camada 2**: bloco inteiro "Detalhes do presente" vira card cinza:
  > 🔒 **Detalhes trancados**
  > A primeira carta já foi aberta. Para alterar capa, mensagem ou música, resete a carta primeiro.

#### Bloco "Resetar todas"
- Renderizado **abaixo** do mapa quando `cards.filter(c => c.openedAt !== null).length >= 2`
- Botão "Resetar todas as cartas abertas" + confirmação clara

### APIs novas
- `POST /api/cards/[id]/reset` — limpa `opened_at`, volta `status` para `'unopened'`
- `POST /api/card-collections/[id]/reset-all` — reseta todas as cartas da coleção

### APIs reaproveitadas (sem mudança)
- `PATCH /api/card-collections/[id]` — já existe; usado pelos modais da Camada 2
- `PATCH /api/cards/[id]` — já existe; usado pelos modais da Camada 1 via `EditMessageModal` e `PhotoUploadModal`

### Redirects
- `/delivery/c/[collectionId]` → 301 para `/painel/[token]` (gerar/recuperar token via collectionId no servidor)
- Webhook MP `back_urls.success`: ainda vai para `/success`, mas `/success` page lê collectionId via session/preference e redireciona para `/painel/[token]`

### Bloqueio de edição (server-side)
- `PATCH /api/card-collections/[id]` recusa update (409) se algum card da coleção tem `openedAt !== null` E o body tenta mudar `coverImageUrl`, `introMessage`, `youtubeVideoId`, `recipientName` ou `senderName`
- `PATCH /api/cards/[id]` recusa update (409) se aquele card específico tem `openedAt !== null`
- Frontend já bloqueia visualmente, mas backend é a verdade — nunca confie no client

## Escopo (out)

- **Ações de envio (botão "Enviar para {Nome}", modal WhatsApp)** — Spec 3.3
- **Timeline cronológica + emails de marco** — Spec 3.4
- **Agendamento de envios** — backlog V2
- **PIN/login** — backlog MVP 2
- Editar conteúdo após 1ª abertura — fora do MVP (opção é resetar carta primeiro)
- Painel para outros produtos (Mensagem Digital, Revelação Virtual) — específico de 12 Cartas no MVP

## Mudanças técnicas principais

### Schema
- Migration `008_add_dashboard_token.sql` (mesma da Spec 3.1)

### Backend
- `CardCollectionService.findByDashboardToken(token)` (compartilhado com 3.1)
- `CardCollectionService.setDashboardToken(id, token)` (compartilhado)
- `CardService.reset(cardId)` — limpa `opened_at` e `status`
- `CardService.resetAllForCollection(collectionId)`
- `PATCH /api/card-collections/[id]` — adicionar guarda contra edição se houver carta aberta
- Webhook MP — gerar token + persistir (compartilhado com 3.1)
- `/success` page — após confirmar pagamento, redirecionar para `/painel/[token]`
- `/delivery/c/[collectionId]` — redirect 301

### Frontend
- `src/app/(marketing)/painel/[token]/page.tsx` — server component que busca dados, passa para client
- `src/components/painel/PainelClient.tsx` — wrapper client com estado dos modais
- `src/components/painel/CardMap.tsx` — grid 4×3 visual
- `src/components/painel/CardActionModal.tsx` — modal único da Camada 1 (preview + ações condicionais)
- `src/components/painel/CollectionDetailsPanel.tsx` — bloco "Detalhes do presente" (Camada 2) com lista clicável
- `src/components/painel/modals/EditCoverPhotoModal.tsx` — upload inline da capa
- `src/components/painel/modals/EditIntroMessageModal.tsx` — textarea para `introMessage`
- `src/components/painel/modals/EditMusicModal.tsx` — input URL YouTube + extração de `videoId`
- `src/components/painel/modals/EditFieldModal.tsx` — modal genérico para campos de texto curto (nomes)
- `src/components/painel/SharePanel.tsx` — QR + link + downloads
- `src/components/painel/ResetAllPanel.tsx` — botão "Resetar todas" (visível com ≥2 abertas)
- `src/components/painel/CrossSellCard.tsx` — link Mensagem Digital
- **Reuso direto** dos modais existentes (sem mudança):
  - `src/components/card-editor/modals/EditMessageModal.tsx`
  - `src/components/card-editor/modals/PhotoUploadModal.tsx`

## Critérios de aceite

### Funcional
- [ ] `/painel/[token]` carrega coleção correta via token
- [ ] Token inválido retorna 404
- [ ] Mapa visual mostra status correto de cada uma das 12 cartas
- [ ] Clicar em carta fechada no mapa abre `CardActionModal` com preview + botões "Editar mensagem" e "Editar foto"
- [ ] Clicar em carta aberta abre `CardActionModal` com preview + botão "Resetar carta"
- [ ] `EditMessageModal` salva alterações via `PATCH /api/cards/[id]`
- [ ] `PhotoUploadModal` salva foto via `PATCH /api/cards/[id]`
- [ ] Bloco "Detalhes do presente" mostra 5 itens clicáveis (capa, intro, música, para, de)
- [ ] Cada item abre seu próprio modal focado e salva via `PATCH /api/card-collections/[id]`
- [ ] Após qualquer carta ser aberta: bloco "Detalhes do presente" vira card cinza "Detalhes trancados"
- [ ] Cartas fechadas continuam editáveis individualmente, mesmo se outra estiver aberta
- [ ] Backend recusa update (409) se a regra de bloqueio for violada
- [ ] Botão "Resetar todas" aparece quando ≥2 cartas abertas
- [ ] Confirmação antes de resetar (modal claro)
- [ ] Reset volta `status: 'unopened'` e `openedAt: null` no banco
- [ ] Botão "Baixar QR Code" funciona
- [ ] Botão "Copiar link" copia URL pública das cartas (`/cartas/[slug]`)
- [ ] Card crosssell linka para `/mensagem-digital`
- [ ] `/delivery/c/[collectionId]` redireciona 301 para `/painel/[token]`
- [ ] `/success` redireciona para `/painel/[token]` após webhook processar

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Migration `008` aplicada em staging
- [ ] `PATCH /api/card-collections/[id]` recusa update (409) se houver carta aberta
- [ ] APIs de reset retornam 401 sem token válido (ou exigem header de origem do painel)

### UX
- [ ] Mobile (375px): layout vertical, todos elementos acessíveis
- [ ] Mapa visual responde bem ao toque (área de toque ≥44px)
- [ ] Modal de preview da carta tem indicador claro "PRÉ-VISUALIZAÇÃO" no topo
- [ ] Reset tem confirmação que deixa claro o impacto

## Dependências

- ⚠️ **Coordena com Spec 3.1** para a migration `008` e geração do token no webhook
- ✅ Sistema de QR code já existe (gerado no webhook)
- ✅ Modais `EditMessageModal` e `PhotoUploadModal` já existem em `src/components/card-editor/modals/` — reuso direto
- ✅ APIs `PATCH /api/cards/[id]` e `PATCH /api/card-collections/[id]` já existem
- ⚠️ Webhook MP precisa de ajuste para gerar token + redirecionar success → painel

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| `EditMessageModal`/`PhotoUploadModal` exigem props específicas do editor | Baixa | Inspecionar contratos; se necessário, criar wrapper fino que adapta |
| Reset quebra contadores de marcos (Spec 3.4) | Média | Spec 3.4 idempotente: marco já enviado não dispara de novo |
| Token vaza em logs/analytics | Média | Não logar URL completa em analytics; tratar como secret no backend |
| Comprador clica `CardActionModal` achando que é abertura real | Alta | Indicador visual forte: badge "PRÉ-VISUALIZAÇÃO", cor diferente, sem animação de "abrir carta" |
| Link 301 antigo é perdido em buscadores externos | Baixa | Manter redirect permanente; sitemap atualizado |
| Crosssell vira ruído visual | Média | Discreto: card pequeno no rodapé, não popup |
| 5 modais separados na Camada 2 viram fricção | Baixa | Cada modal é pequeno e foca em 1 campo — ação rápida em mobile |

## Estimativa

10-14h: 1h schema + token + 1h reset APIs + 1h redirects + 1h bloqueio server-side + 4-6h UI do painel (mapa + detalhes + share) + 2h modais inline (CardActionModal + 4 modais focados) + 1h verificação E2E

## Validação pós-deploy

- % de compradores que acessam `/painel/[token]` ao menos uma vez (esperado: >80%)
- Tempo médio entre compra e primeiro acesso (esperado: <10 min)
- % de cartas resetadas (esperado: <5% — sinal saudável; >15% indica problema na 1ª experiência)
- % de coleções editadas após pagamento (esperado: 10-20% — confirma valor da feature)
- Cliques no crosssell vs sessões no painel (esperado: 1-3% no MVP)
