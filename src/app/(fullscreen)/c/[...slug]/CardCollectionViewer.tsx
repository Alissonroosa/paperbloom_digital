'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Volume2, VolumeX, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { FallingEmojis } from "@/components/effects/FallingEmojis";
import type { CardCollection, Card } from "@/types/card";

// YouTube Player Types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

// Stages of the experience
type Stage =
    | "intro-1"
    | "intro-2"
    | "cards-block-1"
    | "cards-block-2"
    | "cards-block-3"
    | "main-view";

interface CardCollectionViewerProps {
    collection: CardCollection;
    cards: Card[];
}

// Fallback images if card doesn't have one
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-1645062cd958?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-1645062cd958?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
];

// Get moment label based on card order
function getMomentLabel(order: number): string {
    if (order <= 4) return "Para Momentos Difíceis";
    if (order <= 8) return "Para Momentos Felizes";
    return "Para Momentos de Reflexão";
}

export default function CardCollectionViewer({
    collection,
    cards: rawCards
}: CardCollectionViewerProps) {
    // Prepare cards data with fallback images and moment labels
    const cards = rawCards.map((card, index) => ({
        ...card,
        imageUrl: card.imageUrl || FALLBACK_IMAGES[index] || FALLBACK_IMAGES[0],
        momentLabel: getMomentLabel(card.order),
        message: card.messageText,
    }));

    const senderName = collection.senderName;
    const recipientName = collection.recipientName;
    const youtubeVideoId = collection.youtubeVideoId || "nSDgHBxUbVQ";
    const customEmoji = "❤️"; // Fixed emoji

    // Debug: Log YouTube Video ID
    useEffect(() => {
        console.log('[CardCollectionViewer] Collection data:', {
            id: collection.id,
            recipientName: collection.recipientName,
            youtubeVideoId: collection.youtubeVideoId,
            youtubeVideoIdUsed: youtubeVideoId,
        });
    }, [collection.id, collection.recipientName, collection.youtubeVideoId, youtubeVideoId]);

    const [stage, setStage] = useState<Stage>("intro-1");
    const [openedCards, setOpenedCards] = useState<Set<string>>(new Set());
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [youtubeReady, setYoutubeReady] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [cardToOpen, setCardToOpen] = useState<Card | null>(null);
    const [showEnvelopeAnimation, setShowEnvelopeAnimation] = useState(false);
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // Load opened cards from localStorage (unique per collection)
    useEffect(() => {
        const savedOpened = localStorage.getItem(`paperbloom-opened-cards-${collection.id}`);
        if (savedOpened) {
            try {
                setOpenedCards(new Set(JSON.parse(savedOpened)));
            } catch (e) {
                console.error('Failed to load opened cards:', e);
            }
        }
    }, [collection.id]);

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            setYoutubeReady(true);
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            setYoutubeReady(true);
        };
    }, []);

    // Initialize YouTube Player
    useEffect(() => {
        if (!youtubeReady || !playerContainerRef.current || playerRef.current) return;

        playerRef.current = new window.YT.Player('youtube-player', {
            videoId: youtubeVideoId,
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
    }, [youtubeReady, youtubeVideoId]);

    // Auto-advance intro sequence
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (stage === "intro-1") {
            timeout = setTimeout(() => setStage("intro-2"), 3000);
        } else if (stage === "intro-2") {
            timeout = setTimeout(() => setStage("cards-block-1"), 5000); // Aumentado de 3s para 5s
        } else if (stage === "cards-block-1") {
            timeout = setTimeout(() => setStage("cards-block-2"), 4000);
        } else if (stage === "cards-block-2") {
            timeout = setTimeout(() => setStage("cards-block-3"), 4000);
        }

        return () => clearTimeout(timeout);
    }, [stage]);

    const handleViewCards = () => {
        setStage("main-view");
        
        // Start music
        if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.setVolume(0);
            playerRef.current.playVideo();
            
            let vol = 0;
            const interval = setInterval(() => {
                if (vol < 50) {
                    vol += 10;
                    if (playerRef.current) playerRef.current.setVolume(vol);
                } else {
                    clearInterval(interval);
                }
            }, 100);
        }
    };

    const handleOpenCard = (card: Card) => {
        if (openedCards.has(card.id)) {
            // Card already opened, just show it
            setSelectedCard(card);
        } else {
            // First time opening - show confirmation popup
            setCardToOpen(card);
            setShowConfirmation(true);
        }
    };

    const handleConfirmOpen = () => {
        if (!cardToOpen) return;

        // Close confirmation
        setShowConfirmation(false);

        // Show envelope animation
        setShowEnvelopeAnimation(true);

        // After animation, mark as opened and show card
        setTimeout(() => {
            const newOpened = new Set(openedCards);
            newOpened.add(cardToOpen.id);
            setOpenedCards(newOpened);
            
            // Save to localStorage (unique per collection)
            localStorage.setItem(`paperbloom-opened-cards-${collection.id}`, JSON.stringify(Array.from(newOpened)));
            
            setShowEnvelopeAnimation(false);
            setSelectedCard(cardToOpen);
            setCardToOpen(null);
        }, 2500); // Duration of envelope animation
    };

    const handleCancelOpen = () => {
        setShowConfirmation(false);
        setCardToOpen(null);
    };

    const handleCloseCard = () => {
        setSelectedCard(null);
    };

    const toggleMusic = () => {
        if (playerRef.current && playerRef.current.getPlayerState) {
            const state = playerRef.current.getPlayerState();
            if (state === 1) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    const themeColors = {
        background: '#FFFAFA',
        backgroundGradient: 'linear-gradient(135deg, #FFFAFA 0%, #FFF5F5 50%, #FFE4E4 100%)',
        textColor: '#4A4A4A',
        secondaryTextColor: '#8B5F5F',
        accentColor: '#E6C2C2',
        accentColorDark: '#D4A5A5',
    };

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
            {/* YouTube Player (Hidden) */}
            <div ref={playerContainerRef} className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
                <div id="youtube-player"></div>
            </div>

            {/* Falling Emojis - Show in all stages */}
            <FallingEmojis emoji={customEmoji} count={15} />

            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

            {/* Skip to Cards Button (only during intro and card blocks) */}
            {(stage === "intro-1" || stage === "intro-2" || stage === "cards-block-1" || stage === "cards-block-2" || stage === "cards-block-3") && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <button
                        onClick={handleViewCards}
                        className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-white/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        style={{ color: themeColors.accentColor }}
                    >
                        <span className="text-sm font-medium">Pular para cartas</span>
                        <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M13 5l7 7-7 7M5 5l7 7-7 7" 
                            />
                        </svg>
                    </button>
                </motion.div>
            )}

            {/* Music Control (only in main view) */}
            {stage === "main-view" && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed top-6 right-6 z-50"
                >
                    <button
                        onClick={toggleMusic}
                        className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl border border-white/50 hover:scale-110 transition-all duration-300"
                        style={{ color: themeColors.accentColor }}
                    >
                        {isPlaying ? (
                            <Volume2 className="w-6 h-6" />
                        ) : (
                            <VolumeX className="w-6 h-6 text-muted-foreground" />
                        )}
                    </button>
                </motion.div>
            )}

            {/* INTRO SEQUENCE */}
            <AnimatePresence mode="wait">
                {/* Intro 1: [Nome] preparou 12 cartas */}
                {stage === "intro-1" && (
                    <motion.div
                        key="intro-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 flex items-center justify-center px-4 text-center z-10"
                    >
                        <div className="max-w-2xl">
                            <motion.p 
                                className="text-3xl md:text-4xl font-light tracking-wide mb-4"
                                style={{ color: themeColors.textColor }}
                            >
                                <span className="font-medium">{senderName}</span> preparou
                            </motion.p>
                            <motion.p 
                                className="text-4xl md:text-5xl font-semibold"
                                style={{ color: themeColors.accentColor }}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                12 cartas
                            </motion.p>
                            <motion.p 
                                className="text-3xl md:text-4xl font-light tracking-wide mt-4"
                                style={{ color: themeColors.textColor }}
                            >
                                para momentos especiais
                            </motion.p>
                        </div>
                    </motion.div>
                )}

                {/* Intro 2: Cada carta serve para um momento específico */}
                {stage === "intro-2" && (
                    <motion.div
                        key="intro-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 flex items-center justify-center px-4 text-center z-10"
                    >
                        <div className="max-w-3xl">
                            <motion.p 
                                className="text-2xl md:text-3xl font-light leading-relaxed"
                                style={{ color: themeColors.textColor }}
                            >
                                Cada carta serve para um momento específico.
                            </motion.p>
                            <motion.p 
                                className="text-2xl md:text-3xl font-light leading-relaxed mt-6"
                                style={{ color: themeColors.secondaryTextColor }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                            >
                                Abra quando estiver precisando...
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CARDS GRID: Mostra os blocos de 4 cartas sequencialmente */}
            {(stage === "cards-block-1" || stage === "cards-block-2" || stage === "cards-block-3") && (
                <motion.div
                    key={stage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-4xl mx-auto px-4 py-8 z-10"
                >
                    {/* Block Title */}
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-12"
                    >
                        <h2 
                            className="text-3xl md:text-4xl font-light mb-4"
                            style={{ color: themeColors.accentColor }}
                        >
                            {stage === "cards-block-1" && "Para Momentos Difíceis"}
                            {stage === "cards-block-2" && "Para Momentos Felizes"}
                            {stage === "cards-block-3" && "Para Momentos de Reflexão"}
                        </h2>
                        <p 
                            className="text-lg md:text-xl font-light"
                            style={{ color: themeColors.secondaryTextColor }}
                        >
                            {stage === "cards-block-1" && "Quando você precisar de força e apoio"}
                            {stage === "cards-block-2" && "Quando você quiser celebrar e sorrir"}
                            {stage === "cards-block-3" && "Quando você precisar de paz e amor"}
                        </p>
                    </motion.div>

                    {/* Cards Grid - 4 cards per block */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {cards
                            .slice(
                                stage === "cards-block-1" ? 0 : stage === "cards-block-2" ? 4 : 8,
                                stage === "cards-block-1" ? 4 : stage === "cards-block-2" ? 8 : 12
                            )
                            .map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.15 }}
                                    className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-lg bg-white/90 backdrop-blur-sm border-2 border-white/50"
                                >
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                        <div 
                                            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                                            style={{ backgroundColor: themeColors.accentColor + '20' }}
                                        >
                                            <span 
                                                className="text-xl font-semibold"
                                                style={{ color: themeColors.accentColor }}
                                            >
                                                {card.order}
                                            </span>
                                        </div>
                                        <h3 
                                            className="text-sm md:text-base font-medium leading-tight"
                                            style={{ color: themeColors.textColor }}
                                        >
                                            {card.title}
                                        </h3>
                                    </div>
                                </motion.div>
                            ))}
                    </div>

                    {/* Show button only on last block */}
                    {stage === "cards-block-3" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5 }}
                            className="text-center"
                        >
                            <Button
                                onClick={handleViewCards}
                                size="lg"
                                className="px-12 py-6 text-lg font-medium rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                                style={{
                                    backgroundColor: themeColors.accentColor,
                                    color: 'white'
                                }}
                            >
                                Ver Cartas
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* MAIN VIEW: Página final com cartas que podem ser abertas */}
            {stage === "main-view" && !selectedCard && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-6xl mx-auto px-4 py-8 z-10"
                >
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-8"
                    >
                        <h1 
                            className="text-3xl md:text-4xl font-light mb-2"
                            style={{ color: themeColors.textColor }}
                        >
                            Suas 12 Cartas Especiais
                        </h1>
                        <p 
                            className="text-lg md:text-xl font-light"
                            style={{ color: themeColors.secondaryTextColor }}
                        >
                            Cada carta só pode ser aberta uma vez. Escolha o momento certo.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {cards.map((card, index) => {
                            const isOpened = openedCards.has(card.id);
                            
                            return (
                                <motion.button
                                    key={card.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleOpenCard(card)}
                                    className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                                    style={{
                                        backgroundColor: isOpened ? '#f0f0f0' : 'white',
                                    }}
                                >
                                    {isOpened ? (
                                        // Opened card - show image preview
                                        <>
                                            <Image
                                                src={card.imageUrl}
                                                alt={card.title}
                                                fill
                                                className="object-cover opacity-60"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                                <LockOpen className="w-8 h-8 text-white mb-2" />
                                                <span className="text-sm font-medium text-white">
                                                    {card.title}
                                                </span>
                                                <span className="text-xs text-white/80 mt-1">
                                                    Aberta
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        // Unopened card - show locked state
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-white to-gray-50 group-hover:from-gray-50 group-hover:to-white transition-all">
                                            <div 
                                                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                                                style={{ backgroundColor: themeColors.accentColor + '20' }}
                                            >
                                                <Lock 
                                                    className="w-6 h-6"
                                                    style={{ color: themeColors.accentColor }}
                                                />
                                            </div>
                                            <span 
                                                className="text-xs font-medium mb-2"
                                                style={{ color: themeColors.accentColor }}
                                            >
                                                Carta {card.order}
                                            </span>
                                            <h3 
                                                className="text-sm md:text-base font-medium leading-tight"
                                                style={{ color: themeColors.textColor }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Footer with branding */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-12"
                    >
                        <p 
                            className="text-sm font-light"
                            style={{ color: themeColors.secondaryTextColor }}
                        >
                            Feito com ❤️ por {senderName}
                        </p>
                    </motion.div>
                </motion.div>
            )}

            {/* CARD DETAIL VIEW */}
            <AnimatePresence>
                {selectedCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={handleCloseCard}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Card Image */}
                            <div className="relative h-64 md:h-80">
                                <Image
                                    src={selectedCard.imageUrl}
                                    alt={selectedCard.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 w-full p-6">
                                    <span 
                                        className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                                        style={{ 
                                            backgroundColor: themeColors.accentColor + '20',
                                            color: themeColors.accentColor 
                                        }}
                                    >
                                        {selectedCard.momentLabel}
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-semibold text-white">
                                        {selectedCard.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Card Message */}
                            <div className="p-8">
                                <p className="text-xl md:text-2xl leading-relaxed text-gray-800 mb-6">
                                    {selectedCard.message}
                                </p>

                                {!openedCards.has(selectedCard.id) && (
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
                                        <p className="text-sm text-amber-800 flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Esta é a primeira vez que você abre esta carta. Ela ficará marcada como aberta.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleCloseCard}
                                    className="w-full"
                                    size="lg"
                                    style={{
                                        backgroundColor: themeColors.accentColor,
                                        color: 'white'
                                    }}
                                >
                                    Fechar
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CONFIRMATION POPUP */}
            <AnimatePresence>
                {showConfirmation && cardToOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={handleCancelOpen}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full p-8"
                        >
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="mb-6"
                                >
                                    <div 
                                        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: themeColors.accentColor + '20' }}
                                    >
                                        <Lock 
                                            className="w-10 h-10"
                                            style={{ color: themeColors.accentColor }}
                                        />
                                    </div>
                                </motion.div>

                                <h2 
                                    className="text-2xl md:text-3xl font-semibold mb-4"
                                    style={{ color: themeColors.textColor }}
                                >
                                    Abrir esta carta?
                                </h2>

                                <p 
                                    className="text-lg mb-2"
                                    style={{ color: themeColors.secondaryTextColor }}
                                >
                                    <span className="font-medium">{cardToOpen.title}</span>
                                </p>

                                <p 
                                    className="text-base mb-8"
                                    style={{ color: themeColors.secondaryTextColor }}
                                >
                                    Esta carta só pode ser aberta uma vez. Tem certeza que este é o momento certo?
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={handleCancelOpen}
                                        variant="outline"
                                        size="lg"
                                        className="flex-1 rounded-full border-2"
                                        style={{
                                            borderColor: themeColors.accentColor,
                                            color: themeColors.textColor
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleConfirmOpen}
                                        size="lg"
                                        className="flex-1 rounded-full"
                                        style={{
                                            backgroundColor: themeColors.accentColor,
                                            color: 'white'
                                        }}
                                    >
                                        Sim, abrir carta
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ENVELOPE ANIMATION */}
            <AnimatePresence>
                {showEnvelopeAnimation && cardToOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md aspect-[4/3]">
                            {/* Envelope Body */}
                            <motion.div
                                className="absolute inset-0 rounded-lg overflow-hidden"
                                style={{
                                    backgroundColor: themeColors.accentColor,
                                }}
                            >
                                {/* Envelope flap shadow */}
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-black/10" />
                            </motion.div>

                            {/* Envelope Flap (opens) */}
                            <motion.div
                                className="absolute top-0 left-0 right-0 origin-top"
                                style={{
                                    height: '50%',
                                    backgroundColor: themeColors.accentColorDark,
                                    clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                                }}
                                animate={{
                                    rotateX: [0, -180],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: 0.5,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Card inside envelope (slides up) */}
                            <motion.div
                                className="absolute inset-x-8 bottom-8 bg-white rounded-lg shadow-2xl overflow-hidden"
                                initial={{ y: 0 }}
                                animate={{ y: -120 }}
                                transition={{
                                    duration: 1,
                                    delay: 1.5,
                                    ease: "easeOut"
                                }}
                            >
                                <div className="relative h-full">
                                    {cardToOpen.imageUrl && (
                                        <Image
                                            src={cardToOpen.imageUrl}
                                            alt={cardToOpen.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <p className="text-white text-sm font-medium">
                                            {cardToOpen.title}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Sparkle effects */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, delay: 1.5 }}
                            >
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 bg-white rounded-full"
                                        style={{
                                            left: `${20 + Math.random() * 60}%`,
                                            top: `${20 + Math.random() * 60}%`,
                                        }}
                                        animate={{
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 1.5 + i * 0.1,
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
}
