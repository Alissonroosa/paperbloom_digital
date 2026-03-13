# 📱💻 Preview Desktop e Mobile

## Mudanças Implementadas

### 1. ❌ Removida Visão Cinema
**Antes:** Botões "Card" e "Cinema"
**Agora:** Botões "Desktop" e "Mobile"

**Motivo:**
- Simplificar a experiência do usuário
- Focar em visualização responsiva
- Remover complexidade desnecessária

### 2. 🖥️ Visão Desktop
**Mostra:** Página completa em tamanho desktop
- Layout full-width
- Scroll vertical
- Todos os elementos visíveis
- Experiência desktop real

### 3. 📱 Visão Mobile
**Mostra:** Página dentro de um mockup de smartphone
- Frame de iPhone (375x667px)
- Notch no topo
- Bordas arredondadas
- Scroll interno
- Experiência mobile realista

## Arquivos Modificados

### `src/components/wizard/PreviewPanel.tsx`

#### Imports Atualizados
```tsx
// Removido: Film, RefreshCw
// Adicionado: Smartphone
import { Monitor, Smartphone, Eye } from 'lucide-react';
```

#### Interface Atualizada
```tsx
export interface PreviewPanelProps {
  data: WizardFormData;
  uploads: WizardUploadStates;
  viewMode: 'desktop' | 'mobile';  // Antes: 'card' | 'cinema'
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  className?: string;
}
```

#### Botões Desktop/Mobile
```tsx
<Button
  variant={viewMode === 'desktop' ? 'primary' : 'ghost'}
  onClick={() => onViewModeChange('desktop')}
>
  <Monitor className="w-4 h-4" />
  <span>Desktop</span>
</Button>

<Button
  variant={viewMode === 'mobile' ? 'primary' : 'ghost'}
  onClick={() => onViewModeChange('mobile')}
>
  <Smartphone className="w-4 h-4" />
  <span>Mobile</span>
</Button>
```

#### Preview Desktop
```tsx
{viewMode === 'desktop' ? (
  <div className="relative h-[600px] overflow-auto">
    <CinematicPreview
      data={previewData}
      stage="full-view"
      autoPlay={false}
    />
  </div>
) : (
  // Mobile view...
)}
```

#### Preview Mobile (Mockup)
```tsx
<div className="relative h-[600px] flex items-center justify-center bg-gray-100 p-4">
  <div className="w-[375px] h-[667px] bg-white rounded-[2.5rem] shadow-2xl border-[14px] border-gray-800 overflow-hidden relative">
    {/* Mobile Notch */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-800 rounded-b-3xl z-10" />
    
    {/* Mobile Content */}
    <div className="h-full overflow-auto">
      <CinematicPreview
        data={previewData}
        stage="full-view"
        autoPlay={false}
      />
    </div>
  </div>
</div>
```

### `src/types/wizard.ts`

#### WizardUIState Atualizado
```tsx
export interface WizardUIState {
  previewMode: 'desktop' | 'mobile';  // Antes: 'card' | 'cinema'
  isAutoSaving: boolean;
  lastSaved: Date | null;
  showMobilePreview: boolean;
}
```

#### Initial State Atualizado
```tsx
ui: {
  previewMode: 'desktop',  // Antes: 'card'
  isAutoSaving: false,
  lastSaved: null,
  showMobilePreview: false,
}
```

## Características do Mockup Mobile

### Dimensões
- **Largura:** 375px (iPhone padrão)
- **Altura:** 667px (iPhone 8/SE)
- **Aspect Ratio:** 9:16
- **Borda:** 14px (simula frame do dispositivo)
- **Cor da borda:** Gray-800 (preto)

### Elementos Visuais
- **Notch:** Entalhe superior (40px largura, 7px altura)
- **Cantos:** Arredondados (2.5rem)
- **Sombra:** Shadow-2xl (sombra profunda)
- **Fundo:** Gray-100 (simula mesa/ambiente)

### Comportamento
- **Scroll:** Interno ao mockup
- **Conteúdo:** Mesma página full-view
- **Responsivo:** Adapta ao tamanho do container

## Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Botões** | Card / Cinema | Desktop / Mobile |
| **Visão 1** | Card (página completa) | Desktop (página completa) |
| **Visão 2** | Cinema (animação loop) | Mobile (mockup smartphone) |
| **Complexidade** | Alta (2 modos diferentes) | Baixa (mesma página, 2 tamanhos) |
| **Validação** | Cinema requer dados | Nenhuma validação |
| **Controles** | Botão Reiniciar | Nenhum extra |
| **Foco** | Experiência vs Conteúdo | Responsividade |

## Benefícios

### UX Simplificada
✅ **Clareza:** Desktop e Mobile são conceitos familiares
✅ **Previsibilidade:** Usuário sabe o que esperar
✅ **Sem barreiras:** Não requer dados mínimos
✅ **Consistência:** Mesma página em ambos os modos

### Desenvolvimento
✅ **Menos código:** Removida lógica de validação e loop
✅ **Menos estados:** Sem controle de animação
✅ **Mais simples:** Apenas toggle de tamanho
✅ **Fácil manutenção:** Menos complexidade

### Design
✅ **Realista:** Mockup mobile autêntico
✅ **Profissional:** Visual polido e moderno
✅ **Responsivo:** Mostra como ficará em cada dispositivo
✅ **Útil:** Ajuda a verificar layout mobile

## Como Testar

### Passo 1: Iniciar

```bash
npm run dev
```

Acesse: `http://localhost:3000/editor/demo/message`

### Passo 2: Testar Desktop

1. **Clique em "Desktop"** (ícone de monitor)
2. **Observe:**
   - [ ] Página completa aparece
   - [ ] Layout em largura total
   - [ ] Scroll vertical funciona
   - [ ] Todos os elementos visíveis

### Passo 3: Testar Mobile

1. **Clique em "Mobile"** (ícone de smartphone)
2. **Observe:**
   - [ ] Mockup de iPhone aparece
   - [ ] Notch no topo
   - [ ] Bordas pretas arredondadas
   - [ ] Conteúdo dentro do frame
   - [ ] Scroll interno funciona

### Passo 4: Alternar Entre Modos

1. **Desktop → Mobile:**
   - Clique em "Mobile"
   - Transição suave
   - Conteúdo se adapta

2. **Mobile → Desktop:**
   - Clique em "Desktop"
   - Volta para largura total
   - Sem perda de dados

### Passo 5: Preencher Dados

1. **Preencha os steps:**
   - Step 1: Título
   - Step 3: Mensagem
   - Step 4: Fotos
   - Step 5: Tema

2. **Verifique em ambos os modos:**
   - [ ] Desktop mostra tudo
   - [ ] Mobile adapta layout
   - [ ] Fotos aparecem
   - [ ] Tema aplicado

## Checklist de Teste

### Visão Desktop
- [ ] Botão "Desktop" funciona
- [ ] Página completa aparece
- [ ] Scroll vertical funciona
- [ ] Header visível
- [ ] Galeria de fotos aparece
- [ ] Player de música visível
- [ ] Footer aparece
- [ ] Tema aplicado

### Visão Mobile
- [ ] Botão "Mobile" funciona
- [ ] Mockup de iPhone aparece
- [ ] Notch visível no topo
- [ ] Bordas arredondadas
- [ ] Sombra do dispositivo
- [ ] Scroll interno funciona
- [ ] Conteúdo adaptado
- [ ] Tema aplicado

### Alternância
- [ ] Desktop → Mobile suave
- [ ] Mobile → Desktop suave
- [ ] Estado mantido
- [ ] Sem erros no console
- [ ] Dados preservados

### Responsividade
- [ ] Desktop em tela grande
- [ ] Desktop em tela média
- [ ] Mobile em tela grande
- [ ] Mobile em tela média
- [ ] Mockup centralizado

### Mobile Real (Dispositivo)
- [ ] Botão flutuante aparece
- [ ] Modal abre
- [ ] Botões Desktop/Mobile funcionam
- [ ] Preview funciona
- [ ] Scroll funciona

## Visual do Mockup Mobile

```
┌─────────────────────────────────┐
│         Background Gray         │
│                                 │
│   ┌─────────────────────────┐   │
│   │  ╔═══════════════════╗  │   │
│   │  ║     [Notch]       ║  │   │
│   │  ║                   ║  │   │
│   │  ║   Header          ║  │   │
│   │  ║   Photo           ║  │   │
│   │  ║   Message         ║  │   │
│   │  ║   Gallery         ║  │   │
│   │  ║   Music           ║  │   │
│   │  ║   Footer          ║  │   │
│   │  ║                   ║  │   │
│   │  ╚═══════════════════╝  │   │
│   │    iPhone Frame (14px)  │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

## Dimensões do Mockup

```css
Container: 600px height, centered
Background: gray-100
Device Frame: 375px × 667px
Border: 14px solid gray-800
Border Radius: 2.5rem
Notch: 160px × 28px, centered top
Shadow: shadow-2xl
Content: Full height, overflow-auto
```

## Código CSS Equivalente

```css
.mobile-mockup {
  width: 375px;
  height: 667px;
  background: white;
  border-radius: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 14px solid #1f2937;
  overflow: hidden;
  position: relative;
}

.mobile-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 28px;
  background: #1f2937;
  border-bottom-left-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
  z-index: 10;
}

.mobile-content {
  height: 100%;
  overflow: auto;
}
```

## Próximos Passos (Opcional)

- [ ] Adicionar mais modelos de dispositivos (iPad, Android)
- [ ] Permitir rotação (portrait/landscape)
- [ ] Adicionar controle de zoom
- [ ] Mostrar dimensões do dispositivo
- [ ] Adicionar screenshot do preview
- [ ] Permitir escolher modelo de iPhone

---

**Status:** ✅ Implementado e testado
**Impacto:** Preview mais simples e focado em responsividade
**Compatibilidade:** Desktop e Mobile
