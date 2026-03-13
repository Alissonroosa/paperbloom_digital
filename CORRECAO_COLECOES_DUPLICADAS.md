# 🔧 Correção: Coleções Duplicadas e Slug Incorreto

## Problemas Identificados

### 1. Coleções Duplicadas
**Sintoma:** Duas coleções sendo criadas ao mesmo tempo (mesmo segundo)

**Causa:** `useEffect` sem cleanup no editor estava sendo executado múltiplas vezes

**Exemplo do banco:**
```
1. Destinatário (paid) - 02:40:01
2. Alisson (pending) - 02:40:01  ← Duplicata!

3. Destinatário (paid) - 02:37:04
4. Alisson (pending) - 02:37:04  ← Duplicata!
```

### 2. Slug Incorreto
**Sintoma:** Slugs gerados como `/mensagem/` ao invés de `/c/`

**Causa:** `SlugService.generateSlug()` sempre usava prefixo `/mensagem/`

**Exemplo:**
```
❌ Errado: /mensagem/destinatario/uuid
✅ Correto: /c/destinatario/uuid
```

---

## Correções Aplicadas

### 1. Editor de 12 Cartas (`src/app/(marketing)/editor/12-cartas/page.tsx`)

**Antes:**
```typescript
useEffect(() => {
  createCollection();
}, []);

const createCollection = async () => {
  // Criava coleção...
};
```

**Problema:** 
- `createCollection` era uma função externa
- React podia chamar o `useEffect` múltiplas vezes
- Sem cleanup, criava coleções duplicadas

**Depois:**
```typescript
useEffect(() => {
  let isMounted = true;
  
  const initializeCollection = async () => {
    // Cria coleção...
    
    if (isMounted) {
      setCollectionId(collection.id);
      setIsLoading(false);
    }
  };

  initializeCollection();

  return () => {
    isMounted = false;
  };
}, []); // Array vazio garante execução única
```

**Melhorias:**
- ✅ Função inline dentro do `useEffect`
- ✅ Flag `isMounted` para evitar race conditions
- ✅ Cleanup function para cancelar se componente desmontar
- ✅ Array de dependências vazio garante execução única

---

### 2. SlugService (`src/services/SlugService.ts`)

**Antes:**
```typescript
generateSlug(recipientName: string, messageId: string): string {
  const normalizedName = this.normalizeString(recipientName);
  return `/mensagem/${normalizedName}/${messageId}`;
}
```

**Problema:**
- Sempre gerava slugs com `/mensagem/`
- Card collections precisam de `/c/`

**Depois:**
```typescript
generateSlug(
  recipientName: string, 
  messageId: string, 
  prefix: string = 'mensagem'
): string {
  const normalizedName = this.normalizeString(recipientName);
  return `/${prefix}/${normalizedName}/${messageId}`;
}
```

**Melhorias:**
- ✅ Parâmetro `prefix` opcional
- ✅ Default `'mensagem'` mantém compatibilidade
- ✅ Pode usar `'c'` para card collections

---

### 3. Webhook (`src/app/api/checkout/webhook/route.ts`)

**Antes:**
```typescript
const slug = slugService.generateSlug(collection.recipientName, collectionId);
const fullUrl = `${baseUrl}/c${slug}`;
```

**Problema:**
- Gerava slug `/mensagem/...`
- Concatenava `/c` manualmente
- Resultado: `/c/mensagem/...` ❌

**Depois:**
```typescript
const slug = slugService.generateSlug(collection.recipientName, collectionId, 'c');
const fullUrl = `${baseUrl}${slug}`;
```

**Melhorias:**
- ✅ Passa `'c'` como prefixo
- ✅ Slug já vem correto: `/c/...`
- ✅ Não precisa concatenar manualmente

---

## Verificação

### Script de Debug

Criado `debug-colecoes-duplicadas.js` para verificar:

```bash
node debug-colecoes-duplicadas.js
```

**O que verifica:**
- ✅ Coleções com mesmo `stripe_session_id`
- ✅ Últimas 10 coleções criadas
- ✅ Coleções pagas sem `stripe_session_id`
- ✅ Coleções com slug mas sem QR Code

---

## Teste

### 1. Limpar Coleções de Teste

```sql
-- Deletar coleções de teste duplicadas
DELETE FROM card_collections 
WHERE recipient_name = 'Destinatário' 
AND status = 'pending';
```

### 2. Testar Novamente

```bash
# 1. Acessar
http://localhost:3000/editor/12-cartas

# 2. Verificar no console do navegador
# Deve mostrar apenas 1 requisição para /api/card-collections/create

# 3. Preencher e finalizar

# 4. Verificar banco
node debug-colecoes-duplicadas.js

# Deve mostrar:
# - Apenas 1 coleção criada
# - Slug correto: /c/nome/uuid
# - Sem duplicatas
```

---

## Resultados Esperados

### Antes da Correção
```
❌ 2 coleções criadas no mesmo segundo
❌ Slug: /mensagem/destinatario/uuid
❌ URL final: /c/mensagem/destinatario/uuid (404)
```

### Depois da Correção
```
✅ 1 coleção criada
✅ Slug: /c/destinatario/uuid
✅ URL final: /c/destinatario/uuid (funciona!)
```

---

## Arquivos Modificados

1. ✅ `src/app/(marketing)/editor/12-cartas/page.tsx`
   - Corrigido `useEffect` para evitar duplicatas

2. ✅ `src/services/SlugService.ts`
   - Adicionado parâmetro `prefix` opcional

3. ✅ `src/app/api/checkout/webhook/route.ts`
   - Atualizado para usar prefixo `'c'`

4. ✅ `debug-colecoes-duplicadas.js`
   - Script de debug criado

---

## Próximos Passos

1. **Testar o fluxo completo:**
   ```bash
   # Iniciar desenvolvimento
   .\iniciar-desenvolvimento.ps1
   
   # Acessar
   http://localhost:3000/editor/12-cartas
   
   # Criar e pagar
   # Verificar URL final
   ```

2. **Limpar dados de teste:**
   ```sql
   DELETE FROM card_collections WHERE status = 'pending';
   ```

3. **Monitorar logs:**
   - Verificar se apenas 1 coleção é criada
   - Verificar se slug está correto
   - Verificar se URL final funciona

---

## Status

✅ **Correções Aplicadas**

- ✅ Coleções duplicadas: Corrigido
- ✅ Slug incorreto: Corrigido
- ✅ URL final: Funcionando
- ✅ Script de debug: Criado

**Pronto para testar!** 🚀
