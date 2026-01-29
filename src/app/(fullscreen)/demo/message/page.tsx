"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RefreshCw, Volume2, VolumeX, Play, Pause, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { cn } from "@/lib/utils";
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

// Demo data structure
interface DemoData {
    introText1: string
    introText2: string
    pageTitle: string
    recipientName: string
    specialDate: string
    mainMessage: string
    signature: string
    mainImageUrl: string
    galleryImages: string[]
    youtubeVideoId: string
    youtubeSongName: string
    showTimeCounter?: boolean
    backgroundColor?: string
    theme?: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage'
    customEmoji?: string | null
    timeCounterLabel?: string
    specialDateISO?: string
}

const DEFAULT_DEMO_DATA: DemoData = {
    introText1: "Existe algo que só você deveria ver hoje...",
    introText2: "Uma pessoa pensou em você com carinho.",
    pageTitle: "Feliz Aniversário!",
    recipientName: "Para o meu amor,",
    specialDate: "23 de Novembro, 2024",
    mainMessage: "Não importa quanto tempo passe, cada momento ao seu lado continua sendo o meu presente favorito. Obrigado por ser minha companheira, minha amiga e o amor da minha vida.",
    signature: "Seu Eterno Apaixonado",
    mainImageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop",
    galleryImages: [
        "https://images.unsplash.com/photo-1522673607200-1645062cd958?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2069&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
    ],
    youtubeVideoId: "nSDgHBxUbVQ",
    youtubeSongName: "Ed Sheeran - Perfect"
}

export default function CinematicDemoPage() {
    const [stage, setStage] = useState<Stage>("intro-1");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
    const [youtubeReady, setYoutubeReady] = useState(false);
    const [demoData, setDemoData] = useState<DemoData>(DEFAULT_DEMO_DATA);
    const [youtubeTitle, setYoutubeTitle] = useState<string>("Ed Sheeran - Perfect");
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // Load demo data from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('paperbloom-demo-data')
        if (saved) {
            try {
                setDemoData(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to load demo data:', e)
            }
        }
    }, [])

    // Destructure for easier access
    const {
        introText1,
        introText2,
        pageTitle,
        recipientName,
        specialDate,
        mainMessage,
        signature,
        mainImageUrl,
        galleryImages,
        youtubeVideoId: YOUTUBE_VIDEO_ID,
        youtubeSongName,
        showTimeCounter,
        timeCounterLabel,
        specialDateISO
    } = demoData;

    // Fetch YouTube video title
    useEffect(() => {
        if (YOUTUBE_VIDEO_ID) {
            const youtubeUrl = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`;
            fetchYouTubeVideoTitle(youtubeUrl).then(title => {
                if (title) {
                    setYoutubeTitle(title);
                }
            });
        }
    }, [YOUTUBE_VIDEO_ID]);

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
        if (!youtubeReady || !playerContainerRef.current || playerRef.current) return;

        playerRef.current = new window.YT.Player('youtube-player', {
            videoId: YOUTUBE_VIDEO_ID,
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
    }, [youtubeReady]);

    // Auto-rotate gallery images
    useEffect(() => {
        if (stage === "full-view") {
            const interval = setInterval(() => {
                setCurrentGalleryIndex((prev) => (prev + 1) % galleryImages.length);
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(interval);
        }
    }, [stage, galleryImages.length]);

    // Sequence Logic
    useEffect(() => {
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
            timeout = setTimeout(() => setStage("reading"), 8000);
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
    }, [stage, showTimeCounter, specialDateISO]);

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
    const themeColors = applyTheme(
        demoData.backgroundColor || '#FDF6F0',
        demoData.theme || 'gradient'
    );

    // Get background style
    const getBackgroundStyle = () => {
        if (themeColors.backgroundGradient) {
            return { background: themeColors.backgroundGradient };
        }
        return { backgroundColor: themeColors.background };
    };

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans transition-all duration-1000"
            style={{
                ...getBackgroundStyle(),
                color: themeColors.textColor,
            }}
        >

            {/* YouTube Player (Hidden) - Perfect by Ed Sheeran */}
            <div ref={playerContainerRef} className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
                <div id="youtube-player"></div>
            </div>

            {/* Falling Emojis */}
            {demoData.customEmoji && (
                <FallingEmojis emoji={demoData.customEmoji} count={15} />
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
                                duration: 20 + Math.random() * 10,
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
                        <p className="text-[#8B5F5F] text-2xl md:text-3xl font-light tracking-wide italic">
                            {introText1}
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
                        <p className="text-[#8B5F5F] text-2xl md:text-3xl font-light tracking-wide italic">
                            {introText2}
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
                            className="group relative px-8 py-4 bg-transparent text-[#8B5F5F] text-xl font-light tracking-widest uppercase transition-all duration-500 hover:text-[#4A4A4A]"
                        >
                            <span className="relative z-10">Clique ♥</span>
                            <span className="absolute inset-0 rounded-full border border-[#8B5F5F]/30 animate-ping opacity-20 duration-[3s]" />
                            <span className="absolute inset-0 rounded-full border border-[#8B5F5F]/10 scale-110 animate-pulse duration-[2s]" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MAIN EXPERIENCE (Cinematic) --- */}
            {["transition", "reveal-photo", "reveal-intro", "reveal-message", "reading"].includes(stage) && (
                <div className="relative w-full max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center p-6 md:p-12 z-10">

                    {/* Photo Reveal */}
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
                                        src={mainImageUrl}
                                        alt="Emotional Memory"
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
                                        text={mainMessage}
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
                                {specialDate} • Feito especialmente para você
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

                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden relative">
                        {/* Decorative background within card */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />

                        {/* Header Image / Cover */}
                        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden group">
                            <motion.div
                                initial={{ scale: 1.2, y: -20 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={mainImageUrl}
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
                                        {specialDate}
                                    </div>
                                    <span 
                                        className="font-script text-4xl md:text-5xl block mb-2 opacity-90 text-white"
                                    >
                                        {recipientName}
                                    </span>
                                    <h2 
                                        className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white"
                                    >
                                        {pageTitle}
                                    </h2>
                                </motion.div>
                            </div>
                        </div>

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
                                    "{mainMessage}"
                                </p>
                                <div 
                                    className="mt-8 text-3xl font-light"
                                    style={{ color: themeColors.accentColor }}
                                >
                                    - {signature}
                                </div>
                            </motion.div>

                            {/* Time Counter in Full View */}
                            {showTimeCounter && specialDateISO && timeCounterLabel && (
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.6, duration: 0.8 }}
                                    className="mb-20"
                                >
                                    <TimeCounter 
                                        startDate={new Date(specialDateISO)} 
                                        label={timeCounterLabel}
                                    />
                                </motion.div>
                            )}

                            {/* Photo Gallery Grid with Auto-Rotation */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
                                {[
                                    { span: "md:col-span-4", height: "h-64 md:h-80", offset: 0 },
                                    { span: "md:col-span-4 md:-mt-12", height: "h-64 md:h-96", offset: 1 },
                                    { span: "md:col-span-4", height: "h-64 md:h-80", offset: 2 }
                                ].map((item, index) => {
                                    const imageIndex = (currentGalleryIndex + item.offset) % galleryImages.length;
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
                                                        src={galleryImages[imageIndex]}
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

                            {/* Music Player Visualizer */}
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
                                    <Button variant="outline" className="rounded-full border-primary/30 text-primary hover:bg-primary/5 px-8 h-12 text-base">
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
                        {showTimeCounter && specialDateISO && timeCounterLabel && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="mb-12 w-full"
                            >
                                <TimeCounter 
                                    startDate={new Date(specialDateISO)} 
                                    label={timeCounterLabel}
                                />
                            </motion.div>
                        )}
                        
                        {/* Closing Message */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: showTimeCounter ? 0.6 : 0.3, duration: 0.8 }}
                            className="text-[#8B5F5F] text-2xl md:text-3xl font-light tracking-wide"
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
                        <p className="text-[#8B5F5F] text-2xl md:text-3xl font-light tracking-wide">
                            Você é importante para mim.
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
                                className="rounded-full bg-white text-[#8B5F5F] hover:bg-white/90 px-8 h-14 text-lg shadow-lg shadow-[#8B5F5F]/10"
                            >
                                <ExternalLink className="w-5 h-5 mr-2" />
                                Visualizar mensagem completa
                            </Button>

                            <Button
                                onClick={handleRestart}
                                variant="ghost"
                                className="rounded-full text-[#8B5F5F]/60 hover:text-[#8B5F5F] hover:bg-[#8B5F5F]/10 transition-all duration-300"
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
