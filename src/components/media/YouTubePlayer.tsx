"use client";

import { useEffect, useRef, useState } from "react";
import { extractYouTubeVideoId } from "@/lib/youtube-utils";

// YouTube Player Types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

interface YouTubePlayerProps {
    videoUrl: string;
    autoplay?: boolean;
    loop?: boolean;
    startTime?: number;
    endTime?: number;
    volume?: number; // 0-100
    onReady?: (player: any) => void;
    onStateChange?: (state: number) => void;
    onError?: (error: any) => void;
    className?: string;
    hidden?: boolean;
}

/**
 * YouTube Player Component
 * 
 * A reusable component for embedding YouTube videos with full control
 * 
 * @example
 * ```tsx
 * <YouTubePlayer 
 *   videoUrl="https://www.youtube.com/watch?v=nSDgHBxUbVQ"
 *   autoplay={false}
 *   loop={true}
 *   volume={80}
 *   hidden={true}
 * />
 * ```
 */
export function YouTubePlayer({
    videoUrl,
    autoplay = false,
    loop = false,
    startTime = 0,
    endTime,
    volume = 80,
    onReady,
    onStateChange,
    onError,
    className = "",
    hidden = false
}: YouTubePlayerProps) {
    const [youtubeReady, setYoutubeReady] = useState(false);
    const [playerInitialized, setPlayerInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerIdRef = useRef(`youtube-player-${Math.random().toString(36).substring(2, 11)}`);
    const isCreatingPlayerRef = useRef(false); // Flag to prevent multiple player creation

    const videoId = extractYouTubeVideoId(videoUrl);

    console.log('🔍 YouTubePlayer render:', { youtubeReady, playerInitialized, videoId, isCreating: isCreatingPlayerRef.current });

    // Load YouTube IFrame API
    useEffect(() => {
        console.log('📡 Loading YouTube API...');
        
        // Check if API is already loaded
        if (window.YT && window.YT.Player) {
            console.log('✅ YouTube API already loaded');
            setYoutubeReady(true);
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existingScript) {
            console.log('⏳ YouTube API script found, waiting for load...');
            // Wait for it to load
            const checkYT = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    console.log('✅ YouTube API loaded from existing script');
                    setYoutubeReady(true);
                    clearInterval(checkYT);
                }
            }, 100);
            return () => clearInterval(checkYT);
        }

        console.log('📥 Downloading YouTube API script...');
        // Load the IFrame Player API code asynchronously
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.onload = () => console.log('📦 YouTube API script downloaded');
        tag.onerror = () => {
            const err = 'Failed to load YouTube IFrame API';
            console.error('❌', err);
            setError(err);
            if (onError) onError(err);
        };
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // API will call this function when ready
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            console.log('✅ YouTube IFrame API Ready!');
            setYoutubeReady(true);
            if (originalCallback) originalCallback();
        };
    }, [onError]);

    // Initialize YouTube Player when API is ready
    useEffect(() => {
        if (!youtubeReady) {
            console.log('⏳ Waiting for YouTube API...');
            return;
        }
        if (!containerRef.current) {
            console.log('⏳ Waiting for container ref...');
            return;
        }
        if (!videoId) {
            console.log('❌ No video ID');
            return;
        }

        // If player already exists, just load the new video
        if (playerRef.current && playerRef.current.loadVideoById) {
            console.log('🔄 Player exists, loading new video:', videoId);
            playerRef.current.loadVideoById({
                videoId: videoId,
                startSeconds: startTime || 0,
                endSeconds: endTime
            });
            return;
        }

        // Prevent multiple player creation (React Strict Mode issue)
        if (isCreatingPlayerRef.current) {
            console.log('⏸️ Player creation already in progress, skipping...');
            return;
        }

        console.log('🎬 Initializing YouTube Player with video ID:', videoId);
        isCreatingPlayerRef.current = true;

        // Set a timeout to detect if player doesn't load
        const loadTimeout = setTimeout(() => {
            if (!playerInitialized) {
                console.warn('⚠️ Player taking too long to load (>10s). This might be a CORS or network issue.');
                console.warn('💡 Try: 1) Refresh the page, 2) Check your internet, 3) Try a different video');
            }
        }, 10000);

        try {
            const playerVars: any = {
                autoplay: 0, // Never autoplay, let user control
                controls: hidden ? 0 : 1, // Show controls when visible
                disablekb: hidden ? 1 : 0,
                fs: hidden ? 0 : 1,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                enablejsapi: 1,
                origin: typeof window !== 'undefined' ? window.location.origin : undefined,
            };

            if (startTime > 0) {
                playerVars.start = startTime;
            }

            if (endTime) {
                playerVars.end = endTime;
            }

            // Create player with host parameter to avoid CORS issues
            playerRef.current = new window.YT.Player(playerIdRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                host: 'https://www.youtube.com',
                playerVars,
                events: {
                    onReady: (event: any) => {
                        console.log('✅ YouTube Player onReady event - Player is ready!');
                        isCreatingPlayerRef.current = false;
                        setPlayerInitialized(true);
                        // Set volume
                        event.target.setVolume(volume);
                        event.target.unMute();
                        if (onReady) onReady(event.target);
                    },
                    onStateChange: (event: any) => {
                        console.log('YouTube Player state changed:', event.data);
                        // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
                        
                        // Handle loop manually
                        if (loop && event.data === 0) { // 0 = ended
                            console.log('Video ended, restarting for loop');
                            event.target.seekTo(0);
                            event.target.playVideo();
                        }
                        if (onStateChange) onStateChange(event.data);
                    },
                    onError: (event: any) => {
                        const errorMessages: Record<number, string> = {
                            2: 'Invalid video ID',
                            5: 'HTML5 player error',
                            100: 'Video not found or private',
                            101: 'Video owner does not allow embedding',
                            150: 'Video owner does not allow embedding'
                        };
                        const errorMsg = errorMessages[event.data] || `YouTube Player Error: ${event.data}`;
                        console.error(errorMsg);
                        setError(errorMsg);
                        if (onError) onError(errorMsg);
                    }
                }
            });
        } catch (err) {
            const errorMsg = `Failed to initialize YouTube Player: ${err}`;
            console.error(errorMsg);
            isCreatingPlayerRef.current = false;
            setError(errorMsg);
            if (onError) onError(errorMsg);
        }

        return () => {
            console.log('🧹 Cleanup: destroying player');
            clearTimeout(loadTimeout);
            if (playerRef.current && playerRef.current.destroy) {
                try {
                    playerRef.current.destroy();
                } catch (err) {
                    console.warn('Error destroying player:', err);
                }
                playerRef.current = null;
            }
            isCreatingPlayerRef.current = false;
            setPlayerInitialized(false);
        };
    }, [youtubeReady, videoId, hidden, startTime, endTime, volume, loop, onReady, onStateChange, onError]);

    if (!videoId) {
        console.warn('Invalid YouTube URL provided to YouTubePlayer:', videoUrl);
        return null;
    }

    if (error) {
        console.error('YouTubePlayer error:', error);
        // Still render the container for the player, errors are handled via callbacks
    }

    return (
        <div 
            ref={containerRef} 
            className={hidden ? "fixed -left-[9999px] -top-[9999px] pointer-events-none w-full h-full" : `w-full h-full ${className} relative`}
        >
            {/* Loading indicator */}
            {!playerInitialized && !hidden && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                        <div className="text-white text-sm">
                            {!youtubeReady ? '📡 Carregando YouTube API...' : '🎬 Inicializando player...'}
                        </div>
                        {youtubeReady && (
                            <div className="text-white/60 text-xs">
                                Aguarde alguns segundos...
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Player container with error boundary */}
            <div 
                id={playerIdRef.current} 
                className="w-full h-full"
                suppressHydrationWarning
            ></div>
        </div>
    );
}

/**
 * Hook to control YouTube Player
 * Returns player control functions
 */
export function useYouTubePlayer(playerRef: React.RefObject<any>) {
    const play = () => {
        if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.playVideo();
        }
    };

    const pause = () => {
        if (playerRef.current && playerRef.current.pauseVideo) {
            playerRef.current.pauseVideo();
        }
    };

    const stop = () => {
        if (playerRef.current && playerRef.current.stopVideo) {
            playerRef.current.stopVideo();
        }
    };

    const setVolume = (volume: number) => {
        if (playerRef.current && playerRef.current.setVolume) {
            playerRef.current.setVolume(Math.max(0, Math.min(100, volume)));
        }
    };

    const seekTo = (seconds: number) => {
        if (playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(seconds, true);
        }
    };

    const getPlayerState = () => {
        if (playerRef.current && playerRef.current.getPlayerState) {
            return playerRef.current.getPlayerState();
        }
        return -1;
    };

    const getCurrentTime = () => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
            return playerRef.current.getCurrentTime();
        }
        return 0;
    };

    const getDuration = () => {
        if (playerRef.current && playerRef.current.getDuration) {
            return playerRef.current.getDuration();
        }
        return 0;
    };

    return {
        play,
        pause,
        stop,
        setVolume,
        seekTo,
        getPlayerState,
        getCurrentTime,
        getDuration
    };
}
