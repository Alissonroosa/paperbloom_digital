"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RefreshCw, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FallingEmojis } from "@/components/effects/FallingEmojis";
import { applyTheme } from "@/lib/theme-utils";
import { fetchYouTubeVideoTitle } from "@/lib/youtube-utils";

// Stages of the cinematic experience
export type PreviewStage =
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
        setDisplayedText(""); // Reset on text change
        let currentIndex = 0;
        const startTimeout = setTimeout(() => {
            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText((prev) => prev + text[currentIndex]);
                    currentIndex++;
                } else {
                    clearInterval(interval);
                }
            }, speed);
            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [text, speed, delay]);

    return <span>{displayedText}</span>;
}

export interface CinematicPreviewProps {
    data: {
        title: string;
        specialDate: Date | null;
        mainImage: string | null;
        galleryImages: string[];
        from: string;
        to: string;
        message: string;
        signature: string;
        closing: string;
        youtubeLink: string;
        backgroundColor?: string;
        theme?: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage';
        customEmoji?: string | null;
    };
    stage?: PreviewStage;
    onStageChange?: (stage: PreviewStage) => void;
    autoPlay?: boolean;
}

export function CinematicPreview({
    data,
    stage: controlledStage,
    onStageChange,
    autoPlay = false
}: CinematicPreviewProps) {
    const [internalStage, setInternalStage] = useState<PreviewStage>("intro-1");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
    const [youtubeTitle, setYoutubeTitle] = useState<string>("Música Especial");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Use controlled or internal stage
    const stage = controlledStage !== undefined ? controlledStage : internalStage;
    const setStage = (newStage: PreviewStage) => {
        if (controlledStage === undefined) {
            setInternalStage(newStage);
        }
        onStageChange?.(newStage);
    };

    // Fetch YouTube video title
    useEffect(() => {
        if (data.youtubeLink) {
            fetchYouTubeVideoTitle(data.youtubeLink).then(title => {
                if (title) {
                    setYoutubeTitle(title);
                }
            });
        }
    }, [data.youtubeLink]);

    // Auto-rotate gallery images
    useEffect(() => {
        if (stage === "full-view" && data.galleryImages.length > 0) {
            const interval = setInterval(() => {
                setCurrentGalleryIndex((prev) => (prev + 1) % data.galleryImages.length);
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(interval);
        }
    }, [stage, data.galleryImages.length]);

    // Format date in Portuguese
    const formatDate = (date: Date | null): string => {
        if (!date) return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Sequence Logic
    useEffect(() => {
        if (!autoPlay && stage === "intro-1") return;
        
        let timeout: NodeJS.Timeout;

        if (stage === "intro-1") {
            timeout = setTimeout(() => setStage("intro-2"), 4000);
        } else if (stage === "intro-2") {
            timeout = setTimeout(() => setStage("intro-action"), 4000);
        } else if (stage === "transition") {
            timeout = setTimeout(() => setStage("reveal-photo"), 2000);
        } else if (stage === "reveal-photo") {
            timeout = setTimeout(() => setStage("reveal-intro"), 3000);
        } else if (stage === "reveal-intro") {
            timeout = setTimeout(() => setStage("reveal-message"), 4000);
        } else if (stage === "reveal-message") {
            timeout = setTimeout(() => setStage("reading"), 8000);
        } else if (stage === "reading" && autoPlay) {
            // Loop back to intro-1 when in autoPlay mode
            timeout = setTimeout(() => setStage("intro-1"), 3000);
        }

        return () => clearTimeout(timeout);
    }, [stage, autoPlay, setStage]);

    // Handle Interaction
    const handleStart = () => {
        setStage("transition");
        if (audioRef.current && data.youtubeLink) {
            audioRef.current.volume = 0;
            audioRef.current.play().then(() => {
                setIsPlaying(true);
                // Fade in music
                let vol = 0;
                const interval = setInterval(() => {
                    if (vol < 0.8) {
                        vol += 0.1;
                        if (audioRef.current) audioRef.current.volume = vol;
                    } else {
                        clearInterval(interval);
                    }
                }, 100);
            }).catch(e => console.log("Audio play failed", e));
        }
    };

    const handleRestart = () => {
        setStage("intro-1");
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    const handleFinishReading = () => {
        setStage("closing-1");
        setTimeout(() => setStage("closing-2"), 4000);
        setTimeout(() => setStage("final"), 8000);
    };

    const handleFullView = () => {
        setStage("full-view");
        if (audioRef.current && audioRef.current.paused && data.youtubeLink) {
            audioRef.current.play().then(() => setIsPlaying(true));
        }
    };

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const isDarkStage = ["intro-1", "intro-2", "intro-action", "closing-1", "closing-2", "final"].includes(stage);

    // Get display values with defaults
    const displayTitle = data.title || "Uma mensagem especial";
    const displayMessage = data.message || "Sua mensagem especial aparecerá aqui...";
    const displaySignature = data.signature || `Com carinho, ${data.from || "..."}`;
    const displayClosing = data.closing || "Obrigado por sentir isso.";
    const displayTo = data.to || "...";

    // Apply theme to get colors
    const themeColors = applyTheme(
        data.backgroundColor || '#FDF6F0',
        data.theme || 'gradient'
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
            role="region"
            aria-label="Visualização cinemática da mensagem"
            aria-live="polite"
        >

            {/* Music */}
            {data.youtubeLink && (
                <audio ref={audioRef} loop src={data.youtubeLink} aria-label="Música de fundo" />
            )}

            {/* Falling Emojis */}
            {data.customEmoji && (
                <FallingEmojis emoji={data.customEmoji} count={15} />
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
                        <p className="text-[#8B5F5F] text-2xl md:text-3xl font-light tracking-wide font-serif">
                            {displayTitle}
                        </p>
                    </motion.div>
                )}

                {stage === "intro-2" && (
                    <motion.div
                        key="intro-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 flex items-center justify-center px-4 text-center z-10"
                    >
                        <p className="text-[#8B5F5F] text-2xl md:text-3xl font-light tracking-wide font-serif">
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
                        transition={{ duration: 1 }}
                        className="absolute inset-0 flex items-center justify-center px-4 z-10"
                    >
                        <button
                            onClick={handleStart}
                            className="group relative px-8 py-4 min-h-[56px] bg-transparent text-[#8B5F5F] text-base md:text-xl font-light tracking-widest uppercase transition-all duration-500 hover:text-[#4A4A4A]"
                            aria-label="Iniciar experiência cinemática"
                        >
                            <span className="relative z-10">Toque para sentir</span>
                            <span className="absolute inset-0 rounded-full border border-[#8B5F5F]/30 animate-ping opacity-20 duration-[3s]" aria-hidden="true" />
                            <span className="absolute inset-0 rounded-full border border-[#8B5F5F]/10 scale-110 animate-pulse duration-[2s]" aria-hidden="true" />
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
                            {stage !== "transition" && data.mainImage && (
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
                                        src={data.mainImage}
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
                                    className="font-script text-3xl md:text-4xl mb-4"
                                    style={{ color: themeColors.textColor }}
                                >
                                    <TypewriterText text={`Para ${displayTo}...`} delay={0} />
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2 }}
                                        style={{ color: themeColors.secondaryTextColor }}
                                    >
                                        <br />
                                        ...porque você merece sentir-se especial.
                                    </motion.div>
                                </motion.div>
                            )}

                            {(stage === "reveal-message" || stage === "reading") && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-handwriting text-2xl md:text-3xl leading-relaxed"
                                    style={{ color: themeColors.textColor }}
                                >
                                    <TypewriterText
                                        text={displayMessage}
                                        speed={50}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: displayMessage.length * 0.05 + 1 }}
                                        className="mt-6 font-script text-2xl"
                                        style={{ color: themeColors.accentColor }}
                                    >
                                        {displaySignature}
                                    </motion.div>
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
                                className="transition-colors font-light tracking-widest text-sm uppercase min-h-[44px]"
                                style={{ color: themeColors.secondaryTextColor }}
                                aria-label="Continuar para próxima etapa"
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
                            <p 
                                className="text-xs tracking-widest uppercase font-sans opacity-50"
                                style={{ color: themeColors.secondaryTextColor }}
                            >
                                {formatDate(data.specialDate)} • Feito especialmente para você
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
                    {data.youtubeLink && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="fixed top-6 right-6 z-50"
                        >
                            <button
                                onClick={toggleMusic}
                                className="bg-white/90 backdrop-blur-md p-4 min-w-[56px] min-h-[56px] rounded-full shadow-xl border border-white/50 text-primary hover:scale-110 transition-all duration-300 group"
                                aria-label={isPlaying ? "Pausar música" : "Tocar música"}
                                aria-pressed={isPlaying}
                            >
                                {isPlaying ? (
                                    <div className="relative">
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden="true">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                        <Volume2 className="w-6 h-6 group-hover:animate-pulse" aria-hidden="true" />
                                    </div>
                                ) : (
                                    <VolumeX className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                                )}
                            </button>
                        </motion.div>
                    )}

                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden relative">
                        {/* Decorative background within card */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />

                        {/* Header Image / Cover */}
                        {data.mainImage && (
                            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden group">
                                <motion.div
                                    initial={{ scale: 1.2, y: -20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={data.mainImage}
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
                                            {formatDate(data.specialDate)}
                                        </div>
                                        <span className="font-script text-4xl md:text-5xl block mb-2 opacity-90 text-white">Para {displayTo},</span>
                                        <h2 className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white">{displayTitle}</h2>
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
                                    className="font-serif text-2xl md:text-4xl leading-relaxed italic text-balance"
                                    style={{ color: themeColors.textColor }}
                                >
                                    &ldquo;{displayMessage}&rdquo;
                                </p>
                                <div 
                                    className="mt-8 font-script text-3xl"
                                    style={{ color: themeColors.accentColor }}
                                >
                                    {displaySignature}
                                </div>
                            </motion.div>

                            {/* Photo Gallery Grid with Auto-Rotation */}
                            {data.galleryImages.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
                                    {[
                                        { span: "md:col-span-4", height: "h-64 md:h-80", offset: 0 },
                                        { span: "md:col-span-4 md:-mt-12", height: "h-64 md:h-96", offset: 1 },
                                        { span: "md:col-span-4", height: "h-64 md:h-80", offset: 2 }
                                    ].map((item, index) => {
                                        const imageIndex = (currentGalleryIndex + item.offset) % data.galleryImages.length;
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
                                                            src={data.galleryImages[imageIndex]}
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
                            {data.youtubeLink && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl p-8 flex items-center gap-8 max-w-3xl mx-auto border border-white/50 shadow-inner"
                                >
                                    <button
                                        className="w-20 h-20 min-w-[80px] min-h-[80px] bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300 flex-shrink-0 group shadow-md"
                                        onClick={toggleMusic}
                                        aria-label={isPlaying ? "Pausar música" : "Tocar música"}
                                        aria-pressed={isPlaying}
                                    >
                                        {isPlaying ? <Pause className="w-8 h-8 text-primary fill-current" aria-hidden="true" /> : <Play className="w-8 h-8 text-primary ml-1 fill-current" aria-hidden="true" />}
                                    </button>
                                    <div className="flex-1">
                                        <div 
                                            className="flex justify-between text-base mb-3 font-medium tracking-wide"
                                            style={{ color: themeColors.textColor }}
                                        >
                                            <span className="truncate pr-2">{youtubeTitle}</span>
                                            <span style={{ color: themeColors.accentColor }} className="flex-shrink-0">
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
                                className="text-center mt-24 pt-12 border-t"
                                style={{ borderColor: `${themeColors.textColor}20` }}
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
                        className="absolute inset-0 flex items-center justify-center px-4 text-center z-10"
                    >
                        <p className="text-[#8B5F5F] text-2xl md:text-3xl font-light tracking-wide font-serif">
                            {displayClosing}
                        </p>
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
                        <p className="text-[#8B5F5F] text-2xl md:text-3xl font-light tracking-wide font-serif">
                            Você é importante para alguém.
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
                            <p className="text-lg font-serif italic mb-2"
                               style={{ color: `${themeColors.secondaryTextColor}80` }}>
                                &ldquo;Um pequeno gesto. Um grande sentimento.&rdquo;
                            </p>
                            <p className="font-script text-2xl"
                               style={{ color: themeColors.brandingColor }}>
                                &mdash; Paper Bloom Digital
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleFullView}
                                size="lg"
                                className="rounded-full bg-white text-[#8B5F5F] hover:bg-white/90 px-6 md:px-8 h-14 text-base md:text-lg shadow-lg shadow-[#8B5F5F]/10 min-h-[56px]"
                                aria-label="Ver mensagem completa"
                            >
                                Visualizar mensagem completa
                            </Button>

                            <Button
                                onClick={handleRestart}
                                variant="ghost"
                                className="rounded-full text-[#8B5F5F]/60 hover:text-[#8B5F5F] hover:bg-[#8B5F5F]/10 transition-all duration-300 min-h-[44px]"
                                aria-label="Reiniciar visualização"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                                Ver de novo
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
