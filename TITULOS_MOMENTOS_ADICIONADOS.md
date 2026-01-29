# Títulos dos Momentos Adicionados às Etapas

## Objetivo
Adicionar títulos temáticos que representam os momentos de cada grupo de 4 cartas, tornando mais claro para o usuário o que cada etapa representa.

## Mudanças Implementadas

### Organização dos Grupos por Momentos

As 12 cartas foram organizadas em 3 grupos temáticos baseados nos títulos das cartas:

#### **Etapa 2: Momentos Difíceis** (Cartas 1-4)
Cartas para momentos de desafio e superação:
1. "Abra quando... estiver tendo um dia difícil"
2. "Abra quando... estiver se sentindo inseguro(a)"
3. "Abra quando... estivermos longe um do outro"
4. "Abra quando... estiver estressado(a) com o trabalho"

#### **Etapa 3: Momentos de Amor** (Cartas 5-8)
Cartas para expressar amor e celebrar a relação:
5. "Abra quando... quiser saber o quanto eu te amo"
6. "Abra quando... completarmos mais um ano juntos"
7. "Abra quando... estivermos celebrando uma conquista sua"
8. "Abra quando... for uma noite de chuva e tédio"

#### **Etapa 4: Momentos Especiais** (Cartas 9-12)
Cartas para situações específicas e momentos únicos:
9. "Abra quando... tivermos nossa primeira briga boba"
10. "Abra quando... você precisar dar uma risada"
11. "Abra quando... eu tiver feito algo que te irritou"
12. "Abra quando... você não conseguir dormir"

### Estrutura Atualizada

```typescript
const STEPS = [
  { 
    index: 0, 
    title: 'Mensagem Inicial', 
    type: 'intro' as const 
  },
  { 
    index: 1, 
    title: 'Momentos Difíceis', 
    subtitle: 'Cartas 1-4', 
    type: 'cards' as const, 
    cardIndices: [0, 1, 2, 3] 
  },
  { 
    index: 2, 
    title: 'Momentos de Amor', 
    subtitle: 'Cartas 5-8', 
    type: 'cards' as const, 
    cardIndices: [4, 5, 6, 7] 
  },
  { 
    index: 3, 
    title: 'Momentos Especiais', 
    subtitle: 'Cartas 9-12', 
    type: 'cards' as const, 
    cardIndices: [8, 9, 10, 11] 
  },
  { 
    index: 4, 
    title: 'Dados para Envio', 
    type: 'delivery' as const 
  },
];
```

### Exibição Visual

O título agora é exibido com duas linhas quando há subtítulo:

```tsx
<div className="space-y-2">
  <h2 className="text-xl md:text-2xl font-serif font-bold text-text-main">
    {currentStepConfig.title}
  </h2>
  {currentStepConfig.subtitle && (
    <p className="text-xs text-gray-500 font-medium">
      {currentStepConfig.subtitle}
    </p>
  )}
  <p className="text-sm text-muted-foreground">
    Passo {currentStep + 1} de {STEPS.length}
  </p>
  {/* Progress Badge */}
</div>
```

## Resultado Visual

### Antes:
```
Cartas 1-4
Passo 2 de 5
```

### Depois:
```
Momentos Difíceis
Cartas 1-4
Passo 2 de 5
```

## Benefícios

1. **Contexto Claro**: O usuário entende imediatamente o tema das cartas que vai editar
2. **Organização Temática**: As cartas são agrupadas por propósito emocional
3. **Melhor UX**: Facilita a navegação e compreensão do fluxo
4. **Significado**: Cada grupo tem um propósito claro e definido

## Hierarquia Visual

- **Título Principal** (text-xl md:text-2xl, font-serif, font-bold): "Momentos Difíceis"
- **Subtítulo** (text-xs, text-gray-500, font-medium): "Cartas 1-4"
- **Descrição** (text-sm, text-muted-foreground): "Passo 2 de 5"
- **Badge de Progresso** (text-xs): "0 de 4 cartas completas - 0%"

## Arquivos Modificados

1. **src/components/card-editor/FiveStepCardCollectionEditor.tsx**
   - Adicionado campo `subtitle` opcional na configuração dos STEPS
   - Atualizado JSX para exibir o subtítulo quando presente
   - Removido import não utilizado (`Music`)

## Teste

Para testar as mudanças:

1. Acesse: http://localhost:3000/editor/12-cartas
2. Navegue até a **Etapa 2** e veja: "Momentos Difíceis" + "Cartas 1-4"
3. Navegue até a **Etapa 3** e veja: "Momentos de Amor" + "Cartas 5-8"
4. Navegue até a **Etapa 4** e veja: "Momentos Especiais" + "Cartas 9-12"

## Status
✅ **IMPLEMENTADO** - Títulos dos momentos adicionados com sucesso
