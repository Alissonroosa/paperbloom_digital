# Spec 2.2 — Tarefas

## Preparação

- [x] **P1.** Decidir asset:
  - Aponta para `/videos/12-cartas-hero.mp4` e `/videos/12-cartas-hero-poster.jpg`
  - **Assets ainda não existem** — fallback gracioso para gradiente roxo/rosa com emoji 💌
  - Quando tiver o asset, é só dropar nos caminhos

## Implementação

- [x] **T1.** Criar `src/components/interactive-wizard/MiniHero.tsx`:
  - Props: `{ headline, videoSrc?, posterSrc?, socialProofText, fallbackEmoji?, className? }`
  - Render: container com aspect-ratio fixo
  - Se `videoSrc`: `<video autoplay muted loop playsInline preload="metadata">`
  - Senão se `posterSrc`: `<img>`
  - Senão: fallback gradiente com emoji
  - Headline + Social proof com estrelas
- [x] **T2.** Editar `Step1BasicInfo.tsx`:
  - Importar `MiniHero`
  - Inserido como primeiro filho dentro do container
  - Props: headline="12 cartas pra abrir nos momentos mais especiais", videoSrc, posterSrc, socialProofText="Mais de 500 presentes entregues", fallbackEmoji="💌"

## Verificação

- [x] **V1.** `npm run build` passa
- [x] **V2.** `npx tsc --noEmit` passa (erros apenas em testes pré-existentes)
- [ ] **V3.** Mobile (DevTools 375px iPhone SE): mini-hero visível, form não fica muito abaixo da dobra
- [ ] **V4.** iOS Safari real (ou simulator): vídeo roda em autoplay
- [ ] **V5.** Sem vídeo (assets não existem ainda): fallback funciona, renderiza gradiente com emoji
- [ ] **V6.** Network tab: vídeo carrega só metadata inicialmente, poster instantâneo

## Out of scope

- Vídeos para outros editores
- Sistema CMS para texto/vídeo
- Social proof dinâmico (contagem real)
- A/B testing
