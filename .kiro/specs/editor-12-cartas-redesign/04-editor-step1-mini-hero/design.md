# Spec 2.2 — Editor: Mini-Hero no Step 1

## Problema

O Step 1 do editor abre direto com "Pra quem são essas cartas?" — sem nenhum contexto sobre o produto. Isso falha com **dois perfis de usuário**:

1. **Vindos de Meta Ads** (90%+ do tráfego): cliques rápidos, baixa atenção, muitos chegam sem ter visto a LP completa. Sem ver o produto, fecham antes de digitar o nome.
2. **Curiosos/exploradores**: clicam em "Editor" da LP por curiosidade — querem entender o produto antes de se comprometer com o form.

O resultado é uma alta taxa de saída no Step 1 sem nenhuma interação.

## Objetivo

Adicionar um **mini-hero compacto** acima do form do Step 1 com 3 elementos:
1. **Headline curta** (1 linha) reforçando o valor do produto
2. **Vídeo MP4** (10-20s, autoplay muted loop) mostrando o produto em uso
3. **Prova social mínima** (estrelas + texto curto)

Sem refazer o Step 1 — apenas adicionar bloco acima do form atual. Mantém a lógica de captura de nomes intocada.

## Escopo (in)

- Criar componente `src/components/interactive-wizard/MiniHero.tsx`
- Props: `headline`, `videoSrc?`, `posterSrc`, `socialProofText`
- Vídeo: `<video autoplay muted loop playsInline preload="metadata" poster={posterSrc}>`
- Render condicional: se `videoSrc` ausente ou falha, fallback para `<img src={posterSrc}>`
- Inserir `<MiniHero>` no Step1BasicInfo entre o `<FullscreenStep>` e o form atual
- Asset placeholder ou reaproveitamento da LP `/12-cartas` (verificar disponibilidade)
- Social proof estática no MVP: ex. "⭐⭐⭐⭐⭐ Mais de 500 presentes entregues"

## Escopo (out)

- Sistema dinâmico de social proof (contagem real)
- A/B testing de variações de headline/vídeo
- Mini-hero em outros editores (mensagem, revelacao-virtual)
- Editar texto/vídeo via CMS
- Lazy loading avançado do vídeo (preload="metadata" basta no MVP)

## Mudanças técnicas principais

### Arquivos criados
- `src/components/interactive-wizard/MiniHero.tsx`

### Arquivos editados
- `src/app/(fullscreen)/editor/12-cartas/steps/Step1BasicInfo.tsx` — inserir `<MiniHero>` no topo do conteúdo, antes do parágrafo descritivo

### Assets
- **Necessário criar pasta**: `public/videos/`
- **Necessário providenciar**:
  - `public/videos/12-cartas-hero.mp4` (15s ideal, ≤2MB, sem áudio, 9:16 ou 4:5)
  - `public/videos/12-cartas-hero-poster.jpg` (frame estático para fallback e poster)
- **Alternativa MVP**: reaproveitar imagem estática de `/public/12-cartas/` ou `/public/demo/` se vídeo não estiver pronto — Mini-hero ainda agrega valor só com poster + headline + social proof

## Critérios de aceite

### Funcional
- [ ] Step 1 mostra mini-hero acima do form
- [ ] Vídeo carrega e roda em autoplay muted loop (quando presente)
- [ ] Sem vídeo (fallback): mostra apenas poster como `<img>` + headline + social proof
- [ ] Social proof visível (estrelas + texto)

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Sem 404 no Network tab (vídeo/poster carregam ou fallback gracioso)

### UX
- [ ] Mobile (375px): vídeo respeita viewport, mini-hero não passa de ~40% da altura visível
- [ ] Form continua acessível sem scroll excessivo na maioria dos viewports mobile
- [ ] iOS Safari: vídeo roda autoplay (validar `playsInline` + `muted`)

## Dependências

- ⚠️ **Asset de vídeo**: pode reaproveitar do material da LP, mas precisa estar otimizado (≤2MB para mobile). Se não houver, MVP roda só com poster
- ✅ Independente das outras specs da Fase 2

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Vídeo pesado em mobile com 4G | Alta | preload="metadata" + max 2MB + poster |
| Form fica abaixo da dobra mobile | Média | Mini-hero compacto (max-h ~280px); testar em iPhone SE (375x667) |
| Vídeo não autoplay no iOS Safari | Média | Atributos `playsInline muted` obrigatórios |
| Não temos vídeo pronto | Alta | Fallback gracioso (só headline + poster image) |

## Estimativa

1.5-3h: 30min componente + 30min integração + 1-2h providenciar/otimizar asset

## Validação pós-deploy

- Taxa de abandono no Step 1 (esperado: cair)
- Tempo médio no Step 1 (esperado: subir levemente — pessoas assistem o vídeo)
- Taxa de avanço Step 1 → Step 2 (esperado: subir)
