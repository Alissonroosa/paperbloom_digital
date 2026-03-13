"use client";

import { useState, useEffect } from "react";

interface YouTubePlayerDebugProps {
    playerRef: React.RefObject<any>;
}

/**
 * Debug component for YouTube Player
 * Shows real-time player state and information
 */
export function YouTubePlayerDebug({ playerRef }: YouTubePlayerDebugProps) {
    const [playerState, setPlayerState] = useState<number>(-2);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [volume, setVolume] = useState<number>(0);
    const [videoData, setVideoData] = useState<any>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current) {
                try {
                    if (playerRef.current.getPlayerState) {
                        setPlayerState(playerRef.current.getPlayerState());
                    }
                    if (playerRef.current.getCurrentTime) {
                        setCurrentTime(playerRef.current.getCurrentTime());
                    }
                    if (playerRef.current.getDuration) {
                        setDuration(playerRef.current.getDuration());
                    }
                    if (playerRef.current.getVolume) {
                        setVolume(playerRef.current.getVolume());
                    }
                    if (playerRef.current.getVideoData) {
                        setVideoData(playerRef.current.getVideoData());
                    }
                } catch (err) {
                    console.warn('Error getting player info:', err);
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, [playerRef]);

    const stateNames: Record<number, string> = {
        '-2': 'Player não inicializado',
        '-1': 'Não iniciado',
        '0': 'Finalizado',
        '1': 'Tocando ▶️',
        '2': 'Pausado ⏸️',
        '3': 'Buffering ⏳',
        '5': 'Cued (pronto)'
    };

    const stateColors: Record<number, string> = {
        '-2': 'text-gray-500',
        '-1': 'text-gray-600',
        '0': 'text-orange-600',
        '1': 'text-green-600',
        '2': 'text-yellow-600',
        '3': 'text-blue-600',
        '5': 'text-purple-600'
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg font-mono text-sm space-y-3">
            <h3 className="text-lg font-bold mb-4 text-yellow-400">🐛 YouTube Player Debug</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-gray-400">Estado:</span>
                    <span className={`ml-2 font-bold ${stateColors[playerState]}`}>
                        {stateNames[playerState] || `Unknown (${playerState})`}
                    </span>
                </div>
                
                <div>
                    <span className="text-gray-400">Player Ref:</span>
                    <span className="ml-2">
                        {playerRef.current ? '✅ Existe' : '❌ Null'}
                    </span>
                </div>
                
                <div>
                    <span className="text-gray-400">Tempo:</span>
                    <span className="ml-2 text-cyan-400">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
                
                <div>
                    <span className="text-gray-400">Volume:</span>
                    <span className="ml-2 text-green-400">{Math.round(volume)}%</span>
                </div>
            </div>

            {videoData && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-gray-400 mb-2">Vídeo Info:</div>
                    <div className="text-xs space-y-1">
                        <div><span className="text-gray-500">ID:</span> <span className="text-blue-400">{videoData.video_id}</span></div>
                        <div><span className="text-gray-500">Título:</span> <span className="text-white">{videoData.title}</span></div>
                        <div><span className="text-gray-500">Autor:</span> <span className="text-white">{videoData.author}</span></div>
                    </div>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-gray-400 mb-2">Métodos Disponíveis:</div>
                <div className="text-xs space-y-1">
                    {playerRef.current && (
                        <>
                            <div>playVideo: {playerRef.current.playVideo ? '✅' : '❌'}</div>
                            <div>pauseVideo: {playerRef.current.pauseVideo ? '✅' : '❌'}</div>
                            <div>loadVideoById: {playerRef.current.loadVideoById ? '✅' : '❌'}</div>
                            <div>getPlayerState: {playerRef.current.getPlayerState ? '✅' : '❌'}</div>
                        </>
                    )}
                </div>
            </div>

            {playerState === 1 && (
                <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded text-green-300">
                    ✅ Vídeo está tocando normalmente!
                </div>
            )}

            {playerState === 2 && (
                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded text-yellow-300">
                    ⏸️ Vídeo está pausado. Clique em Play para continuar.
                </div>
            )}

            {playerState === 3 && (
                <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded text-blue-300">
                    ⏳ Vídeo está carregando (buffering)...
                </div>
            )}
        </div>
    );
}
