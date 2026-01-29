# Como Corrigir o Erro na Página /editor/12-cartas

## Problema Identificado

A página `/editor/12-cartas` está mostrando o erro "[object Object]", o que indica que há um erro sendo lançado mas não está sendo formatado corretamente como string.

## Correções Aplicadas

1. **Melhor tratamento de erros na página do editor** - Agora os erros são convertidos para string antes de serem exibidos
2. **Logs adicionais para debug** - Adicionados console.logs para identificar onde o erro está acontecendo

## Passos para Resolver

### 1. Certifique-se de que o servidor Next.js está rodando

```powershell
npm run dev
```

O servidor deve iniciar em `http://localhost:3000`

### 2. Verifique o console do navegador

1. Abra o navegador em `http://localhost:3000/editor/12-cartas`
2. Abra o DevTools (F12)
3. Vá para a aba "Console"
4. Procure por erros em vermelho

### 3. Verifique os logs do servidor Next.js

No terminal onde você executou `npm run dev`, procure por erros relacionados a:
- Conexão com banco de dados
- Erros de API
- Erros de compilação

### 4. Teste a API diretamente

Com o servidor rodando, execute em outro terminal:

```powershell
# Teste a criação de coleção
curl -X POST http://localhost:3000/api/card-collections/create `
  -H "Content-Type: application/json" `
  -d '{\"recipientName\":\"Test\",\"senderName\":\"Test\",\"contactEmail\":\"test@example.com\"}'
```

Ou use o PowerShell:

```powershell
$body = @{
    recipientName = "Test"
    senderName = "Test"
    contactEmail = "test@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/card-collections/create" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### 5. Verifique as variáveis de ambiente

Certifique-se de que o arquivo `.env.local` existe e contém:

```env
# Database
DATABASE_URL=postgresql://...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=...

# R2/Cloudflare
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...
```

## Possíveis Causas do Erro

### 1. Banco de Dados

**Sintoma:** Erro ao criar coleção
**Solução:** Verifique se o PostgreSQL está rodando e se as migrations foram executadas

```powershell
npx tsx src/lib/migrations/verify-card-tables.ts
```

### 2. Variáveis de Ambiente

**Sintoma:** Erro "DATABASE_URL is not defined" ou similar
**Solução:** Verifique o arquivo `.env.local`

### 3. Servidor não está rodando

**Sintoma:** Erro "Failed to fetch" ou "ECONNREFUSED"
**Solução:** Inicie o servidor com `npm run dev`

### 4. Erro de compilação TypeScript

**Sintoma:** Página em branco ou erro de compilação
**Solução:** Verifique os logs do servidor e corrija erros de TypeScript

## Debug Avançado

### Verificar logs detalhados

1. Abra o arquivo `src/app/(marketing)/editor/12-cartas/page.tsx`
2. Os logs já foram adicionados, procure por:
   - "Creating new collection..."
   - "Create response status: XXX"
   - "Create response error: ..."

### Testar serviços diretamente

Execute o script de diagnóstico (requer servidor parado):

```powershell
# Pare o servidor Next.js primeiro (Ctrl+C)
# Depois execute:
npx tsx test-card-services.ts
```

## Solução Rápida

Se nada funcionar, tente:

1. **Limpar cache e reinstalar dependências:**
```powershell
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

2. **Verificar se as migrations foram executadas:**
```powershell
npx tsx src/lib/migrations/run-004-005.ts
```

3. **Testar em modo incógnito:**
   - Às vezes o cache do navegador causa problemas
   - Abra uma janela anônima e teste novamente

## Próximos Passos

Depois de identificar o erro específico:

1. **Se for erro de banco de dados:** Execute as migrations
2. **Se for erro de API:** Verifique os logs do servidor
3. **Se for erro de frontend:** Verifique o console do navegador
4. **Se for erro de variáveis de ambiente:** Configure o `.env.local`

## Contato

Se o erro persistir, forneça:
1. Mensagem de erro completa do console do navegador
2. Logs do servidor Next.js
3. Resultado do comando `npx tsx src/lib/migrations/verify-card-tables.ts`
4. Screenshot do erro na página

---

**Última atualização:** 2026-01-05
**Status:** Correções aplicadas, aguardando teste
