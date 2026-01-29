"use client";

import { useRef, useState } from "react";
import { YouTubePlayer } from "@/components/media/YouTubePlayer";
import { YouTubePlayerSimple } from "@/components/media/YouTubePlayerSimple";
import { YouTubePlayerDebug } from "@/components/media/YouTubePlayerDebug";
import { Button } from "@/components/ui/Button";
import { Play, Pause, Volume2, VolumeX, SkipBack } from "lucide-react";
import { extractYouTubeVideoId, isValidYouTubeUrl } from "@/lib/youtube-utils";

export default function YouTubePlayerTestPage() {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=nSDgHBxUbVQ");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [useSimplePlayer, setUseSimplePlayer] = useState(false);
  
  // Vídeos de teste que funcionam
  const testVideos = [
    { name: "Perfect - Ed Sheeran", url: "https://www.youtube.com/watch?v=nSDgHBxUbVQ" },
    { name: "Shape of You - Ed Sheeran", url: "https://www.youtube.com/watch?v=JGwWNGJdvx8" },
    { name: "Thinking Out Loud - Ed Sheeran", url: "https://www.youtube.com/watch?v=lp-EO5I60KA" },
  ];
  const [playerReady, setPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReady = (player: any) => {
    console.log("✅ Player Ready!", player);
    playerRef.current = player;
    setPlayerReady(true);
    setError(null);
  };

  const handleStateChange = (state: number) => {
    console.log("🔄 State Change:", state);
    setIsPlaying(state === 1);
  };

  const handleError = (err: any) => {
    console.error("❌ Player Error:", err);
    setError(typeof err === 'string' ? err : JSON.stringify(err));
    setPlayerReady(false);
  };

  const handlePlay = () => {
    console.log("▶️ Play button clicked");
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  };

  const handlePause = () => {
    console.log("⏸️ Pause button clicked");
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  };

  const handleSeekTo = (seconds: number) => {
    console.log("⏩ Seek to:", seconds);
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seconds, true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleLoadVideo = () => {
    console.log("🔄 Loading video:", videoUrl, "Start:", startTime, "End:", endTime || "none");
    if (playerRef.current && playerRef.current.loadVideoById) {
      const videoId = extractYouTubeVideoId(videoUrl);
      const options: any = {
        videoId: videoId,
        startSeconds: startTime
      };
      if (endTime > 0) {
        options.endSeconds = endTime;
      }
      playerRef.current.loadVideoById(options);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">YouTube Player Test - Complete</h1>
          <p className="text-muted-foreground">
            Teste completo do componente YouTube Player com controles de start/end time
          </p>
          
          {/* Player Type Toggle */}
          <div className="mt-4 flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-sm font-medium">Tipo de Player:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useSimplePlayer}
                onChange={() => setUseSimplePlayer(false)}
                className="w-4 h-4"
              />
              <span className="text-sm">Completo (com todas features)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useSimplePlayer}
                onChange={() => setUseSimplePlayer(true)}
                className="w-4 h-4"
              />
              <span className="text-sm">Simples (sem CORS issues)</span>
            </label>
          </div>
        </div>

        {/* Quick Test Videos */}
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">🎵 Vídeos de Teste Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {testVideos.map((video) => (
              <Button
                key={video.url}
                variant="outline"
                onClick={() => {
                  setVideoUrl(video.url);
                  setStartTime(0);
                  setEndTime(0);
                }}
                className="text-sm"
              >
                {video.name}
              </Button>
            ))}
          </div>
        </div>

        {/* URL and Time Configuration */}
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">⚙️ Configuração do Vídeo</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">YouTube URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Cole a URL do YouTube aqui"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Video ID: {extractYouTubeVideoId(videoUrl) || "inválido"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Time (segundos)
              </label>
              <input
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border rounded-md"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: 30 = começar aos 30 segundos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                End Time (segundos) - Opcional
              </label>
              <input
                type="number"
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border rounded-md"
                placeholder="0 = sem limite"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: 90 = parar aos 90 segundos (deixe 0 para sem limite)
              </p>
            </div>
          </div>

          <Button onClick={handleLoadVideo} className="w-full" disabled={!playerReady}>
            {playerReady ? "🔄 Carregar Vídeo com Configurações" : "⏳ Aguarde o player carregar..."}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">❌ Erro</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* YouTube Player */}
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                📺 Player {useSimplePlayer ? '(Simples)' : '(Completo)'}
              </h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {useSimplePlayer ? (
                  <YouTubePlayerSimple
                    videoUrl={videoUrl}
                    startTime={startTime}
                    endTime={endTime > 0 ? endTime : undefined}
                    volume={volume}
                    onReady={handleReady}
                    onStateChange={handleStateChange}
                    className="w-full h-full"
                  />
                ) : (
                  <YouTubePlayer
                    videoUrl={videoUrl}
                    hidden={false}
                    loop={false}
                    startTime={startTime}
                    endTime={endTime > 0 ? endTime : undefined}
                    volume={volume}
                    onReady={handleReady}
                    onStateChange={handleStateChange}
                    onError={handleError}
                    className="w-full h-full"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {useSimplePlayer 
                  ? '✨ Player simplificado - evita problemas de CORS e React Strict Mode'
                  : '🔧 Player completo - com todas as features mas pode ter problemas de CORS'
                }
              </p>
            </div>

            {/* Controls */}
            <div className="bg-card p-6 rounded-lg border space-y-6">
              <h2 className="text-xl font-semibold">🎮 Controles</h2>

              {/* Play/Pause */}
              <div className="flex gap-4">
                <Button onClick={handlePlay} disabled={!playerReady || isPlaying}>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
                <Button onClick={handlePause} disabled={!playerReady || !isPlaying}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={() => handleSeekTo(startTime)} disabled={!playerReady}>
                  <SkipBack className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </div>

              {/* Quick Seek */}
              <div>
                <label className="block text-sm font-medium mb-2">Pular para:</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSeekTo(0)} disabled={!playerReady}>
                    0s
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSeekTo(30)} disabled={!playerReady}>
                    30s
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSeekTo(60)} disabled={!playerReady}>
                    1min
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSeekTo(120)} disabled={!playerReady}>
                    2min
                  </Button>
                </div>
              </div>

              {/* Volume Control */}
              <div>
                <div className="flex items-center gap-4 mb-2">
                  {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  <span className="text-sm font-medium">Volume: {volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Status */}
              <div className="p-4 bg-muted rounded-md space-y-1">
                <p className="text-sm">
                  <strong>Player:</strong> {playerReady ? "✅ Pronto" : "⏳ Carregando..."}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong> {isPlaying ? "🎵 Tocando" : "⏸️ Pausado"}
                </p>
                <p className="text-sm">
                  <strong>Video ID:</strong> {extractYouTubeVideoId(videoUrl) || "N/A"}
                </p>
                <p className="text-sm">
                  <strong>Start Time:</strong> {startTime}s
                </p>
                <p className="text-sm">
                  <strong>End Time:</strong> {endTime > 0 ? `${endTime}s` : "Sem limite"}
                </p>
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          <div className="space-y-4">
            <YouTubePlayerDebug playerRef={playerRef} />

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">ℹ️ Como usar</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Selecione um vídeo de teste ou cole uma URL</li>
                <li>• Configure start/end time se desejar</li>
                <li>• Clique em "Carregar Vídeo" para aplicar as configurações</li>
                <li>• Use os botões de controle para tocar/pausar</li>
                <li>• Monitore o painel de debug em tempo real</li>
              </ul>
            </div>

            {/* Debug Console */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">🐛 Console Debug</h3>
              <div className="text-xs font-mono space-y-1">
                <p>Abra o Console do navegador (F12) para ver logs detalhados</p>
                <p className="text-muted-foreground">• ✅ = Player Ready</p>
                <p className="text-muted-foreground">• 🔄 = State Change</p>
                <p className="text-muted-foreground">• ▶️ = Play</p>
                <p className="text-muted-foreground">• ⏸️ = Pause</p>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">⚠️ Troubleshooting</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Se o vídeo não carregar, verifique se a URL é válida</li>
                <li>• Se o vídeo parar logo após começar, veja o painel de debug</li>
                <li>• Alguns vídeos não permitem embedding</li>
                <li>• Sempre clique em Play (não use autoplay)</li>
                <li>• Verifique o console (F12) para erros</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
