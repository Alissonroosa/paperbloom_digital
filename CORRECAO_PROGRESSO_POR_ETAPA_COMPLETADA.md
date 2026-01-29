# Correção: Progresso Baseado em Etapas Completadas

## Problema Identificado
As cartas já vinham com mensagens padrão preenchidas, então eram consideradas "completas" desde o início, mostrando "12 de 12 cartas completas - 100%" logo na primeira etapa.

## Causa Raiz
As cartas são criadas com templates que já incluem:
- Título preenchido (ex: "Abra quando... estiver tendo um dia difícil")
- Mensagem padrão preenchida (texto completo)

Isso fazia com que a validação de "carta completa" (título + mensagem preenchidos) fosse satisfeita imediatamente.

## Solução Implementada

### Sistema de Rastreamento de Etapas Completadas

Implementei um sistema que rastreia quais etapas o usuário já completou (clicou em "Próximo"):

```typescript
// Track which steps have been completed (user clicked "Next")
const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
```

### Lógica de Progresso Atualizada

O progresso agora só conta cartas das etapas que foram **completadas pelo usuário**:

```typescript
// Calculate overall progress based on completed steps
const { totalCards, completedCards, overallProgress } = useMemo(() => {
  // Always count all 12 cards for the total
  const total = 12;
  
  // Determine which cards should be counted based on completed steps
  let cardsToCount: typeof cards = [];
  
  // Step 0 (intro) doesn't have cards
  // Step 1 = cards 0-3
  // Step 2 = cards 4-7
  // Step 3 = cards 8-11
  
  if (completedSteps.has(1)) {
    cardsToCount = [...cardsToCount, ...cards.slice(0, 4)];
  }
  if (completedSteps.has(2)) {
    cardsToCount = [...cardsToCount, ...cards.slice(4, 8)];
  }
  if (completedSteps.has(3)) {
    cardsToCount = [...cardsToCount, ...cards.slice(8, 12)];
  }
  
  // Count completed cards only from the steps that were completed
  const completed = cardsToCount.filter(card => {
    return (
      card.title.trim().length > 0 &&
      card.messageText.trim().length > 0 &&
      card.messageText.length <= 500
    );
  }).length;
  
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    totalCards: shouldShowProgress ? total : 0,
    completedCards: completed,
    overallProgress: progress,
  };
}, [cards, currentStep, completedSteps]);
```

### Marcação de Etapas como Completadas

Quando o usuário clica em "Próximo", a etapa atual é marcada como completada:

```typescript
const goToNextStep = useCallback(() => {
  if (currentStep < STEPS.length - 1) {
    // Mark current step as completed when moving forward
    if (currentStep > 0 && currentStep <= 3) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
    }
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [currentStep]);
```

## Comportamento Esperado

### Etapa 1 - Mensagem Inicial
- ❌ Não mostra badge de progresso
- ✅ Usuário preenche: De, Para, Música (opcional)
- ✅ Clica em "Próximo"

### Etapa 2 - Momentos Difíceis (Cartas 1-4)
- ✅ Mostra "0 de 12 cartas completas - 0%"
- ✅ Usuário pode editar ou deixar as mensagens padrão
- ✅ Clica em "Próximo" → Etapa 2 marcada como completada
- ✅ Progresso atualiza para "4 de 12 cartas completas - 33%"

### Etapa 3 - Momentos de Amor (Cartas 5-8)
- ✅ Mostra "4 de 12 cartas completas - 33%"
- ✅ Usuário pode editar ou deixar as mensagens padrão
- ✅ Clica em "Próximo" → Etapa 3 marcada como completada
- ✅ Progresso atualiza para "8 de 12 cartas completas - 67%"

### Etapa 4 - Momentos Especiais (Cartas 9-12)
- ✅ Mostra "8 de 12 cartas completas - 67%"
- ✅ Usuário pode editar ou deixar as mensagens padrão
- ✅ Clica em "Próximo" → Etapa 4 marcada como completada
- ✅ Progresso atualiza para "12 de 12 cartas completas - 100%"

### Etapa 5 - Dados para Envio
- ✅ Mostra "12 de 12 cartas completas - 100%"
- ✅ Usuário preenche: Nome, Telefone, Email
- ✅ Clica em "Finalizar"

## Fluxo de Progresso

| Ação do Usuário | Etapa Atual | Etapas Completadas | Progresso Exibido |
|------------------|-------------|-------------------|-------------------|
| Inicia editor | 1 | [] | (sem badge) |
| Clica "Próximo" | 2 | [] | "0 de 12 - 0%" |
| Clica "Próximo" | 3 | [2] | "4 de 12 - 33%" |
| Clica "Próximo" | 4 | [2, 3] | "8 de 12 - 67%" |
| Clica "Próximo" | 5 | [2, 3, 4] | "12 de 12 - 100%" |

## Benefícios

1. **Progresso Real**: Reflete as etapas que o usuário realmente completou
2. **Sem Confusão**: Não mostra 100% antes do usuário avançar pelas etapas
3. **Flexibilidade**: Usuário pode usar mensagens padrão ou personalizá-las
4. **Feedback Claro**: Progresso aumenta conforme avança nas etapas

## Comportamento ao Voltar

Se o usuário voltar para uma etapa anterior:
- O progresso **não diminui**
- As etapas já completadas permanecem marcadas
- Isso permite que o usuário revise sem perder o progresso

## Arquivos Modificados

- `src/components/card-editor/FiveStepCardCollectionEditor.tsx`
  - Adicionado estado `completedSteps` (Set<number>)
  - Atualizado `goToNextStep()` para marcar etapas como completadas
  - Atualizado cálculo de progresso para considerar apenas etapas completadas
  - Adicionado `completedSteps` como dependência do `useMemo`

## Teste

Para testar a correção:

1. Acesse: http://localhost:3000/editor/12-cartas
2. **Etapa 1**: Preencha dados básicos, clique "Próximo"
3. **Etapa 2**: Verifique que mostra "0 de 12 cartas completas - 0%"
4. Clique "Próximo" **sem editar nada**
5. **Etapa 3**: Verifique que agora mostra "4 de 12 cartas completas - 33%"
6. Clique "Próximo" novamente
7. **Etapa 4**: Verifique que mostra "8 de 12 cartas completas - 67%"
8. Clique "Próximo" mais uma vez
9. **Etapa 5**: Verifique que mostra "12 de 12 cartas completas - 100%"

## Status
✅ **CORRIGIDO** - Progresso agora se completa apenas quando usuário clica em "Próximo"
