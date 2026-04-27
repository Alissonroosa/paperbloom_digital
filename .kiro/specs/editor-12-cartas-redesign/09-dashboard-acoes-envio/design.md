# Spec 3.3 — Dashboard: Ações de Envio (WhatsApp)

## Problema

Mesmo com o painel base (Spec 3.2), o comprador ainda precisa **descobrir sozinho** como entregar o presente: copiar o link, abrir WhatsApp, escrever uma mensagem que faça sentido. Esse atrito invisível faz muita gente:

- Procrastinar a entrega ("envio depois quando tiver tempo")
- Mandar um link cru sem contexto ("Olha, abre isso aqui") que diminui o impacto emocional
- Esquecer que a compra existe

Hoje o painel atual (`/delivery/c/[id]`) tem só "Copiar link" — a barreira do "como vou apresentar isso?" continua.

## Objetivo

Criar um botão de destaque **"Enviar para {Nome}"** no painel que abre um modal único com:
- Mensagem padrão pronta para ser enviada
- Botão "Copiar link" (clipboard)
- Botão "Abrir WhatsApp" (deep link `wa.me`)

Sem agendamento, sem limite, sem cooldown — comprador é dono do timing. A simplicidade é proposital pra MVP: nada de email automático, nada de filas de envio.

## Escopo (in)

### Componente
- `src/components/painel/SendButton.tsx` — botão grande no topo do painel (acima do mapa de cartas)
- `src/components/painel/SendModal.tsx` — modal disparado pelo botão

### Conteúdo do modal
1. **Header**: "Enviar presente para {Nome}"
2. **Aviso curto** acima da preview:
   *"Vamos copiar uma mensagem prontinha e abrir o WhatsApp pra você terminar de enviar 💌"*
3. **Preview da mensagem padrão** (em bloco com fundo cinza, fonte mono):
   ```
   {Nome}, preparei um presente especial pra você 💌
   
   Pode abrir quando estiver com um momento só seu:
   {linkCartas}
   
   Com carinho,
   {SenderName}
   ```
4. **Dois botões lado a lado**:
   - "📋 Copiar link" (copia só o link público das cartas)
   - "💬 Abrir WhatsApp" (abre `https://wa.me/?text={mensagemEncoded}`)
5. **Linha sutil**: *"O WhatsApp vai abrir em uma nova aba/app. Você escolhe pra quem enviar."*

### Comportamentos
- Botão "Copiar link" mostra feedback de sucesso ("Copiado!" por 2s)
- Botão "WhatsApp" abre `wa.me/?text=...` (sem número — usuário escolhe destinatário no app do WhatsApp)
- Sem registro de envio no banco (sem tabela `card_collection_sends`)
- Sem cooldown, sem limite de cliques
- Analytics client-side opcional: `analytics.painel('copy_link' | 'open_whatsapp', collectionId)` — só pra entender uso, não pra restringir

### Mensagem padrão
- Texto inicial **fixo no MVP** (não editável)
- Variáveis substituídas: `{Nome}` = recipientName, `{SenderName}` = senderName, `{linkCartas}` = URL pública

### Outros canais (botão secundário)
- Abaixo dos botões principais, link discreto: *"Ou copie só o link e use o canal que preferir (Instagram, SMS, etc)"*
- Já está atendido pelo botão "Copiar link" — só clarifica

## Escopo (out)

- **Agendamento de envios** — backlog V2 (precisa de cron + tabela + emails transacionais; complexidade incompatível com MVP)
- **Tracking de envios no banco** (tabela `card_collection_sends`) — não há limite, então não precisa
- Mensagem editável pelo comprador
- Múltiplas variantes de mensagem (formal/informal/etc)
- Preview de como vai aparecer no WhatsApp (Open Graph)
- Envio direto por email para o destinatário — explicitamente fora (decisão do MVP: WhatsApp manual reduz risco de spam)
- SMS via API
- Compartilhamento via Instagram Direct API (não existe API oficial pra isso)

## Mudanças técnicas principais

### Backend
- **Nenhuma mudança de schema**
- **Nenhuma API nova**
- O modal só lê dados que já estão na coleção (`recipientName`, `senderName`, URL pública via `slug`)

### Frontend
- `src/components/painel/SendButton.tsx`
- `src/components/painel/SendModal.tsx`
- Integração no `PainelClient.tsx` da Spec 3.2
- Helper `src/lib/share-message.ts` — função `buildShareMessage({ recipientName, senderName, url })` que retorna a string

### Analytics
- `src/lib/analytics.ts` — eventos novos:
  - `analytics.copyShareLink(collectionId)`
  - `analytics.openWhatsAppShare(collectionId)`

## Critérios de aceite

### Funcional
- [ ] Botão "Enviar para {Nome}" aparece no topo do painel
- [ ] Clicar abre modal com mensagem padrão visível
- [ ] Botão "Copiar link" copia URL pública das cartas (`/cartas/[slug]`)
- [ ] Botão "WhatsApp" abre `wa.me/?text=...` em nova aba
- [ ] Mensagem do WhatsApp tem `{Nome}` e `{SenderName}` substituídos
- [ ] Modal pode ser aberto e fechado várias vezes sem efeitos colaterais
- [ ] Sem limite de cliques, sem cooldown
- [ ] Funciona quando coleção ainda está na URL `pending` (mas só faz sentido após `paid`)

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Sem novos endpoints, sem migrations, sem mudanças de schema
- [ ] Eventos de analytics disparam corretamente

### UX
- [ ] Mobile (375px): modal cobre tela, botões grandes (>44px de altura)
- [ ] Aviso "vamos copiar e abrir WhatsApp" é claro e antecipa a UX (sem surpresa)
- [ ] Preview da mensagem é legível e fiel ao que será copiado
- [ ] iOS Safari: `wa.me` abre no app nativo do WhatsApp
- [ ] Android: abre no WhatsApp instalado, fallback para web se não instalado

## Dependências

- ⚠️ **Bloqueia em Spec 3.2** estar implementada (precisa do painel base e do `PainelClient`)
- ✅ Coleção paga já tem `slug` gerado (URL pública)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Comprador acha o aviso "vamos copiar" confuso | Baixa | Microcopy testada com 1-2 usuários reais antes de soltar |
| Mensagem padrão soa "robótica" | Média | Texto cuidadoso, com emoji moderado e tom íntimo; revisar com Alisson antes de publicar |
| WhatsApp não abre em alguns dispositivos | Baixa | Fallback automático para `web.whatsapp.com` se `wa.me` falhar |
| Comprador edita a mensagem no WhatsApp e perde o link | Baixa | Link já vem na mensagem; comprador só precisa não apagar |
| Falta de tracking deixa o time sem dados de envio | Média | Eventos de analytics client-side dão sinal sem precisar de tabela |
| Comprador esquece de enviar (sem nudge) | Alta | Spec 3.4 cobre via email "silêncio 7 dias" |

## Estimativa

2-3h: 30min helper + 1h modal + 30min botão + 30min analytics + 30min QA mobile/iOS

## Validação pós-deploy

- % de painéis acessados onde "Enviar para {Nome}" foi clicado (esperado: >70%)
- % de cliques que viram "Abrir WhatsApp" vs só "Copiar link" (esperado: WhatsApp domina, 70/30)
- Tempo médio entre acesso ao painel e clique em enviar (esperado: <3 min na primeira sessão)
- Cruzar com Spec 3.4: % de coleções que recebem 1ª abertura nas 24h após primeiro envio
