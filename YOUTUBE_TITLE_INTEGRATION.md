# Integração de Título do YouTube

## 📋 Resumo

Implementada funcionalidade para buscar automaticamente o título real dos vídeos do YouTube ao invés de usar um título mockado.

## ✅ Implementações

### 1. Utilitário YouTube (`src/lib/youtube-utils.ts`)

Criado arquivo com funções para:
- **`extractYouTubeVideoId(url)`**: Extrai o ID do vídeo de várias formatações de URL do YouTube
- **`fetchYouTubeVideoTitle(url)`**: Busca o título do vídeo através da API route
- **`getYouTubeDisplayTitle(url, fallback)`**: Retorna o título ou um fallback

### 2. API Route (`src/app/api/youtube/title/route.ts`)

Criada rota API para buscar informações do YouTube:
- **Endpoint**: `GET /api/youtube/title?url={youtube_url}`
- **Resposta**: `{ title, author, thumbnail }`
- **Vantagens**:
  - Evita problemas de CORS
  - Não requer API key do YouTube
  - Usa YouTube oEmbed API (gratuita)

### 3. Atualização do CinematicPreview

**Arquivo**: `src/components/editor/CinematicPreview.tsx`

Mudanças:
- Adicionado estado `youtubeTitle` para armazenar o título
- Adicionado `useEffect` para buscar título quando `data.youtubeLink` muda
- Substituído texto fixo "Música Especial" pelo título dinâmico
- Adicionado `truncate` para títulos longos

### 4. Atualização da Página Demo

**Arquivo**: `src/app/(fullscreen)/demo/message/page.tsx`

Mudanças:
- Adicionado estado `youtubeTitle` (fallback: "Ed Sheeran - Perfect")
- Adicionado `useEffect` para buscar título do vídeo demo
- Substituído `youtubeSongName` pelo título dinâmico
- Adicionado `truncate` para títulos longos

## 🎯 Funcionalidades

### Busca Automática
Quando um link do YouTube é fornecido, o sistema:
1. Extrai o ID do vídeo
2. Faz requisição para `/api/youtube/title`
3. API busca informações do YouTube oEmbed
4. Retorna título, autor e thumbnail
5. Atualiza o estado com o título real

### Fallback Inteligente
- Se a busca falhar, mantém o título padrão "Música Especial"
- Na página demo, usa "Ed Sheeran - Perfect" como fallback

### Formatação Responsiva
- Títulos longos são truncados com `...`
- Status "Tocando/Pausado" sempre visível (flex-shrink-0)

## 🧪 Teste

Execute o script de teste:
```bash
node testar-youtube-title.js
```

Exemplo de saída:
```
🎵 Testando busca de título do YouTube...
URL: https://www.youtube.com/watch?v=nSDgHBxUbVQ
Video ID: nSDgHBxUbVQ

✅ Sucesso!
Título: Ed Sheeran - Photograph (Official Music Video)
Autor: Ed Sheeran
Thumbnail: https://i.ytimg.com/vi/nSDgHBxUbVQ/hqdefault.jpg
```

## 📝 Exemplos de URLs Suportadas

```javascript
// Formato padrão
"https://www.youtube.com/watch?v=nSDgHBxUbVQ"

// Formato curto
"https://youtu.be/nSDgHBxUbVQ"

// Formato embed
"https://www.youtube.com/embed/nSDgHBxUbVQ"

// ID direto
"nSDgHBxUbVQ"
```

## 🔄 Fluxo de Dados

```
Usuário cola link do YouTube
         ↓
extractYouTubeVideoId() extrai ID
         ↓
fetchYouTubeVideoTitle() chama API
         ↓
/api/youtube/title busca no YouTube oEmbed
         ↓
Retorna { title, author, thumbnail }
         ↓
Estado atualizado com título real
         ↓
UI mostra título do vídeo
```

## 🎨 Melhorias Visuais

### Antes
```
Música Especial | Tocando...
```

### Depois
```
Ed Sheeran - Photograph (Official Music Video) | Tocando...
```

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar cache de títulos no localStorage
- [ ] Mostrar thumbnail do vídeo
- [ ] Exibir nome do artista separadamente
- [ ] Adicionar loading state durante busca
- [ ] Implementar retry em caso de falha

## 📦 Arquivos Criados/Modificados

### Criados
- `src/lib/youtube-utils.ts`
- `src/app/api/youtube/title/route.ts`
- `testar-youtube-title.js`
- `YOUTUBE_TITLE_INTEGRATION.md`

### Modificados
- `src/components/editor/CinematicPreview.tsx`
- `src/app/(fullscreen)/demo/message/page.tsx`

## ✨ Benefícios

1. **Experiência Melhorada**: Usuários veem o nome real da música
2. **Sem API Key**: Usa YouTube oEmbed (gratuito e sem limites)
3. **Sem CORS**: API route resolve problemas de CORS
4. **Automático**: Busca acontece automaticamente ao colar link
5. **Fallback Seguro**: Sempre mostra algo, mesmo se falhar
