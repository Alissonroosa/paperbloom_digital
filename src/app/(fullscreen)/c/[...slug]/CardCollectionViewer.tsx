'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Lock, LockOpen, Heart, X } from "lucide-react";
import Image from "next/image";
import { FallingEmojis } from "@/components/effects/FallingEmojis";
import type { CardCollection, Card } from "@/types/card";

// YouTube Player Types
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

// Stages of the experience
type Stage =
    | "intro-1"
    | "intro-2"
    | "main-view";

interface CardCollectionViewerProps {
    collection: CardCollection;
    cards: Card[];
    /** Se true, pula a intro cinematográfica (já abriu alguma carta antes). Vem do server. */
    skipIntro?: boolean;
}

import { CardFallbackImage } from '@/components/card-viewer/CardFallbackImage';

// Get moment label based on card order
function getMomentLabel(order: number): string {
    if (order <= 4) return "Para Momentos Difíceis";
    if (order <= 8) return "Para Momentos Felizes";
    return "Para Momentos de Reflexão";
}

// Component to display intro message with "Ver mais" functionality
function IntroMessageDisplay({ message, textColor }: { message: string; textColor: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 150; // Characters before truncating
    
    const shouldTruncate = message.length > MAX_LENGTH;
    const displayText = shouldTruncate && !isExpanded 
        ? message.slice(0, MAX_LENGTH).trim() + '...'
        : message;
    
    return (
        <div className="my-4 px-4 max-w-2xl mx-auto">
            <p 
                className="text-base md:text-lg font-light italic leading-relaxed"
                style={{ color: textColor, opacity: 0.9 }}
            >
                &ldquo;{displayText}&rdquo;
            </p>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-sm font-medium hover:underline transition-all"
                    style={{ color: textColor, opacity: 0.7 }}
                >
                    {isExpanded ? 'Ver menos' : '...Ver mais'}
                </button>
            )}
        </div>
    );
}

export default function CardCollectionViewer({
    collection,
    cards: rawCards,
    skipIntro = false,
}: CardCollectionViewerProps) {
    // Prepare cards data with fallback images and moment labels.
    // Prioridade: foto da carta → coverImageUrl da coleção (foto coringa) → fallback CSS.
    const cards = rawCards.map((card, index) => ({
        ...card,
        imageUrl: card.imageUrl || collection.coverImageUrl || null,
        fallbackVariant: index % 6,
        momentLabel: getMomentLabel(card.order),
        message: card.messageText,
    }));

    const senderName = collection.senderName;
    const _recipientName = collection.recipientName; // Used in debug log
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

    // Pula a intro cinematográfica se o destinatário já abriu alguma carta antes.
    // Decisão vem do server (skipIntro prop, baseada em cards.status do banco) —
    // evita hydration mismatch e ignora limpeza de cookies/localStorage.
    const [stage, setStage] = useState<Stage>(skipIntro ? "main-view" : "intro-1");
    const [openedCards, setOpenedCards] = useState<Set<string>>(new Set());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [youtubeReady, setYoutubeReady] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [cardToOpen, setCardToOpen] = useState<Card | null>(null);
    const [showEnvelopeAnimation, setShowEnvelopeAnimation] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [showSealAnimation, setShowSealAnimation] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // Initialize opened cards from server data (single source of truth).
    // localStorage is only used as an optimistic cache for the post-click animation.
    useEffect(() => {
        const serverOpened = new Set<string>(
            rawCards.filter(c => c.status === 'opened').map(c => c.id)
        );
        setOpenedCards(serverOpened);
        localStorage.setItem(
            `paperbloom-opened-cards-${collection.id}`,
            JSON.stringify(Array.from(serverOpened))
        );
    }, [collection.id, rawCards]);

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onReady: (event: any) => {
                    event.target.setVolume(0);
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // Intro foi encurtada: pula direto pra main-view sem mostrar
            // categorias de cartas (cards-block-1/2/3 foram removidos pra
            // reduzir tempo de espera antes do destinatário ver as cartas).
            timeout = setTimeout(() => {
                setStage("main-view");
                startMusicWithFadeIn();
            }, 5000);
        }

        return () => clearTimeout(timeout);
    }, [stage]);

    const startMusicWithFadeIn = () => {
        if (!playerRef.current || !playerRef.current.playVideo) return;
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
    };

    const handleViewCards = () => {
        setStage("main-view");
        startMusicWithFadeIn();
    };

    const handleOpenCard = (card: Card) => {
        if (openedCards.has(card.id)) {
            // Revisita — abre direto sem confirmação, sem animação.
            // Mensagem foi selada na 1ª abertura; revisitas servem pra rever a lembrança.
            setSelectedCard({
                ...card,
                message: card.messageText,
            });
        } else {
            // Primeira abertura — pede confirmação (ritual de selagem)
            setCardToOpen(card);
            setShowConfirmation(true);
        }
    };

    const handleConfirmOpen = async () => {
        if (!cardToOpen) return;

        // Close confirmation
        setShowConfirmation(false);

        // Show envelope animation
        setShowEnvelopeAnimation(true);

        // Call the API to mark card as opened in the database
        try {
            const response = await fetch(`/api/cards/${cardToOpen.id}/open`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.alreadyOpened) {
                    // Race condition: carta já estava aberta no server mas não no localStorage.
                    // Sincroniza o estado e abre direto em modo revisita (sem animação).
                    const newOpened = new Set(openedCards);
                    newOpened.add(cardToOpen.id);
                    setOpenedCards(newOpened);
                    localStorage.setItem(`paperbloom-opened-cards-${collection.id}`, JSON.stringify(Array.from(newOpened)));
                    setShowEnvelopeAnimation(false);
                    const cardForReopen = cardToOpen;
                    setCardToOpen(null);
                    setSelectedCard({
                        ...cardForReopen,
                        message: cardForReopen.messageText,
                    });
                    return;
                }
                throw new Error('Failed to open card');
            }

            const data = await response.json();

            // After animation, mark as opened and show card with server data
            setTimeout(() => {
                const newOpened = new Set(openedCards);
                newOpened.add(cardToOpen.id);
                setOpenedCards(newOpened);
                
                // Save to localStorage as cache
                localStorage.setItem(`paperbloom-opened-cards-${collection.id}`, JSON.stringify(Array.from(newOpened)));
                
                setShowEnvelopeAnimation(false);
                // Merge API data with the mapped card (which has fallback image and momentLabel)
                setSelectedCard({ ...cardToOpen, ...data.card, imageUrl: data.card?.imageUrl || cardToOpen.imageUrl, message: data.card?.messageText || (cardToOpen as any).message || cardToOpen.messageText });
                setCardToOpen(null);
            }, 2500);
        } catch (error) {
            console.error('Error opening card:', error);
            setShowEnvelopeAnimation(false);
            setCardToOpen(null);
        }
    };

    const handleCancelOpen = () => {
        setShowConfirmation(false);
        setCardToOpen(null);
    };

    const handleCloseCard = () => {
        // Se for revisita (carta já estava aberta antes de abrir agora), fecha direto.
        // Só na PRIMEIRA abertura mostramos a confirmação + animação de selar — esse
        // é o ritual da experiência inicial.
        const isRevisit = selectedCard ? openedCards.has(selectedCard.id) : false;
        if (isRevisit) {
            setSelectedCard(null);
            return;
        }
        setShowCloseConfirm(true);
    };

    const handleConfirmClose = () => {
        setShowCloseConfirm(false);
        setShowSealAnimation(true);

        // After seal animation, close the card
        setTimeout(() => {
            setShowSealAnimation(false);
            setSelectedCard(null);
        }, 2000);
    };

    const handleCancelClose = () => {
        setShowCloseConfirm(false);
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

            {/* Skip to Cards Button (only during intro) */}
            {(stage === "intro-1" || stage === "intro-2") && (
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
                                Cada carta é pra um momento.
                            </motion.p>
                            <motion.p
                                className="text-2xl md:text-3xl font-light leading-relaxed mt-6"
                                style={{ color: themeColors.secondaryTextColor }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                            >
                                Escolha quando viver cada uma ✨
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                        
                        {/* Intro Message from sender */}
                        {collection.introMessage && (
                            <IntroMessageDisplay 
                                message={collection.introMessage} 
                                textColor={themeColors.textColor}
                            />
                        )}
                        
                        <p 
                            className="text-lg md:text-xl font-light"
                            style={{ color: themeColors.secondaryTextColor }}
                        >
                            Cada carta é selada quando você abre pela primeira vez — depois, fica sua pra rever sempre que quiser ✨
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
                                        backgroundColor: isOpened ? 'transparent' : 'white',
                                    }}
                                >
                                    {isOpened ? (
                                        // Carta já aberta — foto com opacidade reduzida + LockOpen centralizado
                                        // + título + "Aberta" embaixo. Mesmo padrão visual da preview cinemática,
                                        // mantém coerência entre as duas experiências.
                                        <>
                                            {card.imageUrl ? (
                                                <Image
                                                    src={card.imageUrl}
                                                    alt={card.title}
                                                    fill
                                                    className="object-cover opacity-70"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 opacity-70">
                                                    <CardFallbackImage variant={card.fallbackVariant} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                                <LockOpen className="w-8 h-8 text-white mb-2" aria-hidden="true" />
                                                <span className="text-sm font-medium text-white line-clamp-2">
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
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl md:max-w-4xl w-full max-h-[92vh] flex flex-col md:flex-row relative"
                        >
                            {/* Close X */}
                            <button
                                onClick={handleCloseCard}
                                className="absolute top-3 right-3 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 transition-all"
                                aria-label="Fechar carta"
                            >
                                <X className="w-4 h-4 text-white/80" />
                            </button>
                            {/* Card Image — proporção 3:4, esquerda no desktop */}
                            <div className="relative w-full md:w-2/5 md:flex-shrink-0 aspect-[3/4] md:aspect-auto md:self-stretch max-h-[55vh] md:max-h-none overflow-hidden bg-gray-100">
                                {selectedCard.imageUrl ? (
                                    <img
                                        src={selectedCard.imageUrl}
                                        alt={selectedCard.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <CardFallbackImage variant={selectedCard.fallbackVariant ?? selectedCard.order ?? 0} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 w-full p-6 md:hidden">
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
                            <div className="p-6 md:p-8 md:flex-1 md:flex md:flex-col md:justify-center overflow-y-auto">
                                <div className="hidden md:block mb-4">
                                    <span
                                        className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                                        style={{
                                            backgroundColor: themeColors.accentColor + '20',
                                            color: themeColors.accentColor,
                                        }}
                                    >
                                        {selectedCard.momentLabel}
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: themeColors.textColor }}>
                                        {selectedCard.title}
                                    </h2>
                                </div>

                                <p className="text-lg md:text-xl leading-relaxed text-gray-800 mb-6">
                                    {selectedCard.message || selectedCard.messageText}
                                </p>

                                {!openedCards.has(selectedCard.id) && (
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
                                        <p className="text-sm text-amber-800 flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Primeira vez que você abre esta carta — ela será selada. Mas pode revisitar sempre que quiser depois 💛
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={handleCloseCard}
                                    className="w-full min-h-[56px] py-4 px-6 rounded-full font-medium text-base text-white transition-opacity hover:opacity-90"
                                    style={{
                                        backgroundColor: themeColors.accentColor,
                                    }}
                                >
                                    Fechar
                                </button>
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
                                    A primeira abertura é o momento da magia ✨ Depois você pode revisitar quantas vezes quiser. Tá pronta(o)?
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleCancelOpen}
                                        className="flex-1 min-h-[56px] py-4 px-6 rounded-full border-2 font-medium text-base transition-colors hover:bg-gray-50"
                                        style={{
                                            borderColor: themeColors.accentColor,
                                            color: themeColors.textColor
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmOpen}
                                        className="flex-1 min-h-[56px] py-4 px-6 rounded-full font-medium text-base text-white transition-opacity hover:opacity-90"
                                        style={{
                                            backgroundColor: themeColors.accentColor,
                                        }}
                                    >
                                        Sim, abrir carta
                                    </button>
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
                                    {cardToOpen.imageUrl ? (
                                        <Image
                                            src={cardToOpen.imageUrl}
                                            alt={cardToOpen.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <CardFallbackImage variant={cardToOpen.order ?? 0} />
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

            {/* CLOSE CONFIRMATION DIALOG */}
            <AnimatePresence>
                {showCloseConfirm && selectedCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                        onClick={handleCancelClose}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8"
                        >
                            <div className="text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                                    className="text-5xl"
                                >
                                    💌
                                </motion.div>

                                <h3 className="text-xl font-semibold" style={{ color: themeColors.textColor }}>
                                    Fechar esta carta?
                                </h3>

                                <p className="text-sm leading-relaxed" style={{ color: themeColors.secondaryTextColor }}>
                                    Ao fechar, esta carta será <strong>selada</strong> — a magia da primeira abertura termina aqui ✨
                                </p>

                                <p className="text-sm italic" style={{ color: themeColors.secondaryTextColor, opacity: 0.8 }}>
                                    Mas pode ficar tranquila(o): você poderá revisitar essa carta sempre que quiser 💛
                                </p>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        onClick={handleCancelClose}
                                        className="w-full min-h-[56px] py-4 px-6 rounded-full border-2 border-gray-300 font-medium text-base text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        Voltar e ler mais uma vez
                                    </button>
                                    <button
                                        onClick={handleConfirmClose}
                                        className="w-full min-h-[56px] py-4 px-6 rounded-full font-medium text-base text-white transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: themeColors.accentColor }}
                                    >
                                        Já li, pode selar 💝
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SEAL ANIMATION */}
            <AnimatePresence>
                {showSealAnimation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4"
                    >
                        <div className="text-center space-y-8">
                            {/* Envelope closing animation */}
                            <motion.div
                                className="relative w-48 h-36 mx-auto"
                            >
                                {/* Envelope body */}
                                <div
                                    className="absolute inset-0 rounded-lg"
                                    style={{ backgroundColor: themeColors.accentColor }}
                                />

                                {/* Envelope flap closing */}
                                <motion.div
                                    className="absolute top-0 left-0 right-0 origin-top"
                                    style={{
                                        height: '50%',
                                        backgroundColor: themeColors.accentColorDark,
                                        clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                                    }}
                                    initial={{ rotateX: -180 }}
                                    animate={{ rotateX: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                                />

                                {/* Wax seal */}
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-10"
                                    style={{ backgroundColor: '#c0392b' }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 1, type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <Heart className="w-7 h-7 text-white" />
                                </motion.div>
                            </motion.div>

                            {/* Text */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="space-y-2"
                            >
                                <p className="text-white text-xl font-light">Carta selada</p>
                                <p className="text-white/60 text-sm">Este momento ficará guardado para sempre ✨</p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
