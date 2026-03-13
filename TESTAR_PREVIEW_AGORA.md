# 🎬 Testar Preview Ajustado - Guia Rápido

## ✅ O que mudou?

### Visão Card (Monitor) 📺
Agora mostra a **página completa** como o destinatário verá:
- Header com foto e título
- Mensagem completa
- Galeria de fotos
- Player de música
- Footer com branding

### Visão Cinema (Film) 🎥
Agora faz **loop infinito** da experiência cinemática:
- Sequência automática de 28 segundos
- Volta para o início automaticamente
- Experiência imersiva contínua

## 🚀 Como Testar AGORA

### Passo 1: Iniciar Servidor

```bash
npm run dev
```

### Passo 2: Acessar Editor

Abra: `http://localhost:3000/editor/demo/message`

### Passo 3: Testar Visão Card

1. **Clique no botão "Card"** (ícone de monitor)
2. **Observe:**
   - ✅ Página completa aparece
   - ✅ Header com foto principal
   - ✅ Título e data
   - ✅ Mensagem completa
   - ✅ Galeria de fotos (role para baixo)
   - ✅ Player de música
   - ✅ Footer "Paper Bloom"

3. **Role a página** para ver todos os elementos

### Passo 4: Testar Visão Cinema

1. **Clique no botão "Cinema"** (ícone de filme)
2. **Observe a sequência:**
   - ⏱️ 0-4s: "Uma mensagem especial"
   - ⏱️ 4-8s: "Uma pessoa pensou em você com carinho"
   - ⏱️ 8-10s: Botão "Toque para sentir" (avança automaticamente)
   - ⏱️ 10-12s: Transição
   - ⏱️ 12-15s: Foto aparece desfocada
   - ⏱️ 15-19s: "Para você...porque você merece sentir-se especial"
   - ⏱️ 19-27s: Mensagem principal (typewriter)
   - ⏱️ 27-30s: Mensagem completa
   - 🔄 **LOOP:** Volta para o início!

3. **Aguarde 2-3 ciclos** para confirmar o loop

## 📱 Teste Mobile

### Desktop → Mobile

1. Redimensione a janela do navegador
2. Clique no **botão flutuante** (olho) no canto inferior direito
3. Teste ambas as visões (Card e Cinema)

### Ou use DevTools

1. Pressione `F12`
2. Clique no ícone de dispositivo móvel
3. Teste as visões

## ✨ Checklist de Teste

### Visão Card
- [ ] Mostra página completa
- [ ] Header está visível
- [ ] Título e data aparecem
- [ ] Mensagem está legível
- [ ] Galeria de fotos aparece
- [ ] Player de música está presente
- [ ] Footer "Paper Bloom" está visível
- [ ] Scroll funciona
- [ ] Tema aplicado corretamente

### Visão Cinema
- [ ] Sequência inicia automaticamente
- [ ] Intro 1 aparece (4s)
- [ ] Intro 2 aparece (4s)
- [ ] Botão aparece e avança
- [ ] Foto revela gradualmente
- [ ] Mensagem "Para você..." aparece
- [ ] Mensagem principal com typewriter
- [ ] Loop volta para o início
- [ ] Loop é suave (sem travamentos)
- [ ] Tema aplicado corretamente

### Alternância Card ↔ Cinema
- [ ] Botão Card funciona
- [ ] Botão Cinema funciona
- [ ] Transição é suave
- [ ] Estado é mantido
- [ ] Não há erros no console

## 🎨 Teste com Diferentes Temas

1. Vá para **Step 5** (Tema)
2. Selecione diferentes cores:
   - Rosa Suave
   - Azul Céu
   - Verde Menta
   - Lavanda

3. Teste cada tema:
   - Gradiente
   - Brilhante
   - Fosco
   - Pastel
   - Neon
   - Vintage

4. **Verifique em ambas as visões:**
   - [ ] Card aplica o tema
   - [ ] Cinema aplica o tema
   - [ ] Contraste está bom
   - [ ] Cores são consistentes

## 🐛 Problemas Comuns

### Cinema não faz loop?
- Verifique se `autoPlay={true}` está no código
- Limpe o cache: `Ctrl+Shift+R`
- Verifique o console por erros

### Card não mostra página completa?
- Verifique se `stage="full-view"` está no código
- Recarregue a página
- Verifique se há dados preenchidos

### Temas não aplicam?
- Vá para Step 5 e selecione um tema
- Aguarde alguns segundos
- Verifique se o preview atualiza

### Preview não atualiza?
- Preencha os dados nos steps
- Aguarde 300ms (debounce)
- Verifique se não há erros no console

## 📊 Comparação Visual

### ANTES (Card)
```
┌─────────────────┐
│   [Card View]   │
│                 │
│  Simple card    │
│  with message   │
│                 │
└─────────────────┘
```

### DEPOIS (Card)
```
┌─────────────────┐
│  [Full Page]    │
│ ┌─────────────┐ │
│ │   Header    │ │
│ │   Photo     │ │
│ └─────────────┘ │
│   Message       │
│   Gallery       │
│   Music         │
│   Footer        │
└─────────────────┘
```

### ANTES (Cinema)
```
┌─────────────────┐
│  [Static View]  │
│                 │
│  Full page      │
│  (no animation) │
│                 │
└─────────────────┘
```

### DEPOIS (Cinema)
```
┌─────────────────┐
│ [Cinema Loop]   │
│                 │
│  Intro 1 → 2 →  │
│  Action → Photo │
│  → Message →    │
│  🔄 LOOP        │
└─────────────────┘
```

## 🎯 Resultado Esperado

Após os testes, você deve ter:

✅ **Card View:**
- Visualização completa e realista
- Todos os elementos visíveis
- Scroll funcional
- Tema aplicado

✅ **Cinema View:**
- Loop infinito automático
- Sequência cinemática suave
- Experiência imersiva
- Volta para o início automaticamente

✅ **Ambas:**
- Alternância suave entre visões
- Temas aplicados corretamente
- Contraste adequado
- Sem erros no console

## 📝 Feedback

Se encontrar problemas:
1. Anote o comportamento esperado vs. real
2. Tire screenshot se possível
3. Copie mensagens de erro do console
4. Descreva os passos para reproduzir

---

**Status:** ✅ Pronto para teste
**Tempo estimado:** 5-10 minutos
**Dificuldade:** Fácil
