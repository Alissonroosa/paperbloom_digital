"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RefreshCw, Volume2, VolumeX, Play, Pause, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { TimeCounter } from "@/components/TimeCounter";
import { FallingEmojis } from "@/components/effects/FallingEmojis";
import { applyTheme } from "@/lib/theme-utils";
import { fetchYouTubeVideoTitle } from "@/lib/youtube-utils";

// YouTube Player Types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

// Stages of the cinematic experience
type Stage =
    | "loading"
    | "error"
    | "intro-1"
    | "intro-2"
    | "intro-action"
    | "transition"
    | "reveal-photo"
    | "reveal-intro"
    | "reveal-message"
    | "reading"
    | "closing-1"
    | "closing-2"
    | "final"
    | "full-view";

interface MessageData {
  id: string;
  recipientName: string;
  senderName: string;
  messageText: string;
  imageUrl: string | null;
  youtubeUrl: string | null;
  qrCodeUrl: string | null;
  viewCount: number;
  createdAt: string;
  // Enhanced fields
  title?: string | null;
  specialDate?: string | null;
  closingMessage?: string | null;
  signature?: string | null;
  galleryImages?: string[];
  backgroundColor?: string | null;
  theme?: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage' | null;
  musicStartTime?: number | null;
  customEmoji?: string | null;
  showTimeCounter?: boolean;
  timeCounterLabel?: string | null;
}

// Helper Component for Typewriter Effect
function TypewriterText({ text, speed = 50, delay = 0 }: { text: string, speed?: number, delay?: number }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        // Reset displayed text when text changes
        setDisplayedText("");
        
        if (!text) return;
        
        let currentIndex = 0;
        let intervalId: NodeJS.Timeout;
        
        const startTimeout = setTimeout(() => {
            intervalId = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.substring(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(intervalId);
                }
            }, speed);
        }, delay);

        return () => {
            clearTimeout(startTimeout);
            if (intervalId) clearInterval(intervalId);
        };
    }, [text, speed, delay]);

    return <span>{displayedText || ""}</span>;
}

export default function MessageViewPage() {
    const params = useParams();
    const recipient = params.recipient as string;
    const id = params.id as string;
    
    const [stage, setStage] = useState<Stage>("loading");
    const [messageData, setMessageData] = useState<MessageData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
    const [youtubeReady, setYoutubeReady] = useState(false);
    const [youtubeTitle, setYoutubeTitle] = useState<string>("Música especial");
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // Fetch message data
    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const slug = `/mensagem/${recipient}/${id}`;
                const response = await fetch(`/api/messages${slug}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        setError("Mensagem não encontrada");
                    } else if (response.status === 402) {
                        setError("Esta mensagem ainda não está disponível");
                    } else {
                        setError("Erro ao carregar mensagem");
                    }
                    setStage("error");
                    return;
                }

                const data = await response.json();
                setMessageData(data);
                setStage("intro-1");
            } catch (err) {
                console.error("Error fetching message:", err);
                setError("Erro ao carregar mensagem");
                setStage("error");
            }
        };

        fetchMessage();
    }, [recipient, id]);

    // Fetch YouTube video title
    useEffect(() => {
        if (messageData?.youtubeUrl) {
            fetchYouTubeVideoTitle(messageData.youtubeUrl).then(title => {
                if (title) {
                    setYoutubeTitle(title);
                }
            });
        }
    }, [messageData?.youtubeUrl]);

    // Load YouTube IFrame API
    useEffect(() => {
        // Check if API is already loaded
        if (window.YT && window.YT.Player) {
            setYoutubeReady(true);
            return;
        }

        // Load the IFrame Player API code asynchronously
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // API will call this function when ready
        window.onYouTubeIframeAPIReady = () => {
            setYoutubeReady(true);
        };
    }, []);

    // Initialize YouTube Player when API is ready
    useEffect(() => {
        if (!youtubeReady || !playerContainerRef.current || playerRef.current || !messageData?.youtubeUrl) return;

        // Extract video ID from YouTube URL
        let videoId = '';
        try {
            const url = new URL(messageData.youtubeUrl);
            videoId = url.searchParams.get('v') || '';
        } catch (e) {
            console.error('Invalid YouTube URL:', e);
            return;
        }

        if (!videoId) return;

        playerRef.current = new window.YT.Player('youtube-player', {
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                enablejsapi: 1,
                start: messageData.musicStartTime || 0,
            },
            events: {
                onReady: (event: any) => {
                    event.target.setVolume(0);
                },
                onStateChange: (event: any) => {
                    // YT.PlayerState.PLAYING = 1, PAUSED = 2
                    setIsPlaying(event.data === 1);
                }
            }
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [youtubeReady, messageData?.youtubeUrl, messageData?.musicStartTime]);

    // Auto-rotate gallery images
    useEffect(() => {
        if (stage === "full-view" && messageData?.galleryImages && messageData.galleryImages.length > 0) {
            const interval = setInterval(() => {
                setCurrentGalleryIndex((prev) => (prev + 1) % messageData.galleryImages!.length);
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(interval);
        }
    }, [stage, messageData?.galleryImages]);

    // Sequence Logic
    useEffect(() => {
        if (!messageData) return;
        
        let timeout: NodeJS.Timeout;

        if (stage === "intro-1") {
            timeout = setTimeout(() => setStage("intro-2"), 2000);
        } else if (stage === "intro-2") {
            timeout = setTimeout(() => setStage("intro-action"), 2000);
        } else if (stage === "transition") {
            timeout = setTimeout(() => setStage("reveal-photo"), 2000);
        } else if (stage === "reveal-photo") {
            timeout = setTimeout(() => setStage("reveal-intro"), 3000);
        } else if (stage === "reveal-intro") {
            timeout = setTimeout(() => setStage("reveal-message"), 4000);
        } else if (stage === "reveal-message") {
            // Calculate time based on message length (50ms per character + 2 seconds buffer)
            const typingTime = messageData.messageText.length * 50;
            const bufferTime = 2000;
            timeout = setTimeout(() => setStage("reading"), typingTime + bufferTime);
        } else if (stage === "reading") {
            // Wait 2 seconds before going to closing
            timeout = setTimeout(() => setStage("closing-1"), 2000);
        } else if (stage === "closing-1") {
            // Show closing-1 (with time counter if enabled) for 5 seconds
            timeout = setTimeout(() => setStage("closing-2"), 5000);
        } else if (stage === "closing-2") {
            // Show closing-2 for 4 seconds before going to final
            timeout = setTimeout(() => setStage("final"), 4000);
        }

        return () => clearTimeout(timeout);
    }, [stage, messageData]);

    // Handle Interaction
    const handleStart = () => {
        setStage("transition");
        if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.setVolume(0);
            playerRef.current.playVideo();
            
            // Fade in music
            let vol = 0;
            const interval = setInterval(() => {
                if (vol < 80) {
                    vol += 10;
                    if (playerRef.current) playerRef.current.setVolume(vol);
                } else {
                    clearInterval(interval);
                }
            }, 100);
        }
    };

    const handleRestart = () => {
        setStage("intro-1");
        if (playerRef.current && playerRef.current.pauseVideo) {
            playerRef.current.pauseVideo();
            playerRef.current.seekTo(0);
            setIsPlaying(false);
        }
    };

    const handleFinishReading = () => {
        setStage("closing-1");
    };

    const handleFullView = () => {
        setStage("full-view");
        if (playerRef.current && playerRef.current.getPlayerState) {
            const state = playerRef.current.getPlayerState();
            // If not playing (state !== 1), start playing
            if (state !== 1) {
                playerRef.current.playVideo();
            }
        }
    };

    const toggleMusic = () => {
        if (playerRef.current && playerRef.current.getPlayerState) {
            const state = playerRef.current.getPlayerState();
            if (state === 1) { // Playing
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    const isDarkStage = ["intro-1", "intro-2", "intro-action", "closing-1", "closing-2", "final"].includes(stage);

    // Apply theme to get colors
    const themeColors = messageData ? applyTheme(
        messageData.backgroundColor || '#FDF6F0',
        messageData.theme || 'gradient'
    ) : {
        background: '#FDF6F0',
        textColor: '#4A4A4A',
        secondaryTextColor: '#8B5F5F',
        accentColor: '#D4A5A5',
        brandingColor: '#4A4A4A',
        backgroundGradient: null
    };

    // Get background style
    const getBackgroundStyle = () => {
        if (themeColors.backgroundGradient) {
            return { background: themeColors.backgroundGradient };
        }
        return { backgroundColor: themeColors.background };
    };

    // Loading state
    if (stage === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF0F5] to-[#E6C2C2]">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-[#8B5F5F]/20 border-t-[#8B5F5F] rounded-full mx-auto mb-4"
                    />
                    <p className="text-[#8B5F5F] text-xl font-light">Carregando sua mensagem...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (stage === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF0F5] to-[#E6C2C2] px-4">
                <div className="text-center max-w-md">
                    <Heart className="w-16 h-16 text-[#8B5F5F]/50 mx-auto mb-4" />
                    <h1 className="text-2xl md:text-3xl text-[#8B5F5F] font-serif mb-4">{error}</h1>
                    <p className="text-[#8B5F5F]/70 mb-8">
                        Verifique o link e tente novamente.
                    </p>
                    <Button
                        onClick={() => window.location.href = '/'}
                        className="bg-[#8B5F5F] text-white hover:bg-[#6B4F4F]"
                    >
                        Voltar para o início
                    </Button>
                </div>
            </div>
        );
    }

    if (!messageData) return null;

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans transition-all duration-1000"
            style={{
                ...getBackgroundStyle(),
                color: themeColors.textColor,
            }}
        >

            {/* YouTube Player (Hidden) */}
            <div ref={playerContainerRef} className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
                <div id="youtube-player"></div>
            </div>

            {/* Falling Emojis */}
            {messageData.customEmoji && (
                <FallingEmojis emoji={messageData.customEmoji} count={15} />
            )}

            {/* Global Background Texture (Subtle Paper Grain) */}
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

            {/* Global Floating Particles (Subtle) - Active in all stages except full-view for immersion */}
            {stage !== "full-view" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-white/40 rounded-full blur-xl"
                            style={{
                                width: Math.random() * 50 + 20,
                                height: Math.random() * 50 + 20,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -100],
                                x: [0, Math.random() * 50 - 25],
                                opacity: [0, 0.3, 0],
                                scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{
                                duration: 15 + Math.random() * 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* --- INTRO SEQUENCE --- */}
            <AnimatePresence mode="wait">
                {stage === "intro-1" && (
                    <motion.div
                        key="intro-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 flex items-center justify-center px-4 text-center z-10"
                    >
                        <p className="text-2xl md:text-3xl font-light tracking-wide italic"
                           style={{ color: themeColors.secondaryTextColor }}>
                            Existe algo que só você deveria ver hoje...
                        </p>
                    </motion.div>
                )}

                {stage === "intro-2" && (
                    <motion.div
                        key="intro-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 3.5 }}
                        className="absolute inset-0 flex items-center justify-center px-4 text-center z-10"
                    >
                        <p className="text-2xl md:text-3xl font-light tracking-wide italic"
                           style={{ color: themeColors.secondaryTextColor }}>
                            Uma pessoa pensou em você com carinho.
                        </p>
                    </motion.div>
                )}

                {stage === "intro-action" && (
                    <motion.div
                        key="intro-action"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 flex items-center justify-center px-4 z-10"
                    >
                        <button
                            onClick={handleStart}
                            className="group relative px-8 py-4 bg-transparent text-xl font-light tracking-widest uppercase transition-all duration-500"
                            style={{ color: themeColors.secondaryTextColor }}
                        >
                            <span className="relative z-10">Clique ♥</span>
                            <span className="absolute inset-0 rounded-full border opacity-20 duration-[3s] animate-ping"
                                  style={{ borderColor: `${themeColors.secondaryTextColor}30` }} />
                            <span className="absolute inset-0 rounded-full border scale-110 duration-[2s] animate-pulse"
                                  style={{ borderColor: `${themeColors.secondaryTextColor}10` }} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MAIN EXPERIENCE (Cinematic) --- */}
            {["transition", "reveal-photo", "reveal-intro", "reveal-message", "reading"].includes(stage) && (
                <div className="relative w-full max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center p-6 md:p-12 z-10">

                    {/* Photo Reveal */}
                    {messageData.imageUrl && (
                        <div className="relative mb-12 w-full max-w-md aspect-[4/5] md:aspect-square">
                            <AnimatePresence>
                                {stage !== "transition" && (
                                    <motion.div
                                        initial={{ opacity: 0, filter: "blur(20px)", scale: 0.9 }}
                                        animate={{
                                            opacity: 1,
                                            filter: stage === "reveal-photo" ? "blur(10px)" : "blur(0px)",
                                            scale: 1
                                        }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        className="relative w-full h-full rounded-sm overflow-hidden shadow-2xl"
                                    >
                                        <div className="absolute inset-0 border-[1px] border-white/50 z-20 m-2 opacity-50" />
                                        <Image
                                            src={messageData.imageUrl}
                                            alt="Mensagem especial"
                                            fill
                                            className="object-cover"
                                        />

                                        {/* Glow Effect on Reveal */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0, 0.5, 0] }}
                                            transition={{ delay: 2, duration: 1 }}
                                            className="absolute inset-0 bg-white mix-blend-overlay z-10"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Text Area */}
                    <div className="w-full max-w-2xl text-center relative z-10 min-h-[200px]">
                        <AnimatePresence mode="wait">
                            {stage === "reveal-intro" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div 
                                        className="text-3xl md:text-4xl font-light"
                                        style={{ color: themeColors.textColor }}
                                    >
                                        <TypewriterText text="Isso é para você..." delay={0} />
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2 }}
                                        className="text-2xl md:text-3xl font-light"
                                        style={{ color: themeColors.secondaryTextColor }}
                                    >
                                        ...porque você merece sentir-se especial.
                                    </motion.div>
                                </motion.div>
                            )}

                            {(stage === "reveal-message" || stage === "reading") && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-2xl md:text-3xl leading-relaxed font-light"
                                    style={{ color: themeColors.textColor }}
                                >
                                    <TypewriterText
                                        text={messageData.messageText}
                                        speed={50}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Finish Reading Button */}
                    {stage === "reading" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3 }}
                            className="mt-12"
                        >
                            <Button
                                variant="ghost"
                                onClick={handleFinishReading}
                                className="transition-colors font-light tracking-widest text-sm uppercase"
                                style={{ color: themeColors.secondaryTextColor }}
                            >
                                Continuar
                            </Button>
                        </motion.div>
                    )}

                    {/* Date & Details (Subtle) */}
                    {(stage === "reveal-message" || stage === "reading") && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 5 }}
                            className="absolute bottom-6 left-0 w-full text-center"
                        >
                            <p className="text-xs text-muted-foreground/50 tracking-widest uppercase font-sans">
                                {messageData.specialDate 
                                    ? new Date(messageData.specialDate).toLocaleDateString('pt-BR', { 
                                        day: 'numeric', 
                                        month: 'long',
                                        year: 'numeric'
                                    })
                                    : new Date(messageData.createdAt).toLocaleDateString('pt-BR', { 
                                        day: 'numeric', 
                                        month: 'long',
                                        year: 'numeric'
                                    })
                                } • Feito especialmente para você
                            </p>
                        </motion.div>
                    )}
                </div>
            )}

            {/* --- FULL VIEW (Rich Content) --- */}
            {stage === "full-view" && (
                <motion.div
                    key="full-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="w-full max-w-5xl mx-auto z-10 px-4 py-8 md:py-12"
                >
                    {/* Music Player Control (Floating) */}
                    {messageData.youtubeUrl && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="fixed top-6 right-6 z-50"
                        >
                            <button
                                onClick={toggleMusic}
                                className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl border border-white/50 text-primary hover:scale-110 transition-all duration-300 group"
                            >
                                {isPlaying ? (
                                    <div className="relative">
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                        <Volume2 className="w-6 h-6 group-hover:animate-pulse" />
                                    </div>
                                ) : (
                                    <VolumeX className="w-6 h-6 text-muted-foreground" />
                                )}
                            </button>
                        </motion.div>
                    )}

                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden relative">
                        {/* Decorative background within card */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />

                        {/* Header Image / Cover */}
                        {messageData.imageUrl && (
                            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden group">
                                <motion.div
                                    initial={{ scale: 1.2, y: -20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={messageData.imageUrl}
                                        alt="Cover"
                                        fill
                                        className="object-cover transition-transform duration-[10s] group-hover:scale-105"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </motion.div>

                                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.8, duration: 0.8 }}
                                    >
                                        <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium mb-4 border border-white/10">
                                            {messageData.specialDate 
                                                ? new Date(messageData.specialDate).toLocaleDateString('pt-BR', { 
                                                    day: 'numeric', 
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                                : new Date(messageData.createdAt).toLocaleDateString('pt-BR', { 
                                                    day: 'numeric', 
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                            }
                                        </div>
                                        <span 
                                            className="font-script text-4xl md:text-5xl block mb-2 opacity-90 text-white"
                                        >
                                            {messageData.recipientName},
                                        </span>
                                        <h2 
                                            className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white"
                                        >
                                            {messageData.title || "Uma mensagem especial"}
                                        </h2>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        <div className="p-8 md:p-16 relative">
                            {/* Main Message */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                                className="prose prose-xl mx-auto text-center mb-20 max-w-3xl"
                            >
                                <Heart 
                                    className="w-12 h-12 mx-auto mb-8 fill-current opacity-20"
                                    style={{ color: themeColors.accentColor }}
                                />
                                <p 
                                    className="text-2xl md:text-4xl leading-relaxed font-light text-balance"
                                    style={{ color: themeColors.textColor }}
                                >
                                    "{messageData.messageText}"
                                </p>
                                <div 
                                    className="mt-8 text-3xl font-light"
                                    style={{ color: themeColors.accentColor }}
                                >
                                    - {messageData.signature || messageData.senderName}
                                </div>
                            </motion.div>

                            {/* Time Counter in Full View */}
                            {messageData.showTimeCounter && messageData.specialDate && messageData.timeCounterLabel && (
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.6, duration: 0.8 }}
                                    className="mb-20"
                                >
                                    <TimeCounter 
                                        startDate={new Date(messageData.specialDate)} 
                                        label={messageData.timeCounterLabel}
                                    />
                                </motion.div>
                            )}

                            {/* Photo Gallery Grid with Auto-Rotation */}
                            {messageData.galleryImages && messageData.galleryImages.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
                                    {[
                                        { span: "md:col-span-4", height: "h-64 md:h-80", offset: 0 },
                                        { span: "md:col-span-4 md:-mt-12", height: "h-64 md:h-96", offset: 1 },
                                        { span: "md:col-span-4", height: "h-64 md:h-80", offset: 2 }
                                    ].map((item, index) => {
                                        const imageIndex = (currentGalleryIndex + item.offset) % messageData.galleryImages!.length;
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 50, rotate: index % 2 === 0 ? -2 : 2 }}
                                                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.2 * index, duration: 0.8 }}
                                                className={cn(
                                                    "relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group",
                                                    item.span,
                                                    item.height
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10 duration-500 mix-blend-overlay" />
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={imageIndex}
                                                        initial={{ opacity: 0, scale: 1.1 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ duration: 0.8 }}
                                                        className="absolute inset-0"
                                                    >
                                                        <Image
                                                            src={messageData.galleryImages![imageIndex]}
                                                            alt={`Memory ${imageIndex + 1}`}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                        />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Music Player Visualizer */}
                            {messageData.youtubeUrl && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl p-8 flex items-center gap-8 max-w-3xl mx-auto border border-white/50 shadow-inner"
                                >
                                    <div
                                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300 flex-shrink-0 group shadow-md"
                                        onClick={toggleMusic}
                                    >
                                        {isPlaying ? <Pause className="w-8 h-8 text-primary fill-current" /> : <Play className="w-8 h-8 text-primary ml-1 fill-current" />}
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <div 
                                            className="flex justify-between items-center gap-3 text-base mb-3 font-medium tracking-wide"
                                            style={{ color: themeColors.textColor }}
                                        >
                                            <span className="truncate flex-1 min-w-0">{youtubeTitle}</span>
                                            <span style={{ color: themeColors.accentColor }} className="flex-shrink-0 whitespace-nowrap">
                                                {isPlaying ? "Tocando..." : "Pausado"}
                                            </span>
                                        </div>
                                        <div className="h-3 bg-white/50 rounded-full overflow-hidden flex items-end gap-1 p-0.5">
                                            {[...Array(50)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-full"
                                                    animate={{
                                                        height: isPlaying ? ["20%", "100%", "40%", "90%", "30%"] : "20%"
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        delay: i * 0.02,
                                                        repeatType: "mirror",
                                                        ease: "easeInOut"
                                                    }}
                                                    style={{ height: "20%" }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Footer / Branding */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-center mt-24 pt-12 border-t border-border/40"
                            >
                                <p 
                                    className="text-sm mb-4 font-medium tracking-widest uppercase"
                                    style={{ color: themeColors.secondaryTextColor }}
                                >
                                    Criado com amor usando
                                </p>
                                <span 
                                    className="font-script text-5xl block mb-8"
                                    style={{ color: themeColors.brandingColor }}
                                >
                                    Paper Bloom
                                </span>
                                <div>
                                    <Button 
                                        variant="outline" 
                                        className="rounded-full border-primary/30 text-primary hover:bg-primary/5 px-8 h-12 text-base"
                                        onClick={() => window.location.href = '/'}
                                    >
                                        Criar uma mensagem igual a essa
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- CLOSING SEQUENCE --- */}
            <AnimatePresence mode="wait">
                {stage === "closing-1" && (
                    <motion.div
                        key="closing-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10 overflow-y-auto"
                    >
                        {/* Time Counter (if enabled) */}
                        {messageData.showTimeCounter && messageData.specialDate && messageData.timeCounterLabel && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="mb-12 w-full"
                            >
                                <TimeCounter 
                                    startDate={new Date(messageData.specialDate)} 
                                    label={messageData.timeCounterLabel}
                                />
                            </motion.div>
                        )}
                        
                        {/* Closing Message */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: messageData.showTimeCounter ? 0.6 : 0.3, duration: 0.8 }}
                            className="text-2xl md:text-3xl font-light tracking-wide"
                            style={{ color: themeColors.secondaryTextColor }}
                        >
                            Obrigado por estar comigo.
                        </motion.p>
                    </motion.div>
                )}

                {stage === "closing-2" && (
                    <motion.div
                        key="closing-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 flex items-center justify-center px-4 text-center z-10"
                    >
                        <p className="text-2xl md:text-3xl font-light tracking-wide"
                           style={{ color: themeColors.secondaryTextColor }}>
                            {messageData.closingMessage || "Você é importante para mim."}
                        </p>
                    </motion.div>
                )}

                {stage === "final" && (
                    <motion.div
                        key="final"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10"
                    >
                        <div className="mb-12">
                            <p className="text-lg font-light mb-2"
                               style={{ color: `${themeColors.secondaryTextColor}80` }}>
                                "Um pequeno gesto. Um grande sentimento."
                            </p>
                            <p className="font-script text-2xl"
                               style={{ color: themeColors.brandingColor }}>
                                — Paper Bloom Digital
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleFullView}
                                size="lg"
                                className="rounded-full bg-white hover:bg-white/90 px-8 h-14 text-lg shadow-lg"
                                style={{ 
                                    color: themeColors.secondaryTextColor,
                                    boxShadow: `0 10px 15px -3px ${themeColors.secondaryTextColor}10`
                                }}
                            >
                                <ExternalLink className="w-5 h-5 mr-2" />
                                Visualizar mensagem completa
                            </Button>

                            <Button
                                onClick={handleRestart}
                                variant="ghost"
                                className="rounded-full transition-all duration-300"
                                style={{ 
                                    color: `${themeColors.secondaryTextColor}60`,
                                }}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Ver de novo
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
