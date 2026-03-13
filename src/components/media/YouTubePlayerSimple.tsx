"use client";

import { useEffect, useRef, useState } from "react";
import { extractYouTubeVideoId } from "@/lib/youtube-utils";

interface YouTubePlayerSimpleProps {
    videoUrl: string;
    startTime?: number;
    endTime?: number;
    volume?: number;
    onReady?: (player: any) => void;
    onStateChange?: (state: number) => void;
    className?: string;
}

/**
 * Simplified YouTube Player Component
 * Uses a more direct approach to avoid React Strict Mode issues
 */
export function YouTubePlayerSimple({
    videoUrl,
    startTime = 0,
    endTime,
    volume = 80,
    onReady,
    onStateChange,
    className = ""
}: YouTubePlayerSimpleProps) {
    const [status, setStatus] = useState<string>('Carregando...');
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const initAttemptedRef = useRef(false);

    const videoId = extractYouTubeVideoId(videoUrl);

    useEffect(() => {
        if (!videoId || !containerRef.current) return;
        
        // Skip if player already exists
        if (playerRef.current) {
            console.log('🔄 Player already exists, skipping initialization');
            return;
        }

        if (initAttemptedRef.current) {
            console.log('⏸️ Init already attempted, skipping');
            return;
        }

        initAttemptedRef.current = true;
        console.log('🚀 Starting YouTube Player initialization...');
        setStatus('Carregando YouTube API...');

        // Function to initialize player
        const initPlayer = () => {
            if (!window.YT || !window.YT.Player) {
                console.log('⏳ YouTube API not ready yet...');
                return false;
            }

            // Double check player doesn't exist
            if (playerRef.current) {
                console.log('⏸️ Player already created, aborting');
                return true;
            }

            console.log('✅ YouTube API ready, creating player...');
            setStatus('Criando player...');

            try {
                const playerId = `yt-player-${Date.now()}`;
                const container = containerRef.current;
                if (!container) return false;

                // Clear container first
                container.innerHTML = '';

                // Create a div for the player
                const playerDiv = document.createElement('div');
                playerDiv.id = playerId;
                playerDiv.style.width = '100%';
                playerDiv.style.height = '100%';
                container.appendChild(playerDiv);

                const playerVars: any = {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    enablejsapi: 1,
                    origin: window.location.origin,
                };

                if (startTime > 0) playerVars.start = startTime;
                if (endTime) playerVars.end = endTime;

                console.log('🎬 Creating YT.Player instance...');
                playerRef.current = new window.YT.Player(playerId, {
                    videoId: videoId,
                    playerVars,
                    events: {
                        onReady: (event: any) => {
                            console.log('✅ Player ready!');
                            setStatus('Pronto!');
                            event.target.setVolume(volume);
                            event.target.unMute();
                            if (onReady) onReady(event.target);
                        },
                        onStateChange: (event: any) => {
                            console.log('🔄 State:', event.data);
                            if (onStateChange) onStateChange(event.data);
                        },
                        onError: (event: any) => {
                            console.error('❌ Player error:', event.data);
                            setStatus(`Erro: ${event.data}`);
                        }
                    }
                });

                console.log('✅ YT.Player instance created');
                return true;
            } catch (err) {
                console.error('❌ Failed to create player:', err);
                setStatus('Erro ao criar player');
                initAttemptedRef.current = false; // Allow retry
                return false;
            }
        };

        // Load YouTube API if not loaded
        if (!window.YT) {
            console.log('📥 Loading YouTube API...');
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            
            const originalCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                console.log('✅ YouTube API loaded!');
                if (originalCallback) originalCallback();
                setTimeout(() => initPlayer(), 100);
            };

            document.head.appendChild(tag);
        } else {
            // API already loaded
            setTimeout(() => initPlayer(), 100);
        }

        // Cleanup only on real unmount
        return () => {
            console.log('🧹 Component unmounting, cleaning up...');
            // Don't destroy immediately - let it persist through Strict Mode remounts
        };
    }, [videoId, startTime, endTime, volume, onReady, onStateChange]);

    // Separate effect for real cleanup on unmount
    useEffect(() => {
        return () => {
            // This runs on real unmount
            setTimeout(() => {
                if (playerRef.current?.destroy) {
                    try {
                        console.log('🗑️ Destroying player on unmount');
                        playerRef.current.destroy();
                        playerRef.current = null;
                    } catch (err) {
                        console.warn('Error destroying player:', err);
                    }
                }
            }, 100);
        };
    }, []);

    if (!videoId) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                URL inválida
            </div>
        );
    }

    return (
        <div className={`w-full h-full relative ${className}`}>
            {status !== 'Pronto!' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                        <div className="text-white text-sm">{status}</div>
                    </div>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full"></div>
        </div>
    );
}
