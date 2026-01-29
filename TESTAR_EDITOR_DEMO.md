# 🧪 Como Testar o Editor Demo

## ⚡ Teste Rápido (5 minutos)

### 1. Iniciar o Servidor
```bash
npm run dev
```

### 2. Acessar o Editor
Abra no navegador:
```
http://localhost:3000/editor/demo/message
```

### 3. Preencher o Wizard

#### Passo 1: Informações Básicas
- **Destinatário**: Maria
- **Remetente**: João
- **Mensagem**: "Você é especial para mim..."
- Clique em **"Próximo"**

#### Passo 2: Imagem Principal
- Clique em **"Escolher arquivo"**
- Selecione uma imagem do seu computador
- Aguarde o preview aparecer
- Clique em **"Próximo"**

#### Passo 3: Galeria (Opcional)
- Adicione até 3 imagens
- Ou pule clicando em **"Próximo"**

#### Passo 4: YouTube
- Cole uma URL: `https://www.youtube.com/watch?v=nSDgHBxUbVQ`
- Clique em **"Próximo"**

#### Passo 5: Personalização
- **Título**: "Feliz Aniversário!"
- **Data**: Escolha uma data
- **Assinatura**: "Com amor, João"
- Clique em **"Próximo"**

#### Passo 6: Contato
- **Nome**: Demo User
- **Email**: demo@paperbloom.com
- **Telefone**: (11) 99999-9999
- Clique em **"Próximo"**

#### Passo 7: Preview
- Revise tudo
- Clique em **"Criar Mensagem Demo"**

### 4. Aguardar Processamento
- Upload das imagens (pode levar alguns segundos)
- Salvamento no banco de dados
- Redirecionamento automático

### 5. Visualizar Demo
- Você será redirecionado para `/demo/message`
- Veja sua mensagem com os dados reais!

## 🔬 Teste Completo (15 minutos)

### Teste 1: Validação de Campos

#### Objetivo
Verificar que campos obrigatórios são validados

#### Passos
1. Acesse o editor
2. Tente clicar em "Próximo" sem preencher nada
3. **Esperado**: Mensagens de erro aparecem
4. Preencha os campos
5. **Esperado**: Pode avançar

#### Verificação
- [ ] Mensagens de erro aparecem
- [ ] Campos obrigatórios são destacados
- [ ] Não pode avançar sem preencher

### Teste 2: Upload de Imagem Principal

#### Objetivo
Verificar upload para R2

#### Passos
1. Vá para o Passo 2
2. Selecione uma imagem (JPG, PNG ou WebP)
3. **Esperado**: Preview aparece imediatamente
4. Avance até o final e crie a mensagem
5. Verifique a demo page

#### Verificação
- [ ] Preview aparece após seleção
- [ ] Imagem é enviada ao R2
- [ ] URL do R2 é salva no DB
- [ ] Imagem aparece na demo page

#### Como Verificar no DB
```sql
SELECT image_url FROM messages WHERE slug LIKE 'demo-%' ORDER BY created_at DESC LIMIT 1;
```

### Teste 3: Galeria de Imagens

#### Objetivo
Verificar upload múltiplo

#### Passos
1. Vá para o Passo 3
2. Adicione 3 imagens diferentes
3. **Esperado**: Preview de cada uma aparece
4. Crie a mensagem
5. Verifique a demo page

#### Verificação
- [ ] Pode adicionar até 3 imagens
- [ ] Preview de cada imagem aparece
- [ ] Todas são enviadas ao R2
- [ ] Array de URLs é salvo no DB
- [ ] Galeria rotativa funciona na demo

#### Como Verificar no DB
```sql
SELECT gallery_images FROM messages WHERE slug LIKE 'demo-%' ORDER BY created_at DESC LIMIT 1;
```

### Teste 4: Integração YouTube

#### Objetivo
Verificar extração de ID e player

#### Passos
1. Vá para o Passo 4
2. Cole URL completa: `https://www.youtube.com/watch?v=nSDgHBxUbVQ`
3. **Esperado**: Preview do player aparece
4. Crie a mensagem
5. Na demo page, clique no botão de música

#### Verificação
- [ ] URL é validada
- [ ] ID é extraído corretamente
- [ ] Preview do player aparece
- [ ] URL é salva no DB
- [ ] Música toca na demo page

#### URLs para Testar
- Ed Sheeran - Perfect: `https://www.youtube.com/watch?v=nSDgHBxUbVQ`
- John Legend - All of Me: `https://www.youtube.com/watch?v=450p7goxZqg`
- Bruno Mars - Just The Way You Are: `https://www.youtube.com/watch?v=LjhCEhWiKXk`

### Teste 5: Personalização

#### Objetivo
Verificar campos opcionais

#### Passos
1. Vá para o Passo 5
2. Preencha todos os campos:
   - Título: "Feliz Aniversário!"
   - Data: 23/11/2024
   - Mensagem de encerramento: "Você é especial"
   - Assinatura: "Com amor, João"
3. Crie a mensagem
4. Verifique na demo page

#### Verificação
- [ ] Título aparece na demo
- [ ] Data é formatada corretamente
- [ ] Mensagem de encerramento aparece
- [ ] Assinatura aparece

### Teste 6: Fluxo Completo

#### Objetivo
Testar todo o processo end-to-end

#### Passos
1. Preencha todos os 7 passos
2. Use imagens reais
3. Adicione música do YouTube
4. Preencha todos os campos opcionais
5. Crie a mensagem
6. Verifique a demo page

#### Verificação
- [ ] Todas as imagens aparecem
- [ ] Música toca
- [ ] Todos os textos aparecem
- [ ] Animações funcionam
- [ ] Responsivo em mobile

#### Checklist Completo
- [ ] Intro text 1 aparece
- [ ] Intro text 2 aparece
- [ ] Imagem principal aparece
- [ ] Título aparece
- [ ] Nome do destinatário aparece
- [ ] Data aparece formatada
- [ ] Mensagem principal aparece
- [ ] Assinatura aparece
- [ ] Galeria rotativa funciona
- [ ] Música toca ao clicar
- [ ] Botão de play/pause funciona
- [ ] Animações são suaves
- [ ] Responsivo em mobile

## 🔍 Verificações no Banco de Dados

### Ver Última Mensagem Demo
```sql
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

### Ver Todas as Mensagens Demo
```sql
SELECT 
  id,
  recipient_name,
  title,
  created_at
FROM messages 
WHERE slug LIKE 'demo-%' 
ORDER BY created_at DESC;
```

### Contar Mensagens Demo
```sql
SELECT COUNT(*) as total_demos 
FROM messages 
WHERE slug LIKE 'demo-%';
```

### Limpar Mensagens Demo Antigas
```sql
-- CUIDADO: Isso apaga dados!
DELETE FROM messages 
WHERE slug LIKE 'demo-%' 
AND created_at < NOW() - INTERVAL '7 days';
```

## 🐛 Troubleshooting

### Erro: "Failed to upload image"

**Possíveis Causas:**
- R2 não configurado
- Credenciais inválidas
- Bucket não existe

**Solução:**
1. Verifique `.env.local`:
   ```
   R2_ACCOUNT_ID=seu-account-id
   R2_ACCESS_KEY_ID=sua-access-key
   R2_SECRET_ACCESS_KEY=sua-secret-key
   R2_BUCKET_NAME=seu-bucket
   ```
2. Teste a conexão com R2
3. Verifique permissões do bucket

### Erro: "Failed to create message"

**Possíveis Causas:**
- Banco de dados não conectado
- Campos obrigatórios faltando
- Validação falhou

**Solução:**
1. Verifique `.env.local`:
   ```
   DATABASE_URL=postgresql://...
   ```
2. Teste conexão com o banco
3. Verifique logs do console
4. Veja mensagens de validação

### Erro: "YouTube video not found"

**Possíveis Causas:**
- URL inválida
- Vídeo privado/removido
- ID extraído incorretamente

**Solução:**
1. Use URL completa do YouTube
2. Teste o vídeo diretamente no YouTube
3. Verifique se o vídeo é público
4. Use um dos exemplos fornecidos

### Imagens não aparecem na demo

**Possíveis Causas:**
- Upload falhou
- URL do R2 incorreta
- Bucket não público

**Solução:**
1. Verifique logs do upload
2. Teste URL da imagem diretamente
3. Verifique permissões do bucket R2
4. Confirme que o bucket é público

### Música não toca

**Possíveis Causas:**
- ID do YouTube incorreto
- Vídeo com restrições
- API do YouTube bloqueada

**Solução:**
1. Verifique o ID extraído
2. Teste o vídeo no YouTube
3. Use vídeos sem restrições
4. Verifique console do navegador

## 📊 Métricas de Sucesso

### Teste Passou Se:
- ✅ Todas as imagens foram enviadas ao R2
- ✅ Mensagem foi salva no banco de dados
- ✅ Redirecionamento funcionou
- ✅ Demo page carregou com dados corretos
- ✅ Música do YouTube toca
- ✅ Galeria rotativa funciona
- ✅ Animações são suaves
- ✅ Responsivo em mobile

### Tempo Esperado:
- Upload de imagens: 2-5 segundos
- Salvamento no DB: < 1 segundo
- Redirecionamento: Imediato
- Carregamento da demo: 1-2 segundos

## 🎯 Próximos Testes

Após validar o editor demo, teste:

1. **Editor Real** (`/editor/mensagem`)
   - Mesmo fluxo, mas com pagamento
   - Redirecionamento para Stripe
   - Geração de slug único

2. **Página de Entrega** (`/delivery/[messageId]`)
   - Acesso com slug
   - Visualização da mensagem
   - Tracking de views

3. **Fluxo de Pagamento**
   - Checkout no Stripe
   - Webhook de confirmação
   - Envio de email

---

**Boa sorte nos testes!** 🚀
