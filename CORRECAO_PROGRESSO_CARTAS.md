# Correção: Progresso de Cartas - Total Acumulado

## Problema Identificado
O progresso estava mostrando apenas as cartas da etapa atual (ex: "4 de 4 cartas completas - 100%"), quando deveria mostrar o progresso acumulado em relação ao total de 12 cartas (ex: "4 de 12 cartas completas - 33%").

## Causa
O cálculo estava usando apenas as cartas disponíveis na etapa atual como total, em vez de sempre usar 12 como referência.

## Solução Implementada

### Lógica de Progresso Acumulado

Agora o progresso sempre mostra o total de 12 cartas, mas conta apenas as cartas completas de todas as etapas:

```typescript
// Calculate overall progress based on current step
const { totalCards, completedCards, overallProgress } = useMemo(() => {
  // Always count all 12 cards for the total
  const total = 12;
  
  // Count completed cards from ALL cards (not just current step)
  const completed = cards.filter(card => {
    return (
      card.title.trim().length > 0 &&
      card.messageText.trim().length > 0 &&
      card.messageText.length <= 500
    );
  }).length;
  
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Only show progress if we're past the intro step
  const shouldShowProgress = currentStep > 0;
  
  return {
    totalCards: shouldShowProgress ? total : 0,
    completedCards: completed,
    overallProgress: progress,
  };
}, [cards, currentStep]);
```

## Comportamento Esperado

### Etapa 1 - Mensagem Inicial
- ❌ Não mostra badge de progresso
- ✅ Usuário preenche: De, Para, Música (opcional)

### Etapa 2 - Momentos Difíceis (Cartas 1-4)
- ✅ Mostra "0 de 12 cartas completas - 0%"
- ✅ Ao completar 1 carta: "1 de 12 cartas completas - 8%"
- ✅ Ao completar 2 cartas: "2 de 12 cartas completas - 17%"
- ✅ Ao completar 3 cartas: "3 de 12 cartas completas - 25%"
- ✅ Ao completar 4 cartas: "4 de 12 cartas completas - 33%"

### Etapa 3 - Momentos de Amor (Cartas 5-8)
- ✅ Mostra "4 de 12 cartas completas - 33%" (se completou etapa anterior)
- ✅ Ao completar mais cartas: "5 de 12", "6 de 12", "7 de 12", "8 de 12"
- ✅ Ao completar todas: "8 de 12 cartas completas - 67%"

### Etapa 4 - Momentos Especiais (Cartas 9-12)
- ✅ Mostra "8 de 12 cartas completas - 67%" (se completou etapas anteriores)
- ✅ Ao completar mais cartas: "9 de 12", "10 de 12", "11 de 12"
- ✅ Ao completar todas: "12 de 12 cartas completas - 100%"

### Etapa 5 - Dados para Envio
- ✅ Mostra progresso final: "X de 12 cartas completas - Y%"
- ✅ Usuário preenche: Nome, Telefone, Email

## Benefícios

1. **Progresso Real**: O usuário vê o progresso real em relação ao total de 12 cartas
2. **Motivação Contínua**: Cada carta completa aumenta o progresso geral
3. **Clareza**: Sempre fica claro quantas cartas faltam para completar
4. **Consistência**: O total sempre é 12, facilitando o entendimento

## Exemplo de Progressão

| Etapa | Cartas Completas | Exibição |
|-------|------------------|----------|
| 1 | 0 | (sem badge) |
| 2 | 0 | "0 de 12 cartas completas - 0%" |
| 2 | 2 | "2 de 12 cartas completas - 17%" |
| 2 | 4 | "4 de 12 cartas completas - 33%" |
| 3 | 4 | "4 de 12 cartas completas - 33%" |
| 3 | 6 | "6 de 12 cartas completas - 50%" |
| 3 | 8 | "8 de 12 cartas completas - 67%" |
| 4 | 8 | "8 de 12 cartas completas - 67%" |
| 4 | 10 | "10 de 12 cartas completas - 83%" |
| 4 | 12 | "12 de 12 cartas completas - 100%" |
| 5 | 12 | "12 de 12 cartas completas - 100%" |

## Arquivos Modificados

- `src/components/card-editor/FiveStepCardCollectionEditor.tsx`
  - Alterado `total` para sempre ser 12
  - Alterado `completed` para contar todas as cartas (não apenas da etapa atual)
  - Adicionado `shouldShowProgress` para ocultar badge na etapa 1

## Teste

Para testar a correção:

1. Acesse: http://localhost:3000/editor/12-cartas
2. **Etapa 1**: Verifique que NÃO aparece badge de progresso
3. **Etapa 2**: Verifique que mostra "0 de 12 cartas"
4. Edite 2 cartas e veja: "2 de 12 cartas completas - 17%"
5. Complete as 4 primeiras e veja: "4 de 12 cartas completas - 33%"
6. Avance para **Etapa 3**: Ainda mostra "4 de 12 cartas completas - 33%"
7. Complete mais 4 cartas: "8 de 12 cartas completas - 67%"
8. Continue até completar todas: "12 de 12 cartas completas - 100%"

## Status
✅ **CORRIGIDO** - Progresso agora mostra total acumulado de 12 cartas
