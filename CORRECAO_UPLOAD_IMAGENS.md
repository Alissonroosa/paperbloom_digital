# Correção: Upload de Imagens nas Cartas

## 🐛 Problema Identificado

As fotos não estavam sendo salvas nas cartas. O usuário fazia upload da imagem, mas ela não aparecia na carta.

## 🔍 Causa Raiz

O componente `PhotoUploadModal` estava fazendo POST para a rota **ERRADA**:
- ❌ Rota usada: `/api/messages/upload-image` (rota do produto "Mensagem")
- ✅ Rota correta: `/api/upload/card-image` (rota do produto "12 Cartas")

## 🔧 Correção Aplicada

### Arquivo: `src/components/card-editor/modals/PhotoUploadModal.tsx`

**ANTES**:
```typescript
const response = await fetch('/api/messages/upload-image', {
  method: 'POST',
  body: formData,
});
```

**DEPOIS**:
```typescript
const response = await fetch('/api/upload/card-image', {
  method: 'POST',
  body: formData,
});
```

## ✅ Fluxo Corrigido

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO                                                  │
│    - Clica em "Adicionar Foto" na carta                    │
│    - Seleciona ou arrasta imagem                            │
│    - Clica em "Salvar"                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PHOTO UPLOAD MODAL                                       │
│    - Valida tipo (JPEG, PNG, WebP)                         │
│    - Valida tamanho (máx 5MB)                               │
│    - Cria FormData com a imagem                             │
│    - ✅ POST /api/upload/card-image                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. API UPLOAD (/api/upload/card-image/route.ts)            │
│    - Recebe FormData                                        │
│    - Valida tipo e tamanho novamente                        │
│    - Converte File para Buffer                              │
│    - Chama ImageService.upload()                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. IMAGE SERVICE (ImageService.ts)                         │
│    - Redimensiona imagem se necessário (máx 1920x1920)     │
│    - Gera nome único: images/uuid.jpg                       │
│    - Faz upload para Cloudflare R2                         │
│    - Retorna URL pública                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. MODAL RECEBE URL                                         │
│    - Chama onSave(cardId, imageUrl)                        │
│    - Context chama updateCard()                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CARD SERVICE (CardService.ts)                           │
│    - UPDATE cards SET image_url = $3                        │
│    - Salva URL no banco de dados                            │
│    - ✅ Imagem salva com sucesso!                          │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Como Testar

### 1. Abrir o editor
```
http://localhost:3000/editor/12-cartas
```

### 2. Preencher Step 1
- De: Seu Nome
- Para: Nome do Destinatário
- Clicar em "Próximo"

### 3. Adicionar foto em uma carta
1. Clicar no botão "Adicionar Foto" em qualquer carta
2. Selecionar uma imagem (JPEG, PNG ou WebP, máx 5MB)
3. Verificar prévia da imagem
4. Clicar em "Salvar"

### 4. Verificar console do navegador
Deve mostrar:
```javascript
[Context] updateCard called with: {
  cardId: "uuid-aqui",
  data: {
    imageUrl: "https://imagem.paperbloom.com.br/images/uuid.jpg"
  }
}
```

### 5. Verificar banco de dados
```sql
SELECT id, title, image_url 
FROM cards 
WHERE collection_id = 'uuid-da-colecao'
ORDER BY "order";
```

Deve mostrar a URL da imagem no campo `image_url`.

### 6. Verificar na página de visualização
Após completar o fluxo e fazer pagamento, abrir a página de visualização:
```
http://localhost:3000/c/nome-destinatario/uuid-colecao
```

A imagem deve aparecer na carta! 🖼️

## 📋 Validações Implementadas

### No Modal (PhotoUploadModal.tsx)
- ✅ Tipo de arquivo: JPEG, PNG, WebP
- ✅ Tamanho máximo: 5MB
- ✅ Prévia da imagem antes de salvar
- ✅ Drag and drop
- ✅ Indicador de progresso

### Na API (/api/upload/card-image/route.ts)
- ✅ Validação de tipo novamente
- ✅ Validação de tamanho novamente
- ✅ Conversão de File para Buffer
- ✅ Tratamento de erros

### No ImageService (ImageService.ts)
- ✅ Redimensionamento automático (máx 1920x1920)
- ✅ Upload para Cloudflare R2
- ✅ Geração de URL pública
- ✅ Cache de 1 ano (performance)

### No CardService (CardService.ts)
- ✅ Atualização do campo `image_url`
- ✅ Validação de dados
- ✅ Tratamento de erros

## 🎯 Formatos Suportados

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)

## 📏 Limites

- **Tamanho máximo**: 5MB
- **Dimensões máximas**: 1920x1920 pixels (redimensionado automaticamente)
- **Armazenamento**: Cloudflare R2
- **URL pública**: `https://imagem.paperbloom.com.br/images/uuid.ext`

## 🔒 Segurança

- ✅ Validação de tipo de arquivo (MIME type)
- ✅ Validação de tamanho
- ✅ Nomes de arquivo únicos (UUID)
- ✅ Armazenamento seguro no R2
- ✅ URLs públicas com cache

## 📊 Arquivos Modificados

1. ✅ `src/components/card-editor/modals/PhotoUploadModal.tsx`
   - Corrigida rota de upload de `/api/messages/upload-image` para `/api/upload/card-image`

## 📝 Arquivos Relacionados (Não Modificados)

- `src/app/api/upload/card-image/route.ts` - API de upload (já estava correta)
- `src/services/ImageService.ts` - Serviço de imagens (já estava correto)
- `src/services/CardService.ts` - Serviço de cartas (já estava correto)

## ✅ Status

**PROBLEMA RESOLVIDO** ✅

As imagens agora são:
- ✅ Enviadas para a rota correta
- ✅ Processadas e armazenadas no R2
- ✅ Salvas no banco de dados
- ✅ Exibidas na página de visualização

## 🎉 Resultado

Agora você pode adicionar fotos especiais em cada uma das 12 cartas! 🖼️📸

As fotos serão exibidas junto com as mensagens na página de visualização, tornando a experiência ainda mais especial e personalizada.
