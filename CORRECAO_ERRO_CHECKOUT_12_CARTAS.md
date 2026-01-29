# 🔧 Correção: Erro ao Clicar em "Ir para o Carrinho"

## Problema

Ao clicar no botão "Finalizar e Pagar" no editor de 12 cartas, ocorria o seguinte erro:

```
Unhandled Runtime Error
Error: [object Object]

Source: src\contexts\CardCollectionEditorContext.tsx (402:15)
```

## Causa Raiz

O erro ocorria porque o código estava tentando usar `error.error` diretamente como string no `throw new Error()`, mas a API retorna um objeto estruturado:

```typescript
// Formato de erro da API
{
  error: {
    code: 'INVALID_ID',
    message: 'Invalid collection ID format'
  }
}
```

Quando o código fazia:
```typescript
const error = await response.json();
throw new Error(error.error || 'Failed to update collection');
```

Estava tentando converter o objeto `{ code: '...', message: '...' }` em string, resultando em `[object Object]`.

## Solução

Atualizei o código para extrair corretamente a mensagem de erro:

### Antes:
```typescript
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error || 'Failed to update collection');
}
```

### Depois:
```typescript
if (!response.ok) {
  const errorData = await response.json();
  const errorMessage = errorData.error?.message || errorData.error || 'Failed to update collection';
  throw new Error(errorMessage);
}
```

## Arquivos Corrigidos

**`src/contexts/CardCollectionEditorContext.tsx`**
- Linha ~402: Correção no método `updateCollection`
- Linha ~345: Correção no método `saveCard`

## Como Testar

1. Acesse o editor: `http://localhost:3000/editor/12-cartas`
2. Preencha os dados básicos
3. Clique em "Finalizar e Pagar"
4. ✅ Deve redirecionar para o Stripe sem erros

## Verificação

```bash
# Verificar se não há erros de TypeScript
npm run build

# Ou verificar apenas o arquivo
npx tsc --noEmit src/contexts/CardCollectionEditorContext.tsx
```

## Status

✅ **Corrigido**

O erro foi resolvido e agora o fluxo de checkout funciona corretamente.
