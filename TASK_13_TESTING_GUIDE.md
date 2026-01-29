# Task 13: Guia de Testes - Responsividade e Acessibilidade

## 🎯 Objetivo

Este guia fornece instruções passo a passo para testar a implementação de responsividade e acessibilidade do editor agrupado de 12 cartas.

## 📱 Teste 1: Responsividade Mobile (< 640px)

### Dispositivos Recomendados
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPhone 14 Pro Max (430px)

### Checklist

#### Layout Geral
- [ ] Grid de cards mostra 1 coluna
- [ ] Navegação de momentos está empilhada verticalmente
- [ ] Header tem padding reduzido (px-4)
- [ ] Footer tem botões empilhados verticalmente
- [ ] Indicador de momento está centralizado

#### Modais
- [ ] EditMessageModal ocupa tela completa
- [ ] PhotoUploadModal ocupa tela completa
- [ ] MusicSelectionModal ocupa tela completa
- [ ] Modais não têm bordas arredondadas
- [ ] Padding interno é px-4

#### Botões
- [ ] Todos os botões têm altura mínima de 44px
- [ ] Botões são fáceis de tocar
- [ ] Não há sobreposição de áreas clicáveis

#### Cards
- [ ] Cards ocupam largura completa
- [ ] Título é legível
- [ ] Mensagem preview é legível
- [ ] Badges de indicadores são visíveis
- [ ] 3 botões de ação são claramente visíveis

### Como Testar

1. Abra Chrome DevTools (F12)
2. Clique no ícone de dispositivo móvel (Ctrl+Shift+M)
3. Selecione "iPhone SE" ou digite largura 375px
4. Navegue pelo editor:
   - Clique em cada momento temático
   - Abra cada modal (mensagem, foto, música)
   - Teste todos os botões
   - Verifique que tudo é tocável

## 📱 Teste 2: Responsividade Tablet (640px - 1024px)

### Dispositivos Recomendados
- iPad (768px)
- iPad Air (820px)
- iPad Pro (1024px)

### Checklist

#### Layout Geral
- [ ] Grid de cards mostra 2 colunas
- [ ] Navegação de momentos está horizontal (3 colunas)
- [ ] Header tem padding médio (px-6)
- [ ] Footer tem botões horizontais
- [ ] Espaçamento entre elementos é adequado

#### Modais
- [ ] Modais têm bordas arredondadas
- [ ] Modais têm max-width
- [ ] Modais não ocupam tela completa
- [ ] Padding interno é px-6
- [ ] Backdrop é visível

#### Cards
- [ ] 2 cards por linha
- [ ] Cards têm tamanho equilibrado
- [ ] Espaçamento entre cards é adequado

### Como Testar

1. Abra Chrome DevTools (F12)
2. Clique no ícone de dispositivo móvel (Ctrl+Shift+M)
3. Selecione "iPad" ou digite largura 768px
4. Navegue pelo editor e verifique layout

## 💻 Teste 3: Responsividade Desktop (> 1024px)

### Resoluções Recomendadas
- 1280px (laptop pequeno)
- 1440px (laptop médio)
- 1920px (desktop)

### Checklist

#### Layout Geral
- [ ] Grid de cards mostra 2 colunas
- [ ] Navegação de momentos está horizontal (3 colunas)
- [ ] Header tem padding completo (px-8)
- [ ] Footer tem botões horizontais
- [ ] Conteúdo está centralizado com max-width

#### Modais
- [ ] Modais têm bordas arredondadas
- [ ] Modais têm max-width apropriado
- [ ] Modais estão centralizados
- [ ] Backdrop é visível
- [ ] Padding interno é px-6

#### Hover States
- [ ] Cards têm hover effect
- [ ] Botões têm hover effect
- [ ] Navegação de momentos tem hover effect

### Como Testar

1. Abra o navegador em tela cheia
2. Navegue pelo editor
3. Teste hover em todos os elementos
4. Verifique que layout é confortável

## ⌨️ Teste 4: Navegação por Teclado

### Checklist Geral

#### Navegação Básica
- [ ] Tab navega entre elementos na ordem correta
- [ ] Shift+Tab navega para trás
- [ ] Enter ativa botões
- [ ] Espaço ativa botões
- [ ] Estados de foco são claramente visíveis

#### Navegação de Momentos
- [ ] Tab alcança botões de momentos
- [ ] Enter/Espaço muda de momento
- [ ] Foco é visível no momento ativo

#### Cards
- [ ] Tab alcança botões de ação dos cards
- [ ] Enter/Espaço abre modais
- [ ] Ordem de foco é lógica (mensagem → foto → música)

#### Footer
- [ ] Tab alcança botões Anterior/Próximo/Finalizar
- [ ] Enter/Espaço ativa navegação
- [ ] Botão desabilitado não recebe foco

### Checklist de Modais

#### EditMessageModal
- [ ] Modal abre com foco no campo de título
- [ ] Tab navega: título → mensagem → cancelar → salvar
- [ ] Shift+Tab navega para trás
- [ ] Tab no último elemento volta ao primeiro (focus trap)
- [ ] Escape fecha o modal
- [ ] Ctrl+Enter salva rapidamente
- [ ] Confirmação de descarte funciona com teclado

#### PhotoUploadModal
- [ ] Modal abre com foco na área de upload
- [ ] Tab navega entre elementos
- [ ] Focus trap funciona
- [ ] Escape fecha o modal
- [ ] Enter em botões funciona

#### MusicSelectionModal
- [ ] Modal abre com foco no campo de URL
- [ ] Tab navega entre elementos
- [ ] Focus trap funciona
- [ ] Escape fecha o modal
- [ ] Ctrl+Enter salva rapidamente

### Como Testar

1. Abra o editor
2. Use APENAS o teclado (não toque no mouse)
3. Navegue por todos os elementos
4. Abra e feche todos os modais
5. Verifique que tudo é acessível

## 🔊 Teste 5: Screen Reader

### Ferramentas

#### Windows
- **NVDA** (gratuito): https://www.nvaccess.org/download/
- **JAWS** (pago): https://www.freedomscientific.com/products/software/jaws/

#### macOS
- **VoiceOver** (nativo): Cmd+F5

#### iOS
- **VoiceOver** (nativo): Settings → Accessibility → VoiceOver

#### Android
- **TalkBack** (nativo): Settings → Accessibility → TalkBack

### Checklist com NVDA (Windows)

#### Configuração
1. Instale NVDA
2. Inicie NVDA (Ctrl+Alt+N)
3. Abra o navegador
4. Navegue para o editor

#### Teste de Navegação
- [ ] NVDA anuncia "Editor de cartas, main"
- [ ] Header é anunciado como "banner"
- [ ] Footer é anunciado como "contentinfo"
- [ ] Navegação de momentos é anunciada corretamente

#### Teste de Cards
- [ ] Card é anunciado como "article"
- [ ] Título do card é lido
- [ ] Mensagem do card é lida
- [ ] Indicadores (mensagem, foto, música) são lidos
- [ ] Botões de ação têm labels descritivos

#### Teste de Modais
- [ ] Modal é anunciado como "dialog"
- [ ] Título do modal é lido
- [ ] Descrição do modal é lida
- [ ] Campos de formulário têm labels
- [ ] Campos obrigatórios são anunciados
- [ ] Erros são anunciados com "alert"
- [ ] Mensagens de sucesso são anunciadas

#### Teste de Navegação de Momentos
- [ ] Botões têm labels descritivos
- [ ] Status de completude é anunciado
- [ ] Momento ativo é anunciado com "current step"
- [ ] Progresso é anunciado

### Checklist com VoiceOver (macOS)

#### Configuração
1. Pressione Cmd+F5 para ativar VoiceOver
2. Abra Safari ou Chrome
3. Navegue para o editor

#### Teste de Navegação
- [ ] Use VO+Right Arrow para navegar
- [ ] Use VO+Space para ativar elementos
- [ ] Verifique que todos os elementos são anunciados
- [ ] Verifique que labels são descritivos

### Como Testar

1. Ative o screen reader
2. Feche os olhos (para simular usuário cego)
3. Navegue pelo editor usando apenas o screen reader
4. Tente completar tarefas:
   - Navegar entre momentos
   - Editar uma carta
   - Adicionar foto
   - Adicionar música
   - Finalizar

## 👆 Teste 6: Touch Targets

### Checklist

#### Tamanho Mínimo (44x44px)
- [ ] Botões de navegação de momentos
- [ ] Botões de ação dos cards
- [ ] Botões de footer (Anterior/Próximo/Finalizar)
- [ ] Botões de modais (Cancelar/Salvar/Remover)
- [ ] Botão de fechar modal (X)

#### Espaçamento
- [ ] Botões não se sobrepõem
- [ ] Há espaço suficiente entre botões
- [ ] Fácil de tocar o botão correto

### Como Testar

1. Abra o editor em um dispositivo móvel real
2. Tente tocar todos os botões
3. Verifique que é fácil tocar sem errar
4. Verifique que não há toques acidentais

## 🎨 Teste 7: Contraste de Cores

### Ferramentas
- Chrome DevTools → Lighthouse → Accessibility
- axe DevTools Extension
- WAVE Extension

### Checklist

#### Texto
- [ ] Texto principal tem contraste mínimo 4.5:1
- [ ] Texto secundário tem contraste mínimo 4.5:1
- [ ] Links têm contraste mínimo 4.5:1

#### Botões
- [ ] Botões primários têm contraste adequado
- [ ] Botões secundários têm contraste adequado
- [ ] Botões desabilitados são visualmente distintos

#### Estados de Foco
- [ ] Foco é claramente visível
- [ ] Contraste do foco é adequado
- [ ] Foco não é apenas cor (tem outline)

### Como Testar

1. Instale axe DevTools
2. Abra o editor
3. Clique no ícone axe
4. Execute "Scan All of My Page"
5. Verifique que não há erros de contraste

## 📊 Teste 8: Lighthouse Audit

### Como Executar

1. Abra Chrome DevTools (F12)
2. Vá para aba "Lighthouse"
3. Selecione:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. Selecione "Mobile" ou "Desktop"
5. Clique "Analyze page load"

### Metas

- **Accessibility**: ≥ 95
- **Performance**: ≥ 90
- **Best Practices**: ≥ 95
- **SEO**: ≥ 90

### Checklist

- [ ] Score de Accessibility ≥ 95
- [ ] Sem erros críticos de acessibilidade
- [ ] Todos os elementos têm labels
- [ ] Contraste adequado
- [ ] Navegação por teclado funciona

## ✅ Checklist Final

### Responsividade
- [ ] Mobile (< 640px) funciona perfeitamente
- [ ] Tablet (640px - 1024px) funciona perfeitamente
- [ ] Desktop (> 1024px) funciona perfeitamente
- [ ] Modais são fullscreen em mobile
- [ ] Layout se adapta suavemente

### Acessibilidade
- [ ] Navegação por teclado completa
- [ ] Screen reader funciona
- [ ] Touch targets ≥ 44x44px
- [ ] Contraste adequado
- [ ] ARIA labels corretos
- [ ] Focus management adequado
- [ ] Lighthouse Accessibility ≥ 95

### Funcionalidade
- [ ] Todas as features funcionam em mobile
- [ ] Todas as features funcionam em tablet
- [ ] Todas as features funcionam em desktop
- [ ] Modais abrem e fecham corretamente
- [ ] Navegação entre momentos funciona
- [ ] Edição de cartas funciona
- [ ] Upload de fotos funciona
- [ ] Seleção de música funciona

## 🐛 Reportando Problemas

Se encontrar problemas, reporte com:

1. **Dispositivo/Navegador**: Ex: iPhone 12, Safari 15
2. **Resolução**: Ex: 390x844
3. **Descrição**: O que aconteceu
4. **Esperado**: O que deveria acontecer
5. **Passos para reproduzir**: Como reproduzir o problema
6. **Screenshot**: Se possível

## 📝 Conclusão

Após completar todos os testes, você deve ter verificado:

- ✅ Responsividade em mobile, tablet e desktop
- ✅ Modais fullscreen em mobile
- ✅ Navegação por teclado completa
- ✅ Compatibilidade com screen readers
- ✅ Touch targets adequados
- ✅ Contraste de cores adequado
- ✅ Score alto no Lighthouse

Se todos os testes passarem, a implementação está pronta para produção! 🎉
