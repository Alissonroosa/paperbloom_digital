# Spec 1.2 — Editor: Reframing de Copy "Presente, não Compra"

## Problema

O copy atual do editor de 12 Cartas trata o usuário como **comprador** (linguagem transacional, focada em pagamento), quando na verdade ele é um **presenteador** (linguagem emocional, focada na pessoa amada).

Exemplos do copy atual problemático:
- `"💳 Finalizar Compra"` — soma egoísta, foco em transação
- `"Resumo do seu presente"` — okay, mas genérico
- `"Informe seus dados para receber o link das cartas"` — clínico, sobre o comprador
- `"Personalize a experiência"` — sobre a ferramenta, não sobre o destinatário

O produto "12 Cartas" tem alto valor emocional. Cada momento de copy que reforça que o usuário está fazendo um **gesto de carinho para outra pessoa** aumenta a disposição de pagar (mecanismo psicológico de dádiva > consumo).

Adicionalmente, o nome do destinatário é coletado já no Step 1 (`recipientName`), então a partir do Step 2 podemos personalizar copy com `{nome}` real — gatilho emocional ainda mais potente.

## Objetivo

Reescrever os pontos críticos de copy do editor para reforçar:
1. **Quem é o herói**: o destinatário, não o comprador
2. **Qual é a ação**: presentear, não comprar
3. **Personalização**: usar `{recipientName}` em todos os lugares onde está disponível

Sem refatorar a estrutura dos steps — só substituições de strings.

## Escopo (in)

### Step 1 — Step1BasicInfo.tsx
Não há `{nome}` disponível ainda. Manter copy genérico mas com tom de presente.
- `nextLabel`: `"Começar a criar →"` → `"Criar o presente →"`
- Subtítulo: `"12 cartas cheias de amor para momentos únicos"` → `"12 cartas cheias de amor para momentos únicos da pessoa que você ama"`

### Step 2 — Step2Intro.tsx (já tem `{nome}` disponível)
- Title: `"Personalize a experiência"` → `"A abertura do presente"`
- Subtítulo: `"Adicione uma mensagem de abertura e uma música especial"` → `"O que {nome} vai ler e ouvir antes das 12 cartas"`
- Label do textarea: `"💬 Mensagem de abertura (opcional)"` → `"💬 Mensagem para {nome} (opcional)"`
- Footer: `"A música tocará quando as cartas forem abertas 🎶"` → `"A música tocará quando {nome} abrir cada carta 🎶"`
- Microcopy final: `"Pode pular se preferir ir direto para as cartas 😊"` (mantém)

### Steps 3-5 — Cards (Step3Cards1to4, Step4Cards5to8, Step5Cards9to12)
Microcopy nas mensagens de subtítulo e badges. Nestes steps já temos `recipientName` no `collection`.
- Title Step3: `"Cartas para Momentos Difíceis"` → `"Cartas para os momentos difíceis de {nome}"`
- Subtítulo: `"Quando a pessoa precisar de apoio e conforto"` → `"Quando {nome} precisar de apoio e conforto"`
- (Mesmo padrão para Step4 e Step5)

### Step 6 — Step6Contact.tsx (mais crítico)
- Title: `"Quase lá! Só mais um passo"` → `"Pronto para presentear {nome}?"`
- Subtítulo: `"Informe seus dados para receber o link das cartas"` → `"É você que vai receber o acesso. {nome} só recebe quando você decidir."`
- Label email: `"📩 Seu melhor email"` → `"📩 Seu email (você recebe o acesso aqui)"`
- Helper text: `"Enviaremos o link das cartas para este email 💌"` → `"Você gerencia tudo pelo seu painel. {nome} não recebe nada agora."`
- Order Summary header: `"✨ Resumo do seu presente"` → `"✨ Presente para {nome}"`
- Order Summary lines:
  - `"💌 12 cartas personalizadas"` (mantém)
  - `"💝 Para: {recipientName}"` → remove (redundante com header)
  - `"💜 De: {senderName}"` → `"💜 De: {senderName}, com carinho"`
  - `"⚡ Entrega digital instantânea"` → `"⚡ Você decide quando e como entregar"`
  - `"🔗 Link exclusivo para compartilhar"` → `"🔗 Link único para {nome}"`
- finalizeLabel: `"💳 Finalizar Compra"` → `"💌 Presentear {nome} agora"`
- (Manter formulário e validações intocados)

## Escopo (out)

- Mudanças visuais ou de layout — só substituição de strings
- Mudanças no Step 6 que envolvam tirar o telefone (vem na Spec 2.3)
- Mudanças no Step 6 que envolvam adicionar bloco de demo ao vivo (vem na Spec 2.3)
- Mudanças no `WizardNavigation.tsx` (default `finalizeLabel`) — manter "Finalizar Compra →" como default genérico do componente; override só nos steps de 12 Cartas
- Reescrita da LP `/12-cartas` — escopo separado se for o caso
- Personalização de copy no Step 1 com nome (não disponível ainda no momento da renderização)

## Mudanças técnicas principais

### Arquivos editados
- `src/app/(fullscreen)/editor/12-cartas/steps/Step1BasicInfo.tsx`
- `src/app/(fullscreen)/editor/12-cartas/steps/Step2Intro.tsx`
- `src/app/(fullscreen)/editor/12-cartas/steps/Step3Cards1to4.tsx`
- `src/app/(fullscreen)/editor/12-cartas/steps/Step4Cards5to8.tsx`
- `src/app/(fullscreen)/editor/12-cartas/steps/Step5Cards9to12.tsx`
- `src/app/(fullscreen)/editor/12-cartas/steps/Step6Contact.tsx`

### Arquivos NÃO impactados
- `WizardNavigation.tsx` — default permanece "Finalizar Compra →" para outros editores
- Outros editores (mensagem, revelacao-virtual) — não afetados
- LP `/12-cartas/page.tsx` — escopo separado

## Critérios de aceite

### Funcional
- [ ] Step 1: CTA mostra "Criar o presente →"
- [ ] Step 2 em diante: todas as instâncias de `{nome}` exibem `collection.recipientName` real
- [ ] Step 6: CTA principal mostra "💌 Presentear {recipientName} agora" (com nome real)
- [ ] Se `recipientName` estiver vazio (caso edge), copy faz fallback gracioso (ex: "a pessoa")

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Nenhum teste de string assertion existente quebra (verificar `__tests__`)

### UX
- [ ] Em mobile, finalizeLabel não estoura o botão (ex: "Presentear Maria Aparecida da Silva" — truncar com ellipsis se necessário, máx 30 chars no nome)
- [ ] Tom emocional e consistente em todos os steps (revisão manual)

## Dependências

- ✅ `recipientName` já está disponível em `collection` no contexto a partir do Step 2
- ✅ Spec 1.1 NÃO é dependência (podem ser implementadas em paralelo)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Nome muito longo quebra layout do botão | Média | Truncar a 30 chars com ellipsis; testar com nome longo |
| Inconsistência de tom entre steps | Média | Revisão manual lendo todos os steps em sequência antes de mergear |
| Tradução/copy muda regional/cultural — alguns nomes podem ser estranhos no possessivo | Baixa | Manter copy em vocativo ("para Maria") em vez de possessivo ("de Maria") |
| Quebra de teste de UI/snapshot | Baixa-Média | Verificar e atualizar snapshots se necessário |

## Estimativa

30-60min de trabalho — substituições de strings em 6 arquivos + verificação de build + revisão de tom.

## Validação pós-deploy

Acompanhar:
- Taxa de conversão Step6 → checkout pago (esperado: aumento por reframing emocional)
- Comentários/feedback qualitativo (a copy "Presentear Maria" é poderosa em si mesma)