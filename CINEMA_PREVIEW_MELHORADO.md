# 🎬 Cinema Preview Melhorado

## Melhorias Implementadas

### 1. ✅ Cinema Igual à Página Demo
**Antes:** Mostrava `stage="full-view"` (página estática)
**Agora:** Mostra sequência cinemática completa com `autoPlay={true}`

**Resultado:**
- Experiência idêntica à página `/demo/message`
- Sequência completa de animações
- Loop automático infinito
- Transições suaves entre stages

### 2. 🔄 Botão de Reiniciar
**Novo:** Botão "Reiniciar" aparece quando Cinema está ativo

**Funcionalidade:**
- Reinicia a animação do zero
- Usa `key={cinemaKey}` para forçar remontagem do componente
- Disponível em desktop e mobile
- Ícone de refresh para clareza visual

### 3. 🎯 Validação de Dados Mínimos
**Novo:** Cinema só aparece quando há dados suficientes

**Campos Obrigatórios:**
- ✅ Título da página (`pageTitle`)
- ✅ Nome do destinatário (`recipientName`)
- ✅ Mensagem principal (`mainMessage`)

**Quando Incompleto:**
- Mostra tela de placeholder
- Lista os campos necessários
- Indica quais já foram preenchidos (✅/⭕)
- Botão Cinema fica desabilitado

## Arquivos Modificados

### `src/components/wizard/PreviewPanel.tsx`

#### Novos Estados e Funções

```tsx
const [cinemaKey, setCinemaKey] = useState(0);

// Check if has minimum data for cinema view
const hasMinimumData = () => {
  return (
    data.pageTitle.trim() !== '' &&
    data.recipientName.trim() !== '' &&
    data.mainMessage.trim() !== ''
  );
};

// Restart cinema animation
const handleRestartCinema = () => {
  setCinemaKey(prev => prev + 1);
};
```

#### Botão Cinema com Validação

```tsx
<Button
  variant={viewMode === 'cinema' ? 'primary' : 'ghost'}
  onClick={() => onViewModeChange('cinema')}
  disabled={!hasMinimumData()}
  title={!hasMinimumData() ? 'Preencha título, destinatário e mensagem' : ''}
>
  <Film className="w-4 h-4" />
  Cinema
</Button>
```

#### Botão de Reiniciar

```tsx
{viewMode === 'cinema' && hasMinimumData() && (
  <div className="mb-4 flex justify-center">
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestartCinema}
      className="gap-2"
    >
      <RefreshCw className="w-4 h-4" />
      <span className="text-xs">Reiniciar</span>
    </Button>
  </div>
)}
```

#### Preview com Validação

```tsx
{viewMode === 'card' ? (
  // Card view (full-view)
  <CinematicPreview
    data={previewData}
    stage="full-view"
    autoPlay={false}
  />
) : hasMinimumData() ? (
  // Cinema view (animated loop)
  <div key={cinemaKey}>
    <CinematicPreview
      data={previewData}
      autoPlay={true}
    />
  </div>
) : (
  // Placeholder when data is incomplete
  <div className="flex items-center justify-center">
    <div className="space-y-4">
      <Film className="w-16 h-16 mx-auto text-gray-300" />
      <h3>Cinema em breve...</h3>
      <ul>
        <li>{data.pageTitle ? '✅' : '⭕'} Título da página</li>
        <li>{data.recipientName ? '✅' : '⭕'} Nome do destinatário</li>
        <li>{data.mainMessage ? '✅' : '⭕'} Mensagem principal</li>
      </ul>
    </div>
  </div>
)}
```

## Fluxo de Uso

### Cenário 1: Dados Incompletos

1. Usuário abre o wizard
2. Botão "Cinema" está **desabilitado** (cinza)
3. Ao passar o mouse: tooltip "Preencha título, destinatário e mensagem"
4. Preview mostra placeholder com checklist

### Cenário 2: Dados Mínimos Preenchidos

1. Usuário preenche:
   - Step 1: Título
   - Step 3: Destinatário e Mensagem
2. Botão "Cinema" fica **habilitado**
3. Ao clicar: Animação cinemática inicia automaticamente
4. Botão "Reiniciar" aparece acima do preview

### Cenário 3: Durante Animação

1. Animação está rodando (loop infinito)
2. Usuário clica em "Reiniciar"
3. Animação volta para o início (intro-1)
4. Loop continua normalmente

## Benefícios

### UX Melhorada
✅ **Clareza**: Usuário sabe exatamente o que precisa preencher
✅ **Feedback**: Checklist mostra progresso em tempo real
✅ **Controle**: Botão de reiniciar dá controle sobre a animação
✅ **Prevenção**: Evita mostrar cinema vazio/incompleto

### Experiência Cinema
✅ **Autêntica**: Idêntica à página demo final
✅ **Imersiva**: Loop infinito mantém a experiência
✅ **Interativa**: Reiniciar permite rever a sequência
✅ **Realista**: Preview fiel ao resultado final

### Performance
✅ **Otimizada**: Só renderiza cinema quando necessário
✅ **Eficiente**: Key-based remount para reiniciar
✅ **Responsiva**: Funciona em desktop e mobile

## Como Testar

### Teste 1: Validação de Dados

```bash
npm run dev
```

1. Acesse: `http://localhost:3000/editor/demo/message`
2. **Sem dados:**
   - [ ] Botão Cinema está desabilitado
   - [ ] Placeholder aparece ao tentar acessar
   - [ ] Checklist mostra 3 itens pendentes (⭕)

3. **Preencha Step 1:**
   - [ ] Adicione título
   - [ ] Checklist atualiza: ✅ Título

4. **Preencha Step 3:**
   - [ ] Adicione destinatário
   - [ ] Checklist atualiza: ✅ Destinatário
   - [ ] Adicione mensagem
   - [ ] Checklist atualiza: ✅ Mensagem
   - [ ] Botão Cinema fica habilitado

### Teste 2: Animação Cinema

1. **Clique em "Cinema"**
   - [ ] Animação inicia automaticamente
   - [ ] Sequência completa aparece:
     - Intro 1 (4s)
     - Intro 2 (4s)
     - Botão "Toque para sentir" (auto-avança)
     - Transição (2s)
     - Foto desfocada (3s)
     - "Para você...especial" (4s)
     - Mensagem typewriter (8s)
     - Mensagem completa (3s)
   - [ ] Loop volta para Intro 1
   - [ ] Botão "Reiniciar" aparece

### Teste 3: Botão Reiniciar

1. **Durante a animação:**
   - [ ] Aguarde até stage "reveal-message"
   - [ ] Clique em "Reiniciar"
   - [ ] Animação volta para Intro 1
   - [ ] Loop continua normalmente

2. **Múltiplos reinícios:**
   - [ ] Clique "Reiniciar" várias vezes
   - [ ] Cada clique reinicia do zero
   - [ ] Sem travamentos ou erros

### Teste 4: Mobile

1. **Abra preview mobile**
   - [ ] Clique no botão flutuante (olho)
   - [ ] Botão Cinema desabilitado sem dados
   - [ ] Preencha dados mínimos
   - [ ] Botão Cinema habilita
   - [ ] Animação funciona
   - [ ] Botão Reiniciar aparece e funciona

### Teste 5: Alternância Card ↔ Cinema

1. **Com dados preenchidos:**
   - [ ] Alterne entre Card e Cinema
   - [ ] Card mostra full-view
   - [ ] Cinema mostra animação
   - [ ] Reiniciar funciona apenas em Cinema
   - [ ] Transições são suaves

## Checklist Visual

### Desktop

```
┌─────────────────────────────────┐
│  [Card] [Cinema] [Reiniciar]    │ ← Controles
├─────────────────────────────────┤
│                                 │
│   🎬 Animação Cinemática        │
│                                 │
│   Intro → Foto → Mensagem       │
│                                 │
│   🔄 Loop Infinito              │
│                                 │
└─────────────────────────────────┘
```

### Placeholder (Dados Incompletos)

```
┌─────────────────────────────────┐
│  [Card] [Cinema 🚫]             │ ← Cinema desabilitado
├─────────────────────────────────┤
│                                 │
│        🎬                        │
│   Cinema em breve...            │
│                                 │
│   Preencha:                     │
│   ⭕ Título da página           │
│   ⭕ Nome do destinatário       │
│   ⭕ Mensagem principal         │
│                                 │
└─────────────────────────────────┘
```

### Progresso Parcial

```
┌─────────────────────────────────┐
│  [Card] [Cinema 🚫]             │
├─────────────────────────────────┤
│                                 │
│        🎬                        │
│   Cinema em breve...            │
│                                 │
│   Preencha:                     │
│   ✅ Título da página           │
│   ✅ Nome do destinatário       │
│   ⭕ Mensagem principal         │
│                                 │
└─────────────────────────────────┘
```

## Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Cinema** | Full-view estático | Animação completa com loop |
| **Controle** | Nenhum | Botão Reiniciar |
| **Validação** | Sempre disponível | Requer dados mínimos |
| **Feedback** | Nenhum | Checklist de progresso |
| **UX** | Confuso quando vazio | Claro e guiado |
| **Fidelidade** | Diferente da demo | Idêntico à demo |

## Notas Técnicas

### Key-based Remount
```tsx
<div key={cinemaKey}>
  <CinematicPreview autoPlay={true} />
</div>
```
- Incrementar `cinemaKey` força React a desmontar e remontar
- Reinicia todos os estados internos do componente
- Animação começa do zero

### Validação Mínima
```tsx
const hasMinimumData = () => {
  return (
    data.pageTitle.trim() !== '' &&
    data.recipientName.trim() !== '' &&
    data.mainMessage.trim() !== ''
  );
};
```
- Verifica apenas campos essenciais
- Outros campos (foto, música) são opcionais
- Usa `.trim()` para evitar strings vazias

### Disabled State
```tsx
disabled={!hasMinimumData()}
title={!hasMinimumData() ? 'Tooltip' : ''}
```
- Botão desabilitado quando dados incompletos
- Tooltip explica o motivo
- Acessibilidade mantida

## Próximos Passos (Opcional)

- [ ] Adicionar barra de progresso na animação
- [ ] Permitir pausar/play no cinema
- [ ] Adicionar controle de velocidade (1x, 1.5x, 2x)
- [ ] Salvar preferência de view mode
- [ ] Adicionar atalhos de teclado (R para reiniciar)

---

**Status:** ✅ Implementado e testado
**Impacto:** Experiência de preview significativamente melhorada
**Compatibilidade:** Desktop e Mobile
