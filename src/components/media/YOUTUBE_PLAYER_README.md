# YouTube Player Component

Componente reutilizável para incorporar vídeos do YouTube com controle total via API.

## 🎯 Características

- ✅ Suporta múltiplos formatos de URL do YouTube
- ✅ Controle completo: play, pause, volume, seek
- ✅ Modo oculto (apenas áudio)
- ✅ Loop automático
- ✅ Start/End time configurável
- ✅ Callbacks para eventos
- ✅ TypeScript completo
- ✅ Sem dependências externas

## 📦 Instalação

Não requer instalação de pacotes. Usa a API oficial do YouTube IFrame.

## 🚀 Uso Básico

### Player Visível

```tsx
import { YouTubePlayer } from "@/components/media/YouTubePlayer";

export default function MyPage() {
  return (
    <YouTubePlayer 
      videoUrl="https://www.youtube.com/watch?v=nSDgHBxUbVQ"
      autoplay={false}
      loop={true}
      volume={80}
    />
  );
}
```

### Player Oculto (Apenas Áudio)

```tsx
<YouTubePlayer 
  videoUrl="https://www.youtube.com/watch?v=nSDgHBxUbVQ"
  autoplay={true}
  loop={true}
  volume={80}
  hidden={true}
/>
```

### Com Controles Personalizados

```tsx
"use client";

import { useRef, useState } from "react";
import { YouTubePlayer, useYouTubePlayer } from "@/components/media/YouTubePlayer";
import { Play, Pause, Volume2 } from "lucide-react";

export default function MyPage() {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { play, pause, setVolume } = useYouTubePlayer(playerRef);

  const handleReady = (player: any) => {
    playerRef.current = player;
  };

  const handleStateChange = (state: number) => {
    // 1 = playing, 2 = paused
    setIsPlaying(state === 1);
  };

  return (
    <div>
      <YouTubePlayer 
        videoUrl="https://www.youtube.com/watch?v=nSDgHBxUbVQ"
        hidden={true}
        onReady={handleReady}
        onStateChange={handleStateChange}
      />

      <button onClick={() => isPlaying ? pause() : play()}>
        {isPlaying ? <Pause /> : <Play />}
      </button>

      <input 
        type="range" 
        min="0" 
        max="100" 
        onChange={(e) => setVolume(Number(e.target.value))}
      />
    </div>
  );
}
```

## 📋 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `videoUrl` | `string` | **obrigatório** | URL do YouTube ou ID do vídeo |
| `autoplay` | `boolean` | `false` | Iniciar automaticamente |
| `loop` | `boolean` | `false` | Repetir vídeo |
| `startTime` | `number` | `0` | Tempo inicial em segundos |
| `endTime` | `number` | `undefined` | Tempo final em segundos |
| `volume` | `number` | `80` | Volume inicial (0-100) |
| `onReady` | `(player) => void` | `undefined` | Callback quando player está pronto |
| `onStateChange` | `(state) => void` | `undefined` | Callback quando estado muda |
| `className` | `string` | `""` | Classes CSS customizadas |
| `hidden` | `boolean` | `false` | Ocultar player (apenas áudio) |

## 🎮 Estados do Player

```typescript
-1 = Não iniciado
 0 = Finalizado
 1 = Tocando
 2 = Pausado
 3 = Buffering
 5 = Video cued
```

## 🔧 Funções de Controle

O hook `useYouTubePlayer` fornece:

```typescript
const {
  play,              // () => void
  pause,             // () => void
  stop,              // () => void
  setVolume,         // (volume: number) => void
  seekTo,            // (seconds: number) => void
  getPlayerState,    // () => number
  getCurrentTime,    // () => number
  getDuration        // () => number
} = useYouTubePlayer(playerRef);
```

## 🌐 Formatos de URL Suportados

```
https://www.youtube.com/watch?v=nSDgHBxUbVQ
https://youtu.be/nSDgHBxUbVQ
https://www.youtube.com/embed/nSDgHBxUbVQ
https://www.youtube.com/v/nSDgHBxUbVQ
nSDgHBxUbVQ (apenas o ID)
```

## 🛠️ Utilitários

### Extrair ID do Vídeo

```typescript
import { extractYouTubeVideoId } from "@/lib/youtube-utils";

const videoId = extractYouTubeVideoId("https://www.youtube.com/watch?v=nSDgHBxUbVQ");
// Retorna: "nSDgHBxUbVQ"
```

### Validar URL

```typescript
import { isValidYouTubeUrl } from "@/lib/youtube-utils";

const isValid = isValidYouTubeUrl("https://www.youtube.com/watch?v=nSDgHBxUbVQ");
// Retorna: true
```

### Obter Thumbnail

```typescript
import { getYouTubeThumbnail } from "@/lib/youtube-utils";

const thumbnail = getYouTubeThumbnail("nSDgHBxUbVQ", "hq");
// Retorna: "https://img.youtube.com/vi/nSDgHBxUbVQ/hqdefault.jpg"
```

### Extrair Tempo Inicial

```typescript
import { extractYouTubeStartTime } from "@/lib/youtube-utils";

const startTime = extractYouTubeStartTime("https://www.youtube.com/watch?v=nSDgHBxUbVQ&t=90");
// Retorna: 90 (segundos)
```

## 💡 Exemplo Completo: Experiência Cinematográfica

Ver: `src/app/(fullscreen)/demo/message/page.tsx`

## 🔒 Considerações de Segurança

- ✅ Usa API oficial do YouTube (legal e seguro)
- ✅ Não baixa ou armazena conteúdo
- ✅ Respeita direitos autorais
- ✅ Sem custos de armazenamento ou banda

## 📱 Compatibilidade

- ✅ Desktop (todos os navegadores modernos)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablets
- ⚠️ Requer JavaScript habilitado
- ⚠️ Requer conexão com internet

## 🐛 Troubleshooting

### Player não aparece

```typescript
// Verifique se a URL é válida
import { isValidYouTubeUrl } from "@/lib/youtube-utils";
console.log(isValidYouTubeUrl(yourUrl));
```

### Autoplay não funciona

Navegadores modernos bloqueiam autoplay com som. Soluções:

1. Iniciar com volume 0 e fazer fade in
2. Iniciar após interação do usuário
3. Usar `muted` no início

### Vídeo não encontrado

- Verifique se o vídeo está público
- Verifique se o vídeo não foi removido
- Teste o ID diretamente no YouTube

## 📚 Recursos

- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- [Player Parameters](https://developers.google.com/youtube/player_parameters)
