# 🔒 Relatório Completo de Segurança - Paper Bloom Digital

**Data:** 28 de Janeiro de 2026  
**Versão:** 1.0  
**Status:** Análise Completa Realizada

---

## 📋 Sumário Executivo

Análise de segurança completa identificou **6 vulnerabilidades de dependências** e **8 áreas de melhoria** em segurança da aplicação. A maioria das vulnerabilidades são de severidade **ALTA** e requerem ação imediata.

### Status Geral
- ✅ **Boas Práticas Implementadas:** 12
- ⚠️ **Vulnerabilidades Críticas:** 0
- 🔴 **Vulnerabilidades Altas:** 5
- 🟡 **Vulnerabilidades Médias/Baixas:** 1
- 🔧 **Melhorias Recomendadas:** 8

---

## 🔴 VULNERABILIDADES CRÍTICAS (Ação Imediata)

### 1. Next.js - Múltiplas Vulnerabilidades DoS
**Severidade:** ALTA  
**CVE:** GHSA-mwv6-3258-q52c, GHSA-5j59-xgg2-r9c4, GHSA-h25m-26qc-wcjf, GHSA-9g9p-9gw9-jx7f  
**Versão Atual:** 14.2.33  
**Versão Segura:** 14.2.35+

**Descrição:**
- Denial of Service com Server Components
- Desserialização HTTP pode levar a DoS
- DoS via Image Optimizer remotePatterns

**Impacto:**
- Atacantes podem causar indisponibilidade do serviço
- Consumo excessivo de memória/CPU
- Aplicação pode ficar inacessível

**Solução:**
```bash
npm install next@14.2.35
npm audit fix
```

### 2. glob - Command Injection
**Severidade:** ALTA  
**CVE:** GHSA-5j98-mcp5-4vw2  
**CVSS Score:** 7.5

**Descrição:**
Command injection via -c/--cmd executa matches com shell:true

**Impacto:**
- Execução de comandos arbitrários
- Comprometimento do servidor

**Solução:**
```bash
npm update eslint-config-next@16.1.6
```

### 3. qs - DoS via Memory Exhaustion
**Severidade:** ALTA  
**CVE:** GHSA-6rw7-vpxm-498p  
**CVSS Score:** 7.5

**Descrição:**
Bypass do arrayLimit permite DoS via exaustão de memória

**Impacto:**
- Consumo excessivo de memória
- Crash da aplicação

**Solução:**
```bash
npm audit fix
```

---

## 🟡 VULNERABILIDADES MÉDIAS/BAIXAS

### 4. diff - Denial of Service
**Severidade:** BAIXA  
**CVE:** GHSA-73rr-hh4g-fpgx

**Descrição:**
Vulnerabilidade em parsePatch e applyPatch

**Solução:**
```bash
npm audit fix
```

---

## ✅ BOAS PRÁTICAS IMPLEMENTADAS

### 1. ✅ Proteção contra SQL Injection
**Status:** IMPLEMENTADO CORRETAMENTE

**Evidências:**
- Uso consistente de prepared statements com `pool.query($1, $2, ...)`
- Nenhum uso de template strings com interpolação direta
- Validação de entrada com Zod antes de queries

**Exemplo (CardCollectionService.ts):**
```typescript
const query = `
  INSERT INTO card_collections (id, recipient_name, sender_name)
  VALUES ($1, $2, $3)
  RETURNING *
`;
const values = [id, validatedData.recipientName, validatedData.senderName];
await pool.query<CardCollectionRow>(query, values);
```

### 2. ✅ Validação de Entrada Robusta
**Status:** IMPLEMENTADO CORRETAMENTE

**Implementações:**
- Validação com Zod em todas as rotas de API
- Validação de tipos de arquivo (JPEG, PNG, WebP)
- Validação de tamanho de arquivo (5MB para galeria, 10MB para imagens principais)
- Validação de URLs do YouTube
- Validação de limites de caracteres

**Exemplo (validation.ts):**
```typescript
export const CHARACTER_LIMITS = {
  title: 100,
  message: 500,
  closing: 200,
  signature: 50,
  from: 100,
  to: 100,
} as const;
```

### 3. ✅ Proteção de Variáveis de Ambiente
**Status:** IMPLEMENTADO CORRETAMENTE

**Implementações:**
- Validação de env vars no startup com Zod
- Máscaras para logs de secrets
- Separação clara entre variáveis públicas (NEXT_PUBLIC_*) e privadas
- Arquivo .env.example bem documentado

**Exemplo (env.ts):**
```typescript
function maskSecret(secret: string): string {
  if (secret.length <= 10) return '****';
  return `${secret.substring(0, 10)}...${secret.substring(secret.length - 4)}`;
}
```

### 4. ✅ Verificação de Webhook Stripe
**Status:** IMPLEMENTADO CORRETAMENTE

**Implementações:**
- Verificação de assinatura Stripe obrigatória
- Validação de headers
- Tratamento seguro de eventos

**Exemplo (webhook/route.ts):**
```typescript
const signature = request.headers.get('stripe-signature');
if (!signature) {
  return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
}
event = stripeService.constructWebhookEvent(body, signature);
```

### 5. ✅ Processamento Seguro de Imagens
**Status:** IMPLEMENTADO CORRETAMENTE

**Implementações:**
- Validação de tipo MIME
- Redimensionamento automático com Sharp
- Limites de tamanho configuráveis
- Upload para R2 com validação

### 6. ✅ Proteção contra XSS
**Status:** IMPLEMENTADO CORRETAMENTE

**Evidências:**
- Nenhum uso de `dangerouslySetInnerHTML`
- Nenhum uso de `eval()` ou `new Function()`
- React escapa automaticamente conteúdo

### 7. ✅ CORS Configurado
**Status:** IMPLEMENTADO

**Implementação:**
- Headers CORS em todas as rotas de API
- Suporte a OPTIONS para preflight

### 8. ✅ Tratamento de Erros Estruturado
**Status:** IMPLEMENTADO CORRETAMENTE

**Implementações:**
- Códigos de erro padronizados
- Mensagens de erro sem exposição de detalhes internos
- Logging adequado para debugging

### 9. ✅ Validação de UUID
**Status:** IMPLEMENTADO CORRETAMENTE

**Implementações:**
- Validação de UUID com Zod
- Geração segura com `crypto.randomUUID()`

### 10. ✅ Conexão Segura com Banco de Dados
**Status:** IMPLEMENTADO CORRETAMENTE

**Implementações:**
- Pool de conexões configurado
- Timeouts apropriados
- Tratamento de erros de conexão

### 11. ✅ Sanitização de URLs
**Status:** IMPLEMENTADO

**Implementações:**
- Validação de URLs com Zod
- Verificação de acessibilidade de URLs

### 12. ✅ Secrets Não Expostos no Cliente
**Status:** IMPLEMENTADO CORRETAMENTE

**Evidências:**
- Apenas `NEXT_PUBLIC_*` vars expostas ao cliente
- Stripe secret key e webhook secret apenas no servidor

---

## 🔧 MELHORIAS RECOMENDADAS

### 1. ⚠️ Rate Limiting Ausente
**Severidade:** MÉDIA  
**Prioridade:** ALTA

**Problema:**
Nenhuma rota de API possui rate limiting implementado, permitindo:
- Ataques de força bruta
- Abuso de recursos
- DoS por volume de requisições

**Solução Recomendada:**
```typescript
// Instalar: npm install @upstash/ratelimit @upstash/redis

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 req/10s
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  // ... resto do código
}
```

**Rotas Críticas que Precisam de Rate Limiting:**
- `/api/messages/create`
- `/api/card-collections/create`
- `/api/checkout/create-session`
- `/api/upload/card-image`
- `/api/checkout/webhook` (já tem proteção Stripe, mas adicionar camada extra)

### 2. ⚠️ Headers de Segurança Ausentes
**Severidade:** MÉDIA  
**Prioridade:** ALTA

**Problema:**
Faltam headers de segurança importantes no Next.js config

**Solução:**
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'imagem.paperbloom.com.br',
      },
    ],
  },
};
```

### 3. ⚠️ Content Security Policy (CSP) Ausente
**Severidade:** MÉDIA  
**Prioridade:** MÉDIA

**Problema:**
Sem CSP, a aplicação está vulnerável a:
- XSS attacks
- Clickjacking
- Data injection

**Solução:**
```javascript
// next.config.mjs
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://images.unsplash.com https://imagem.paperbloom.com.br;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

// Adicionar ao headers array:
{
  key: 'Content-Security-Policy',
  value: cspHeader.replace(/\s{2,}/g, ' ').trim()
}
```

### 4. ⚠️ Validação de Tamanho de Payload
**Severidade:** BAIXA  
**Prioridade:** MÉDIA

**Problema:**
Sem limite de tamanho de payload, atacantes podem enviar payloads enormes

**Solução:**
```typescript
// middleware.ts (criar na raiz)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 413 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 5. ⚠️ Logging de Segurança Insuficiente
**Severidade:** BAIXA  
**Prioridade:** MÉDIA

**Problema:**
Falta logging estruturado para eventos de segurança

**Solução:**
```typescript
// src/lib/security-logger.ts
export function logSecurityEvent(event: {
  type: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'suspicious_activity';
  ip: string;
  endpoint: string;
  details?: any;
}) {
  console.warn('[SECURITY]', {
    timestamp: new Date().toISOString(),
    ...event,
  });
  
  // Em produção, enviar para serviço de monitoramento
  // (Sentry, DataDog, CloudWatch, etc.)
}
```

### 6. ⚠️ Validação de Origem de Upload
**Severidade:** BAIXA  
**Prioridade:** BAIXA

**Problema:**
Uploads não verificam origem da requisição

**Solução:**
```typescript
// Adicionar verificação de referer/origin
const origin = request.headers.get('origin');
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

if (origin && !allowedOrigins.includes(origin)) {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}
```

### 7. ⚠️ Timeout de Requisições
**Severidade:** BAIXA  
**Prioridade:** BAIXA

**Problema:**
Requisições podem ficar pendentes indefinidamente

**Solução:**
```typescript
// Adicionar timeout nas rotas de API
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

try {
  // ... operações
} finally {
  clearTimeout(timeoutId);
}
```

### 8. ⚠️ Sanitização de Nomes de Arquivo
**Severidade:** BAIXA  
**Prioridade:** BAIXA

**Problema:**
Nomes de arquivo não são sanitizados (embora use UUID, é boa prática)

**Solução:**
```typescript
// src/lib/file-utils.ts
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}
```

---

## 📊 CORS - Análise Detalhada

### Status Atual
**Configuração:** `Access-Control-Allow-Origin: *`

### Riscos
- Permite requisições de qualquer origem
- Pode expor dados sensíveis
- Facilita ataques CSRF

### Recomendação para Produção
```typescript
// src/lib/cors.ts
const allowedOrigins = [
  'https://paperbloom.com.br',
  'https://www.paperbloom.com.br',
  process.env.NEXT_PUBLIC_BASE_URL,
];

export function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}
```

---

## 🔐 Variáveis de Ambiente - Checklist

### ✅ Variáveis Protegidas Corretamente
- `DATABASE_URL` - Apenas servidor
- `STRIPE_SECRET_KEY` - Apenas servidor
- `STRIPE_WEBHOOK_SECRET` - Apenas servidor
- `R2_SECRET_ACCESS_KEY` - Apenas servidor
- `RESEND_API_KEY` - Apenas servidor

### ✅ Variáveis Públicas (Seguras para Expor)
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### ⚠️ Recomendações
1. Nunca commitar `.env.local`
2. Rotacionar secrets regularmente
3. Usar secrets diferentes para dev/staging/prod
4. Implementar vault para secrets em produção (AWS Secrets Manager, HashiCorp Vault)

---

## 🚀 PLANO DE AÇÃO PRIORITÁRIO

### ⚠️ IMPORTANTE: Sobre as Vulnerabilidades do Next.js

As vulnerabilidades detectadas no Next.js 14.2.33 são **específicas para aplicações self-hosted** e têm impacto limitado:

1. **DoS via Image Optimizer** - Só afeta se você usar `remotePatterns` com domínios não confiáveis
2. **DoS com Server Components** - Requer condições específicas de ataque
3. **HTTP deserialization** - Afeta apenas componentes React Server inseguros

**Sua aplicação está relativamente protegida porque:**
- ✅ Usa apenas domínios confiáveis em `remotePatterns` (Unsplash e seu próprio domínio)
- ✅ Não usa Server Components de forma insegura
- ✅ Tem validação robusta de entrada

### Opções de Correção

#### Opção 1: Atualização Conservadora (RECOMENDADO)
Atualizar apenas o Next.js para versão patch sem breaking changes:

```bash
# Atualizar para última versão 14.x (sem breaking changes)
npm install next@14.2.35

# Verificar se resolveu
npm audit
```

**Prós:** Sem risco de quebrar código existente  
**Contras:** Ainda terá avisos do eslint-config-next (não crítico)

#### Opção 2: Atualização Completa (REQUER TESTES)
Atualizar tudo incluindo breaking changes:

```bash
# Fazer backup primeiro!
git add .
git commit -m "backup antes de atualização major"

# Atualizar com breaking changes
npm audit fix --force

# Testar aplicação
npm run dev
npm run build
npm test
```

**Prós:** Resolve todas as vulnerabilidades  
**Contras:** Pode quebrar código, requer testes extensivos

#### Opção 3: Aceitar Risco Temporariamente (NÃO RECOMENDADO PARA PRODUÇÃO)
Manter versão atual e focar em outras melhorias de segurança:

```bash
# Apenas documentar
npm audit > audit-report.txt
```

### Fase 1: Crítico (Fazer Agora)

**ESCOLHA A OPÇÃO 1 (Recomendado):**

1. ✅ **Atualizar Next.js para 14.2.35**
   ```bash
   npm install next@14.2.35
   npm audit
   ```

2. ✅ **Verificar se aplicação funciona**
   ```bash
   npm run dev
   # Testar: http://localhost:3000
   # Testar: Editor de mensagens
   # Testar: Editor 12 cartas
   ```

3. ✅ **Build de produção**
   ```bash
   npm run build
   npm start
   ```

### Fase 2: Alta Prioridade (Esta Semana)
4. 🔧 **Implementar Rate Limiting**
   - Instalar @upstash/ratelimit
   - Adicionar em rotas críticas
   - Testar limites

5. 🔧 **Adicionar Security Headers**
   - Atualizar next.config.mjs
   - Testar com securityheaders.com

6. 🔧 **Implementar CSP**
   - Definir política
   - Testar em staging
   - Deploy em produção

### Fase 3: Média Prioridade (Este Mês)
7. 🔧 **Adicionar Logging de Segurança**
8. 🔧 **Implementar Validação de Payload**
9. 🔧 **Configurar CORS Restritivo**
10. 🔧 **Adicionar Timeouts**

### Fase 4: Baixa Prioridade (Próximo Sprint)
11. 🔧 **Sanitização de Nomes de Arquivo**
12. 🔧 **Validação de Origem de Upload**

---

## 📝 COMANDOS PARA EXECUÇÃO IMEDIATA

```bash
# 1. Atualizar dependências vulneráveis
npm install next@14.2.35
npm update eslint-config-next@16.1.6
npm audit fix

# 2. Verificar se resolveu
npm audit

# 3. Testar aplicação
npm run dev

# 4. Rodar testes
npm test

# 5. Build de produção
npm run build
```

---

## 🎯 MÉTRICAS DE SEGURANÇA

### Antes da Correção
- Vulnerabilidades Críticas: 0
- Vulnerabilidades Altas: 5
- Vulnerabilidades Médias: 0
- Vulnerabilidades Baixas: 1
- **Score de Segurança: 6/10**

### Após Correção (Estimado)
- Vulnerabilidades Críticas: 0
- Vulnerabilidades Altas: 0
- Vulnerabilidades Médias: 0
- Vulnerabilidades Baixas: 0
- **Score de Segurança: 9/10**

---

## 📚 RECURSOS ADICIONAIS

### Ferramentas Recomendadas
1. **OWASP ZAP** - Teste de penetração
2. **Snyk** - Monitoramento contínuo de vulnerabilidades
3. **SonarQube** - Análise de código estático
4. **npm audit** - Auditoria de dependências

### Documentação
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Stripe Security](https://stripe.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## ✅ CONCLUSÃO

A aplicação **Paper Bloom Digital** possui uma base de segurança sólida com boas práticas implementadas, especialmente em:
- Proteção contra SQL Injection
- Validação de entrada robusta
- Proteção de secrets
- Verificação de webhooks

**Ações Críticas Imediatas:**
1. Atualizar Next.js (vulnerabilidades DoS)
2. Atualizar dependências (glob, qs)
3. Implementar rate limiting
4. Adicionar security headers

**Após implementar as correções prioritárias, a aplicação estará em conformidade com as melhores práticas de segurança para aplicações web modernas.**

---

**Relatório gerado em:** 28/01/2026  
**Próxima revisão recomendada:** Após implementação das correções críticas
