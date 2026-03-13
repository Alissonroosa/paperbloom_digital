# 🛠️ Comandos Úteis - Editor Demo

## 🚀 Iniciar Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar editor demo
# http://localhost:3000/editor/demo/message

# Acessar página demo
# http://localhost:3000/demo/message
```

## 🗄️ Banco de Dados

### Ver Mensagens Demo

```sql
-- Ver última mensagem demo criada
SELECT 
  id,
  recipient_name,
  sender_name,
  title,
  image_url,
  gallery_images,
  youtube_url,
  slug,
  status,
  created_at
FROM messages 
WHERE slug LIKE 'demo-%' 
ORDER BY created_at DESC 
LIMIT 1;
```

```sql
-- Ver todas as mensagens demo
SELECT 
  id,
  recipient_name,
  title,
  slug,
  created_at
FROM messages 
WHERE slug LIKE 'demo-%' 
ORDER BY created_at DESC;
```

```sql
-- Contar mensagens demo
SELECT COUNT(*) as total_demos 
FROM messages 
WHERE slug LIKE 'demo-%';
```

### Limpar Dados

```sql
-- Limpar mensagens demo antigas (mais de 7 dias)
DELETE FROM messages 
WHERE slug LIKE 'demo-%' 
AND created_at < NOW() - INTERVAL '7 days';
```

```sql
-- Limpar TODAS as mensagens demo (CUIDADO!)
DELETE FROM messages 
WHERE slug LIKE 'demo-%';
```

```sql
-- Ver mensagens que serão deletadas (antes de deletar)
SELECT id, recipient_name, created_at 
FROM messages 
WHERE slug LIKE 'demo-%' 
AND created_at < NOW() - INTERVAL '7 days';
```

## 🖼️ Cloudflare R2

### Listar Imagens

```bash
# Usando AWS CLI (compatível com R2)
aws s3 ls s3://seu-bucket/messages/ --recursive --endpoint-url https://seu-account-id.r2.cloudflarestorage.com

# Listar apenas imagens de hoje
aws s3 ls s3://seu-bucket/messages/ --recursive --endpoint-url https://seu-account-id.r2.cloudflarestorage.com | grep $(date +%Y-%m-%d)
```

### Verificar Imagem

```bash
# Verificar se imagem existe
curl -I https://seu-bucket.r2.cloudflarestorage.com/messages/{uuid}/image.jpg

# Baixar imagem
curl -O https://seu-bucket.r2.cloudflarestorage.com/messages/{uuid}/image.jpg
```

### Limpar Imagens Antigas

```bash
# Listar imagens antigas (mais de 7 dias)
aws s3 ls s3://seu-bucket/messages/ --recursive --endpoint-url https://seu-account-id.r2.cloudflarestorage.com | awk '{if ($1 < "'$(date -d '7 days ago' +%Y-%m-%d)'") print $4}'

# Deletar imagens antigas (CUIDADO!)
# Primeiro, liste para confirmar
# Depois, delete com:
# aws s3 rm s3://seu-bucket/messages/{path} --endpoint-url https://seu-account-id.r2.cloudflarestorage.com
```

## 🧹 localStorage

### Ver Dados

```javascript
// No DevTools Console (F12)

// Ver dados da demo
const demoData = JSON.parse(localStorage.getItem('paperbloom-demo-data'));
console.log(demoData);

// Ver todos os dados do localStorage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

### Limpar Dados

```javascript
// Limpar apenas dados da demo
localStorage.removeItem('paperbloom-demo-data');

// Limpar todos os dados do Paper Bloom
Object.keys(localStorage)
  .filter(key => key.startsWith('paperbloom-'))
  .forEach(key => localStorage.removeItem(key));

// Limpar TUDO (CUIDADO!)
localStorage.clear();
```

### Editar Dados Manualmente

```javascript
// Carregar dados atuais
const demoData = JSON.parse(localStorage.getItem('paperbloom-demo-data'));

// Modificar
demoData.pageTitle = "Novo Título";
demoData.mainMessage = "Nova mensagem";

// Salvar
localStorage.setItem('paperbloom-demo-data', JSON.stringify(demoData));

// Recarregar página
location.reload();
```

## 🔍 Debug

### Logs do Servidor

```bash
# Ver logs em tempo real
npm run dev

# Ver apenas erros
npm run dev 2>&1 | grep -i error

# Salvar logs em arquivo
npm run dev > logs.txt 2>&1
```

### Logs do Navegador

```javascript
// No DevTools Console

// Ver todos os logs
console.log('Logs habilitados');

// Ver estado do wizard
const wizardState = JSON.parse(localStorage.getItem('paperbloom-wizard-draft'));
console.log('Wizard State:', wizardState);

// Ver uploads
console.log('Uploads:', wizardState?.uploads);

// Ver dados do formulário
console.log('Form Data:', wizardState?.data);
```

### Network Requests

```javascript
// No DevTools Network tab

// Filtrar apenas APIs
// Filter: /api/

// Ver request de upload
// Filter: upload-image

// Ver request de criação
// Filter: messages/create
```

## 🧪 Testes Rápidos

### Teste de Upload

```bash
# Testar upload de imagem via curl
curl -X POST http://localhost:3000/api/messages/upload-image \
  -F "image=@/path/to/image.jpg" \
  -H "Content-Type: multipart/form-data"
```

### Teste de Criação

```bash
# Testar criação de mensagem via curl
curl -X POST http://localhost:3000/api/messages/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Maria",
    "senderName": "João",
    "messageText": "Teste de mensagem",
    "imageUrl": "https://example.com/image.jpg",
    "contactName": "Demo User",
    "contactEmail": "demo@paperbloom.com",
    "contactPhone": "+55 11 99999-9999"
  }'
```

## 📊 Estatísticas

### Mensagens por Dia

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total
FROM messages 
WHERE slug LIKE 'demo-%'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Imagens Mais Usadas

```sql
SELECT 
  image_url,
  COUNT(*) as usage_count
FROM messages 
WHERE slug LIKE 'demo-%'
  AND image_url IS NOT NULL
GROUP BY image_url
ORDER BY usage_count DESC
LIMIT 10;
```

### Músicas Mais Usadas

```sql
SELECT 
  youtube_url,
  COUNT(*) as usage_count
FROM messages 
WHERE slug LIKE 'demo-%'
  AND youtube_url IS NOT NULL
GROUP BY youtube_url
ORDER BY usage_count DESC
LIMIT 10;
```

## 🔧 Manutenção

### Backup de Mensagens Demo

```sql
-- Exportar mensagens demo para CSV
COPY (
  SELECT * FROM messages 
  WHERE slug LIKE 'demo-%'
) TO '/tmp/demo_messages_backup.csv' CSV HEADER;
```

### Restaurar Mensagens Demo

```sql
-- Importar mensagens demo de CSV
COPY messages FROM '/tmp/demo_messages_backup.csv' CSV HEADER;
```

### Resetar Sequência de IDs

```sql
-- Se necessário resetar a sequência de IDs
-- (Normalmente não é necessário com UUID)
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));
```

## 🚨 Troubleshooting

### Erro de Conexão com DB

```bash
# Verificar se PostgreSQL está rodando
pg_isready -h localhost -p 5432

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"

# Ver variáveis de ambiente
echo $DATABASE_URL
```

### Erro de Conexão com R2

```bash
# Verificar credenciais
echo $R2_ACCOUNT_ID
echo $R2_ACCESS_KEY_ID
echo $R2_BUCKET_NAME

# Testar conexão
aws s3 ls s3://$R2_BUCKET_NAME --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
```

### Limpar Cache do Next.js

```bash
# Limpar cache e rebuild
rm -rf .next
npm run build
npm run dev
```

### Resetar Tudo

```bash
# Limpar tudo e começar do zero
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

## 📝 Scripts Úteis

### Script para Limpar Demos Antigas

Crie um arquivo `scripts/clean-old-demos.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanOldDemos() {
  const result = await pool.query(`
    DELETE FROM messages 
    WHERE slug LIKE 'demo-%' 
    AND created_at < NOW() - INTERVAL '7 days'
    RETURNING id
  `);
  
  console.log(`Deleted ${result.rowCount} old demo messages`);
  await pool.end();
}

cleanOldDemos().catch(console.error);
```

Execute:
```bash
node scripts/clean-old-demos.js
```

### Script para Estatísticas

Crie um arquivo `scripts/demo-stats.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getStats() {
  const total = await pool.query(`
    SELECT COUNT(*) as count 
    FROM messages 
    WHERE slug LIKE 'demo-%'
  `);
  
  const today = await pool.query(`
    SELECT COUNT(*) as count 
    FROM messages 
    WHERE slug LIKE 'demo-%' 
    AND DATE(created_at) = CURRENT_DATE
  `);
  
  console.log('Total demo messages:', total.rows[0].count);
  console.log('Created today:', today.rows[0].count);
  
  await pool.end();
}

getStats().catch(console.error);
```

Execute:
```bash
node scripts/demo-stats.js
```

## 🎯 Comandos Mais Usados

```bash
# Iniciar desenvolvimento
npm run dev

# Ver última mensagem demo
psql $DATABASE_URL -c "SELECT * FROM messages WHERE slug LIKE 'demo-%' ORDER BY created_at DESC LIMIT 1;"

# Limpar localStorage (no navegador)
localStorage.removeItem('paperbloom-demo-data')

# Limpar demos antigos
psql $DATABASE_URL -c "DELETE FROM messages WHERE slug LIKE 'demo-%' AND created_at < NOW() - INTERVAL '7 days';"

# Ver logs em tempo real
npm run dev | grep -i error
```

---

**Comandos prontos para uso!** 🚀
