# Ajuste: Preview Panel - Card e Cinema

## Mudanças Implementadas

### 1. Visão Card (Monitor)
**Antes:** Mostrava componente `Preview` (card simples)
**Agora:** Mostra `CinematicPreview` com `stage="full-view"` (visualização completa)

**Resultado:**
- Exibe a página completa como será vista pelo destinatário
- Inclui header com foto, título, data
- Mostra mensagem completa com assinatura
- Exibe galeria de fotos
- Mostra player de música
- Inclui footer com branding

### 2. Visão Cinema (Film)
**Antes:** Mostrava `CinematicPreview` com `stage="full-view"` (estático)
**Agora:** Mostra `CinematicPreview` com `autoPlay={true}` (loop cinemático)

**Resultado:**
- Inicia automaticamente na sequência cinemática
- Loop infinito da experiência:
  1. Intro 1: "Uma mensagem especial" (4s)
  2. Intro 2: "Uma pessoa pensou em você com carinho" (4s)
  3. Intro Action: Botão "Toque para sentir" (aguarda ou auto-avança)
  4. Transition: Transição (2s)
  5. Reveal Photo: Foto aparece desfocada (3s)
  6. Reveal Intro: "Para [nome]...porque você merece sentir-se especial" (4s)
  7. Reveal Message: Mensagem principal com typewriter (8s)
  8. Reading: Mensagem completa (3s)
  9. **Loop:** Volta para Intro 1

## Arquivos Modificados

### `src/components/wizard/PreviewPanel.tsx`

**Desktop Preview:**
```tsx
{viewMode === 'card' ? (
  <div className="relative h-[600px] overflow-auto">
    <CinematicPreview
      data={previewData}
      stage="full-view"  // Visualização completa
      autoPlay={false}
    />
  </div>
) : (
  <div className="relative h-[600px] overflow-hidden">
    <CinematicPreview
      data={previewData}
      autoPlay={true}  // Loop cinemático
    />
  </div>
)}
```

**Mobile Preview:**
```tsx
{viewMode === 'card' ? (
  <div className="relative min-h-full">
    <CinematicPreview
      data={previewData}
      stage="full-view"
      autoPlay={false}
    />
  </div>
) : (
  <div className="relative min-h-full overflow-hidden">
    <CinematicPreview
      data={previewData}
      autoPlay={true}
    />
  </div>
)}
```

### `src/components/editor/CinematicPreview.tsx`

**Lógica de Loop:**
```tsx
} else if (stage === "reading" && autoPlay) {
  // Loop back to intro-1 when in autoPlay mode
  timeout = setTimeout(() => setStage("intro-1"), 3000);
}
```

## Benefícios

### Visão Card
✅ **Realista**: Mostra exatamente como será a página final
✅ **Completa**: Inclui todos os elementos (fotos, música, footer)
✅ **Interativa**: Usuário pode rolar e explorar
✅ **Útil**: Melhor para revisar conteúdo e layout

### Visão Cinema
✅ **Imersiva**: Experiência cinemática completa
✅ **Automática**: Loop infinito sem interação
✅ **Emocional**: Mostra a jornada emocional
✅ **Preview**: Ideal para sentir a experiência

## Como Testar

### 1. Teste Desktop

```bash
npm run dev
```

Acesse: `http://localhost:3000/editor/demo/message`

**Teste Card:**
1. Clique no botão "Card" (Monitor)
2. Verifique se mostra a página completa
3. Role para baixo para ver galeria e footer
4. Verifique se todos os elementos estão visíveis

**Teste Cinema:**
1. Clique no botão "Cinema" (Film)
2. Observe a sequência cinemática iniciar automaticamente
3. Aguarde até o final (cerca de 30s)
4. Verifique se volta para o início (loop)
5. Observe se o loop é suave

### 2. Teste Mobile

**Teste Card:**
1. Clique no botão flutuante (olho) no canto inferior direito
2. Selecione "Card"
3. Verifique visualização completa
4. Role para explorar

**Teste Cinema:**
1. Abra o preview mobile
2. Selecione "Cinema"
3. Observe o loop cinemático
4. Verifique se funciona em tela cheia

### 3. Teste de Dados

**Preencha o wizard:**
1. Step 1: Adicione título
2. Step 2: Adicione data especial
3. Step 3: Escreva mensagem
4. Step 4: Adicione fotos
5. Step 5: Escolha tema e cor
6. Step 6: Adicione música

**Verifique em ambas as visões:**
- [ ] Card mostra todos os dados
- [ ] Cinema usa os dados no loop
- [ ] Fotos aparecem corretamente
- [ ] Tema é aplicado
- [ ] Música está presente (Card)

## Timing da Sequência Cinema

| Stage | Duração | Descrição |
|-------|---------|-----------|
| intro-1 | 4s | Título da mensagem |
| intro-2 | 4s | "Uma pessoa pensou em você" |
| intro-action | Auto | Botão (avança automaticamente) |
| transition | 2s | Transição |
| reveal-photo | 3s | Foto desfocada |
| reveal-intro | 4s | "Para você...especial" |
| reveal-message | 8s | Mensagem com typewriter |
| reading | 3s | Mensagem completa |
| **LOOP** | - | Volta para intro-1 |

**Total por ciclo:** ~28 segundos

## Diferenças Entre Card e Cinema

| Aspecto | Card | Cinema |
|---------|------|--------|
| **Conteúdo** | Página completa | Sequência cinemática |
| **Interação** | Rolável | Automática |
| **Duração** | Estática | Loop infinito |
| **Objetivo** | Revisar conteúdo | Sentir experiência |
| **Música** | Player visível | Não visível (foco na narrativa) |
| **Galeria** | Grid completo | Foto principal apenas |
| **Footer** | Visível | Não visível |

## Notas Técnicas

**AutoPlay:**
- `autoPlay={true}`: Inicia automaticamente e faz loop
- `autoPlay={false}`: Aguarda interação do usuário

**Stage Control:**
- `stage="full-view"`: Mostra visualização completa (Card)
- `stage={undefined}`: Usa controle interno (Cinema com loop)

**Overflow:**
- Card: `overflow-auto` (permite scroll)
- Cinema: `overflow-hidden` (sem scroll, imersivo)

## Próximos Passos (Opcional)

- [ ] Adicionar controle de velocidade do loop
- [ ] Permitir pausar o loop Cinema
- [ ] Adicionar indicador de progresso no Cinema
- [ ] Opção de pular para full-view no Cinema
- [ ] Adicionar transição suave entre Card e Cinema

---

**Status:** ✅ Implementado e pronto para teste
**Impacto:** Melhora significativa na experiência de preview
