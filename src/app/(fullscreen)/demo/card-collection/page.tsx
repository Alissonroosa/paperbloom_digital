"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Volume2, VolumeX, Lock, LockOpen, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { FallingEmojis } from "@/components/effects/FallingEmojis";
import { CardFallbackImage } from "@/components/card-viewer/CardFallbackImage";
import { analytics } from "@/lib/analytics";

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
    | "intro-1"           // [Nome] preparou 12 cartas
    | "intro-2"           // Cada carta serve para um momento específico
    | "cards-block-1"     // Bloco 1: Para Momentos Difíceis (cartas 1-4)
    | "cards-block-2"     // Bloco 2: Para Momentos Felizes (cartas 5-8)
    | "cards-block-3"     // Bloco 3: Para Momentos de Reflexão e Especiais (cartas 9-12)
    | "main-view"         // Página final com cartas que podem ser abertas
    | "cta-final";        // CTA para criar sua própria mensagem

// Card data structure
interface CardData {
    id: string;
    order: number;
    title: string;
    message: string;
    imageUrl: string;
    momentLabel: string;
    isOpened: boolean;
}

// Demo data structure
interface DemoData {
    senderName: string;
    recipientName: string;
    cards: CardData[];
    youtubeVideoId: string;
    backgroundColor?: string;
    theme?: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage';
    customEmoji?: string | null;
}

const DEFAULT_DEMO_DATA: DemoData = {
    senderName: "Seu Amor",
    recipientName: "Você",
    cards: [
        {
            id: "1",
            order: 1,
            title: "Quando o dia estiver pesado",
            message: "Meu amor, eu sei que a vida às vezes pesa demais nos seus ombros. Sei que existem dias em que você acorda e o mundo parece cinza, em que tudo parece difícil demais. Mas eu preciso que você saiba de uma coisa: você é a pessoa mais forte que eu conheço. Eu vi você superar coisas que a maioria das pessoas nem conseguiria imaginar. Vi você chorar escondida e mesmo assim levantar no dia seguinte com um sorriso. Essa força que você tem me inspira todos os dias. Então quando a tristeza vier, deixa ela passar por você como uma onda — ela vai embora, eu prometo. E quando ela for embora, eu vou estar aqui, do seu lado, te lembrando de quem você realmente é.",
            imageUrl: "",
            momentLabel: "Para Momentos Difíceis",
            isOpened: false
        },
        {
            id: "2",
            order: 2,
            title: "Quando precisar de coragem pra encarar o mundo",
            message: "Lembra daquela vez que você disse que não ia conseguir? Pois é, você conseguiu. E daquela outra vez? Também. A verdade é que você sempre acha que não vai dar conta, mas no final você sempre dá. Isso não é sorte, é quem você é. Coragem não é não ter medo — é tremer inteira e ir assim mesmo. E você faz isso toda vez. Eu queria que você se visse pelos meus olhos, porque o que eu vejo é uma mulher incrível que enfrenta tudo de peito aberto, mesmo quando o coração está apertado. Então vai lá, enfrenta o que precisar enfrentar. Eu estou aqui torcendo por você, como sempre estive e sempre vou estar.",
            imageUrl: "",
            momentLabel: "Para Momentos Difíceis",
            isOpened: false
        },
        {
            id: "3",
            order: 3,
            title: "Quando a saudade apertar",
            message: "Eu sei que às vezes, mesmo rodeada de gente, você se sente sozinha. Que tem horas que parece que ninguém entende o que você está sentindo, que ninguém enxerga de verdade. Mas eu enxergo. Eu vejo cada detalhe seu — os que você mostra e os que tenta esconder. E eu quero que você saiba que não importa a hora, o dia, a distância: eu estou com você. Pode ser de madrugada, pode ser no meio de uma segunda-feira caótica. Me liga, me manda mensagem, aparece na minha porta. Você nunca vai ser um incômodo pra mim. Você é a pessoa que eu escolhi pra vida, e solidão não combina com a gente.",
            imageUrl: "",
            momentLabel: "Para Momentos Difíceis",
            isOpened: false
        },
        {
            id: "4",
            order: 4,
            title: "Quando conquistar algo grande",
            message: "VOCÊ CONSEGUIU! Eu sabia, eu sempre soube. Enquanto você duvidava, eu já estava aqui comemorando por dentro porque eu conheço você — eu sei do que você é capaz. Cada noite mal dormida, cada momento de dúvida, cada vez que você pensou em desistir e não desistiu... tudo valeu a pena. Essa conquista é sua e de mais ninguém. Você batalhou, você mereceu, você chegou lá. Eu tenho tanto orgulho de você que nem cabe no peito. Celebra isso, viu? Não minimiza, não fala que foi sorte, não muda de assunto. Para, respira, e sente o tamanho do que você fez. Eu te amo e estou explodindo de orgulho.",
            imageUrl: "",
            momentLabel: "Para Momentos Felizes",
            isOpened: false
        },
        {
            id: "5",
            order: 5,
            title: "Quando estiver feliz e quiser dividir",
            message: "Sabe o que é engraçado? Quando você está feliz, o mundo inteiro ao redor parece mais bonito. Seus olhos brilham de um jeito que me faz esquecer de qualquer problema. Seu riso é a minha música favorita — e olha que eu já ouvi muita música boa. Eu vivo pros seus momentos de felicidade. Não porque os tristes não importem, mas porque ver você radiante me lembra do porquê de tudo. Então guarda esse momento. Fecha os olhos e grava essa sensação no coração. Nos dias difíceis, volta aqui e lembra: a felicidade não é um destino, é o caminho. E o nosso caminho juntos é lindo demais.",
            imageUrl: "",
            momentLabel: "Para Momentos Felizes",
            isOpened: false
        },
        {
            id: "6",
            order: 6,
            title: "Quando bater saudade dos nossos momentos",
            message: "Lembra do dia que a gente ficou preso na chuva e em vez de reclamar a gente começou a dançar no meio da rua? Ou daquela vez que você tentou cozinhar aquele prato elaborado e acabou pedindo pizza? Eu rio até hoje. A verdade é que os melhores momentos da minha vida são os mais simples — e todos eles têm você. Seu sorriso tem o poder de transformar o dia mais comum em algo extraordinário. Então se você está precisando sorrir, lembra da gente. Lembra das nossas bobeiras, das nossas piadas sem graça que só a gente entende, dos olhares cúmplices. A gente é isso: dois bobos que se encontraram e fizeram a vida ficar mais leve.",
            imageUrl: "",
            momentLabel: "Para Momentos Felizes",
            isOpened: false
        },
        {
            id: "7",
            order: 7,
            title: "Quando precisar dar uma risada (de nós dois)",
            message: "Ok, prepara que eu vou te fazer rir. Lembra quando eu tentei te impressionar cozinhando e quase coloquei fogo na cozinha? Ou quando eu tropecei na frente de toda a sua família no primeiro almoço de domingo? Sua mãe até hoje me olha diferente por causa daquilo. E aquela vez que eu mandei uma mensagem romântica... pro grupo da família? Eu queria sumir da face da Terra. Mas sabe o que eu mais amo? Que em todos esses momentos vergonhosos, você estava lá rindo comigo (e de mim, vamos ser honestos). Nosso amor é feito de gargalhadas, e eu não trocaria nenhuma delas por nada nesse mundo.",
            imageUrl: "",
            momentLabel: "Para Momentos Felizes",
            isOpened: false
        },
        {
            id: "8",
            order: 8,
            title: "Quando sentir saudade de mim",
            message: "Se você está sentindo saudade, saiba que eu também estou. A saudade é engraçada — ela dói, mas ao mesmo tempo é bonita, porque só sente saudade quem viveu algo que valeu a pena. E a gente viveu tanta coisa bonita juntos. Cada abraço apertado, cada beijo demorado, cada noite conversando até o sono vencer. Eu guardo tudo isso num lugar especial dentro de mim. Às vezes, no meio do dia, uma lembrança sua aparece do nada e eu fico sorrindo sozinho feito bobo. As pessoas devem achar que eu sou maluco. Mas é que pensar em você me faz bem demais. A saudade vai passar, e quando a gente se encontrar de novo, vai ser ainda mais especial.",
            imageUrl: "",
            momentLabel: "Para Momentos de Reflexão",
            isOpened: false
        },
        {
            id: "9",
            order: 9,
            title: "Quando precisar respirar e desacelerar",
            message: "Para tudo. Respira fundo. Inspira pelo nariz... segura... solta pela boca. De novo. Mais uma vez. Pronto, agora me escuta: você não precisa resolver tudo hoje. Não precisa ter todas as respostas agora. Não precisa ser perfeita, não precisa agradar todo mundo, não precisa carregar o mundo nas costas. Você só precisa ser você, no seu tempo, do seu jeito. E isso já é mais que suficiente. Eu sei que sua mente às vezes parece uma tempestade, com mil pensamentos ao mesmo tempo. Mas depois de toda tempestade vem a calmaria. E eu estou aqui pra ser sua calmaria. Descansa o coração, meu bem. Tudo vai ficar bem.",
            imageUrl: "",
            momentLabel: "Para Momentos de Reflexão",
            isOpened: false
        },
        {
            id: "10",
            order: 10,
            title: "Quando quiser me agradecer (sou eu que agradeço)",
            message: "Eu é que deveria estar agradecendo. Agradecer por você existir, por ter cruzado o meu caminho, por ter escolhido ficar. Você transformou a minha vida de um jeito que eu nem sabia que era possível. Antes de você, eu achava que sabia o que era amor. Mas você me mostrou que amor de verdade é muito mais do que eu imaginava. É acordar e a primeira coisa que vem na cabeça é o seu sorriso. É querer ser uma pessoa melhor só porque você merece o melhor. É encontrar paz no meio do caos só porque você está por perto. Então se você quer agradecer por algo, eu te digo: obrigado por me deixar te amar. Esse é o maior presente que eu já recebi.",
            imageUrl: "",
            momentLabel: "Para Momentos de Reflexão",
            isOpened: false
        },
        {
            id: "11",
            order: 11,
            title: "Quando sonhar com o nosso futuro",
            message: "Fecha os olhos e imagina a gente daqui a dez anos. Eu imagino a gente numa casa com um jardim bagunçado, talvez um cachorro (ou três, conhecendo você). Imagino manhãs de domingo preguiçosas, café na cama, risadas ecoando pelos corredores. Imagino a gente viajando pra aqueles lugares que a gente vive falando, envelhecendo juntos e ainda se olhando do mesmo jeito. Eu não sei exatamente como o futuro vai ser — ninguém sabe. Mas eu sei que quero você nele. Em todos os cenários, em todos os planos, em todas as versões do amanhã. Você é o meu futuro favorito. E eu mal posso esperar pra viver tudo isso com você.",
            imageUrl: "",
            momentLabel: "Para Momentos de Reflexão",
            isOpened: false
        },
        {
            id: "12",
            order: 12,
            title: "Quando precisar me sentir perto",
            message: "Se um dia você precisar lembrar de mim, não precisa ir longe. Eu estou em cada música que a gente ouviu juntos, em cada lugar que a gente visitou, em cada piada interna que só a gente entende. Eu estou no seu sorriso quando você lembra de algo engraçado que eu fiz, no seu suspiro quando você sente saudade, no seu coração quando ele bate mais forte. Eu sou seu e você é minha — não de um jeito possessivo, mas de um jeito que transcende tudo. A gente se pertence de alma. E não importa o que aconteça, onde a vida nos leve, uma coisa nunca vai mudar: eu te amo. Te amo de um jeito que eu nem sabia que existia antes de você. Te amo hoje, amanhã e em todas as vidas que vierem depois dessa. Pra sempre, seu amor. ❤️",
            imageUrl: "",
            momentLabel: "Para Momentos de Reflexão",
            isOpened: false
        }
    ],
    youtubeVideoId: "nSDgHBxUbVQ",
    customEmoji: "❤️" // Emoji padrão
};

export default function CardCollectionDemoPage() {
    const [stage, setStage] = useState<Stage>("intro-1");
    const [demoData, setDemoData] = useState<DemoData>(DEFAULT_DEMO_DATA);
    const [openedCards, setOpenedCards] = useState<Set<string>>(new Set());
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [youtubeReady, setYoutubeReady] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [cardToOpen, setCardToOpen] = useState<CardData | null>(null);
    const [showEnvelopeAnimation, setShowEnvelopeAnimation] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [showSealAnimation, setShowSealAnimation] = useState(false);
    const [showAlreadyOpened, setShowAlreadyOpened] = useState(false);
    // Overlay emocional que aparece após o seal da 1ª carta selada na sessão.
    // É a janela de pico emocional pra converter — não reaparece em selagens seguintes.
    const [showPostFirstCardCTA, setShowPostFirstCardCTA] = useState(false);
    const hasShownPostFirstCardCTA = useRef(false);
    // Mostra o tooltip "toque na Carta 1" + ring pulsante na primeira carta.
    // Esconde no momento que o usuário tocar em qualquer carta.
    const [showFirstCardHint, setShowFirstCardHint] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // Demo sempre começa fresca a cada visita.
    // O preview interno (de quem usou /editor/demo pra testar uma collection
    // específica) é mantido apenas durante a sessão atual. Visitas a partir
    // de outras origens (LP, anúncio) vêem a experiência cinematográfica do zero.
    useEffect(() => {
        // Track view com `source` vindo de ?source=... no UTM
        const source = new URLSearchParams(window.location.search).get('source') || 'direct';
        analytics.viewDemo(source);
        analytics.viewProduct('card-collection');

        // 1. Limpa cartas abertas — toda visita revive a emoção do começo.
        localStorage.removeItem('paperbloom-opened-cards');

        // 2. Carrega dados de preview (se foi setado pelo painel interno /editor/demo).
        //    Se não há preview customizado, usa o DEFAULT_DEMO_DATA (cartas demo padrão).
        const saved = localStorage.getItem('paperbloom-card-collection-demo-data');
        if (saved) {
            try {
                setDemoData(JSON.parse(saved));
            } catch {
                setDemoData(DEFAULT_DEMO_DATA);
            }
        } else {
            setDemoData(DEFAULT_DEMO_DATA);
        }
    }, []);

    const { senderName, cards, youtubeVideoId } = demoData;

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

    // Auto-advance intro sequence.
    // Versão comprimida: intro-1 (2.5s) → intro-2 (3s) → main-view (~5.5s total).
    // Antes eram 20s passando por 3 blocos cinematográficos (Difíceis/Felizes/Reflexão)
    // — reduzimos o tempo passivo pra diminuir drop e movemos a educação pro grid
    // (tooltip "toque na Carta 1" + micro-pílulas explicando diferenciais).
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (stage === "intro-1") {
            timeout = setTimeout(() => setStage("intro-2"), 2500);
        } else if (stage === "intro-2") {
            // Auto-avança pra main-view e dispara a música, igual ao handleViewCards.
            timeout = setTimeout(() => handleViewCards(), 3000);
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

    const handleOpenCard = (card: CardData) => {
        // Esconde tooltips/hints assim que o usuário interage com qualquer carta
        setShowFirstCardHint(false);

        if (openedCards.has(card.id)) {
            // Card already opened - show "already opened" message
            setCardToOpen(card);
            setShowAlreadyOpened(true);
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
            
            // Save to localStorage
            localStorage.setItem('paperbloom-opened-cards', JSON.stringify(Array.from(newOpened)));
            
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
        setShowCloseConfirm(true);
    };

    const handleConfirmClose = () => {
        setShowCloseConfirm(false);
        setShowSealAnimation(true);
        const sealedCard = selectedCard;
        setTimeout(() => {
            setShowSealAnimation(false);
            setSelectedCard(null);
            // Pico emocional: usuário acabou de viver a experiência da 1ª carta.
            // Mostra overlay com CTA emocional pro editor.
            if (sealedCard && !hasShownPostFirstCardCTA.current) {
                hasShownPostFirstCardCTA.current = true;
                analytics.demoCardOpened(sealedCard.order);
                // Pequeno delay pra deixar o usuário processar a sensação antes do CTA.
                setTimeout(() => setShowPostFirstCardCTA(true), 600);
            }
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
            // pt-10 reserva espaço para a tarja "Modo demonstração" fixa no topo (~40px)
            className="min-h-screen pt-10 flex flex-col items-center justify-center relative overflow-hidden font-sans transition-all duration-1000"
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
            {demoData.customEmoji && (
                <FallingEmojis emoji={demoData.customEmoji} count={15} />
            )}

            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

            {/* Tarja "Modo demonstração" — sticky no topo durante toda a sessão.
                Separa visualmente o que é meta (esta tarja, pílulas educativas) do
                que é produto real (grid de cartas, animações). Sinaliza pro usuário
                desde o segundo 0 que aquilo é uma demonstração.
                Inclui também o botão de voltar pra LP. */}
            <div
                className="fixed top-0 left-0 right-0 z-[60] px-3 py-2 shadow-sm border-b border-white/50 backdrop-blur-md"
                style={{ backgroundColor: 'rgba(255, 250, 250, 0.92)' }}
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
                    <Link
                        href="/12-cartas"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium hover:bg-white/60 transition-colors"
                        style={{ color: themeColors.secondaryTextColor }}
                        aria-label="Voltar para a página inicial"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Voltar</span>
                    </Link>

                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-center flex-1 justify-center" style={{ color: themeColors.accentColorDark }}>
                        <span aria-hidden="true">👀</span>
                        <span>Modo demonstração</span>
                        <span className="hidden md:inline font-normal opacity-70">— é assim que ele(a) vai ver</span>
                    </div>

                    {/* spacer pra centralizar o título mesmo com botão de voltar à esquerda */}
                    <div className="w-12 sm:w-16" aria-hidden="true" />
                </div>
            </div>

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

            {/* Music Control (only in main view and cta-final) */}
            {(stage === "main-view" || stage === "cta-final") && (
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
                        
                        {/* Demo intro message */}
                        <div className="my-4 px-4 max-w-2xl mx-auto">
                            <p 
                                className="text-base md:text-lg font-light italic leading-relaxed"
                                style={{ color: themeColors.textColor, opacity: 0.9 }}
                            >
                                &ldquo;Preparei essas cartas com muito carinho para você. Cada uma representa um momento especial que quero compartilhar. Abra quando sentir que é o momento certo!&rdquo;
                            </p>
                        </div>
                        
                        <p
                            className="text-lg md:text-xl font-light"
                            style={{ color: themeColors.secondaryTextColor }}
                        >
                            Cada carta só pode ser aberta uma vez. Escolha o momento certo.
                        </p>
                    </motion.div>

                    {/* Bloco educativo — destacado visualmente como meta-camada (não-produto).
                        Tratamento "anotação": label de seção acima, borda tracejada
                        nas pílulas, fundo levemente quente. Comunica pro usuário que
                        isto é uma explicação, não parte do produto. */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mb-6 px-4"
                    >
                        <p
                            className="text-center text-[10px] sm:text-xs font-bold tracking-[0.18em] mb-3 uppercase"
                            style={{ color: themeColors.accentColorDark, opacity: 0.7 }}
                        >
                            <span aria-hidden="true">···  </span>
                            Como funciona
                            <span aria-hidden="true">  ···</span>
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {[
                                { emoji: '🔒', text: 'Cada carta só abre uma vez', delay: 0.6 },
                                { emoji: '🎵', text: 'Com música, foto e mensagem sua', delay: 0.9 },
                                { emoji: '💌', text: 'Você decide quando entregar', delay: 1.2 },
                            ].map((pill, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: pill.delay, type: 'spring', stiffness: 200, damping: 18 }}
                                    // border-dashed + fundo off-white com tint quente = visual de anotação/post-it,
                                    // claramente separado da estética sólida das cartas do produto.
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-dashed text-xs sm:text-sm font-medium"
                                    style={{
                                        color: themeColors.secondaryTextColor,
                                        borderColor: themeColors.accentColor,
                                        backgroundColor: 'rgba(255, 248, 240, 0.7)',
                                    }}
                                >
                                    <span aria-hidden="true">{pill.emoji}</span>
                                    {pill.text}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Call-out apontando pra Carta 1 — instrui a 1ª interação.
                        Esconde assim que o usuário toca em qualquer carta. */}
                    <AnimatePresence>
                        {showFirstCardHint && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: 1.4 }}
                                className="mx-auto mb-6 max-w-md rounded-2xl border-2 border-dashed px-5 py-3 text-center"
                                style={{ borderColor: themeColors.accentColor, backgroundColor: themeColors.accentColor + '15' }}
                            >
                                <motion.div
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="text-xl"
                                    aria-hidden="true"
                                >
                                    👇
                                </motion.div>
                                <p className="text-sm font-semibold" style={{ color: themeColors.accentColorDark }}>
                                    Toque em alguma Carta pra experimentar
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {cards.map((card, index) => {
                            const isOpened = openedCards.has(card.id);
                            const isFirstCardHinted = showFirstCardHint && index === 0 && !isOpened;
                            
                            return (
                                <motion.button
                                    key={card.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={
                                        isFirstCardHinted
                                            ? {
                                                  opacity: 1,
                                                  y: 0,
                                                  boxShadow: [
                                                      `0 0 0 0px ${themeColors.accentColor}80`,
                                                      `0 0 0 12px ${themeColors.accentColor}00`,
                                                      `0 0 0 0px ${themeColors.accentColor}80`,
                                                  ],
                                              }
                                            : { opacity: 1, y: 0 }
                                    }
                                    transition={
                                        isFirstCardHinted
                                            ? {
                                                  opacity: { delay: index * 0.05 },
                                                  y: { delay: index * 0.05 },
                                                  boxShadow: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                                              }
                                            : { delay: index * 0.05 }
                                    }
                                    onClick={() => handleOpenCard(card)}
                                    className={`aspect-[3/4] relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group ${isFirstCardHinted ? 'ring-4' : ''}`}
                                    style={{
                                        backgroundColor: isOpened ? '#f0f0f0' : 'white',
                                        ...(isFirstCardHinted
                                            ? ({ '--tw-ring-color': themeColors.accentColor } as React.CSSProperties)
                                            : {}),
                                    }}
                                >
                                    {isOpened ? (
                                        // Opened card - show fallback or image
                                        <>
                                            {card.imageUrl ? (
                                                <Image
                                                    src={card.imageUrl}
                                                    alt={card.title}
                                                    fill
                                                    className="object-cover opacity-60"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 opacity-60">
                                                    <CardFallbackImage variant={index} />
                                                </div>
                                            )}
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

                    {/* CTA Button — leva direto pro editor (sem tela intermediária cta-final) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-12"
                    >
                        <Link
                            href="/editor/12-cartas?source=demo_main_view"
                            onClick={() => analytics.demoToEditor('main_view_button')}
                        >
                            <button
                                type="button"
                                className="px-12 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl text-white transition-all duration-300"
                                style={{ backgroundColor: '#D4A5A5' }}
                            >
                                💌 Criar minhas 12 cartas
                            </button>
                        </Link>
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
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
                        >
                            {/* Close X - modesto dentro do card */}
                            <button
                                onClick={handleCloseCard}
                                className="absolute top-3 right-3 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 transition-all"
                                aria-label="Fechar carta"
                            >
                                <X className="w-4 h-4 text-white/80" />
                            </button>
                            {/* Card Image */}
                            {selectedCard.imageUrl ? (
                                <div className="relative overflow-hidden">
                                    <img
                                        src={selectedCard.imageUrl}
                                        alt={selectedCard.title}
                                        className="w-full max-h-[50vh] object-cover"
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
                            ) : (
                                <div className="relative h-48 overflow-hidden">
                                    <CardFallbackImage variant={selectedCard.order - 1} label="Sua foto aqui" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
                            )}

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
                                    {cardToOpen.imageUrl ? (
                                        <Image
                                            src={cardToOpen.imageUrl}
                                            alt={cardToOpen.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <CardFallbackImage variant={cardToOpen.order - 1} />
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
                                    Ao fechar, esta carta será <strong>selada para sempre</strong>. Você não poderá abri-la novamente.
                                </p>

                                <p className="text-sm italic" style={{ color: themeColors.secondaryTextColor, opacity: 0.8 }}>
                                    Certifique-se de que leu tudo e sentiu cada palavra deste momento especial.
                                </p>

                                <div className="flex flex-col gap-3 pt-2">
                                    <Button
                                        onClick={handleCancelClose}
                                        variant="outline"
                                        className="w-full py-3 rounded-full"
                                    >
                                        Voltar e ler mais uma vez
                                    </Button>
                                    <Button
                                        onClick={handleConfirmClose}
                                        className="w-full py-3 rounded-full"
                                        style={{ backgroundColor: themeColors.accentColor, color: 'white' }}
                                    >
                                        Já li, pode selar 💝
                                    </Button>
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
                            <motion.div className="relative w-48 h-36 mx-auto">
                                <div
                                    className="absolute inset-0 rounded-lg"
                                    style={{ backgroundColor: themeColors.accentColor }}
                                />
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
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-10"
                                    style={{ backgroundColor: '#c0392b' }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 1, type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <Heart className="w-7 h-7 text-white fill-white" />
                                </motion.div>
                            </motion.div>

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

            {/* ALREADY OPENED MESSAGE */}
            <AnimatePresence>
                {showAlreadyOpened && cardToOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                        onClick={() => { setShowAlreadyOpened(false); setCardToOpen(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
                        >
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="mb-6"
                                >
                                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gray-100">
                                        <LockOpen className="w-10 h-10 text-gray-400" />
                                    </div>
                                </motion.div>

                                <h2 className="text-2xl font-semibold mb-4" style={{ color: themeColors.textColor }}>
                                    Carta já aberta
                                </h2>

                                <p className="text-lg mb-2 font-medium" style={{ color: themeColors.secondaryTextColor }}>
                                    {cardToOpen.title}
                                </p>

                                <p className="text-base mb-8" style={{ color: themeColors.secondaryTextColor }}>
                                    Você já abriu esta carta. Cada carta só pode ser aberta uma única vez para manter a magia do momento especial. ✨
                                </p>

                                <Button
                                    onClick={() => { setShowAlreadyOpened(false); setCardToOpen(null); }}
                                    size="lg"
                                    className="w-full rounded-full"
                                    style={{ backgroundColor: themeColors.accentColor, color: 'white' }}
                                >
                                    Entendi
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OVERLAY EMOCIONAL APÓS A 1ª CARTA SELADA */}
            {/* Janela de pico emocional — usuário acabou de viver a experiência.
                Aparece UMA vez por sessão de demo. CTA primário leva direto pro editor;
                secundário fecha o overlay e o usuário continua explorando. */}
            <AnimatePresence>
                {showPostFirstCardCTA && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(74, 74, 74, 0.7)', backdropFilter: 'blur(8px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, y: 30 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                            className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Decoração superior em gradient */}
                            <div
                                className="h-2"
                                style={{ background: 'linear-gradient(90deg, #E6C2C2, #D4A5A5, #E6C2C2)' }}
                            />

                            <div className="p-7 text-center space-y-5">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.25, type: 'spring', stiffness: 260 }}
                                    className="inline-block text-5xl"
                                    aria-hidden="true"
                                >
                                    💕
                                </motion.div>

                                <div className="space-y-2">
                                    <h2
                                        className="text-2xl md:text-3xl font-light leading-tight"
                                        style={{ color: themeColors.textColor }}
                                    >
                                        Imagine isso com<br />
                                        <span className="font-semibold italic" style={{ color: themeColors.secondaryTextColor }}>
                                            suas palavras
                                        </span>
                                    </h2>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: themeColors.secondaryTextColor }}
                                    >
                                        Você acabou de viver a experiência.<br />
                                        Crie a sua e emocione quem você ama. 💌
                                    </p>
                                </div>

                                <Link
                                    href="/editor/12-cartas?source=demo_post_seal_overlay"
                                    onClick={() => analytics.demoToEditor('post_seal_overlay')}
                                    className="block w-full"
                                >
                                    <button
                                        type="button"
                                        className="w-full min-h-[56px] py-4 px-6 rounded-full font-semibold text-base text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all"
                                        style={{ backgroundColor: '#D4A5A5' }}
                                    >
                                        💌 Criar pro meu amor
                                    </button>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setShowPostFirstCardCTA(false)}
                                    className="text-sm font-medium hover:opacity-70 transition-opacity"
                                    style={{ color: themeColors.secondaryTextColor }}
                                >
                                    Continuar vendo as cartas
                                </button>

                                <p className="text-[11px] text-gray-400 pt-1">
                                    12 cartas · R$ 29,90 · Sem assinatura
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CTA FINAL */}
            {stage === "cta-final" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-4xl mx-auto px-4 py-8 z-10 flex flex-col items-center justify-center min-h-screen"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                            className="mb-8"
                        >
                            <Heart 
                                className="w-24 h-24 mx-auto fill-current"
                                style={{ color: themeColors.accentColor }}
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-4xl md:text-5xl font-light mb-6"
                            style={{ color: themeColors.textColor }}
                        >
                            Gostou da experiência?
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="text-xl md:text-2xl font-light mb-12 max-w-2xl"
                            style={{ color: themeColors.secondaryTextColor }}
                        >
                            Crie uma mensagem igual a essa para alguém especial. 
                            Personalize cada carta com suas próprias palavras, fotos e momentos únicos.
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                href="/editor/12-cartas?source=demo_cta_final"
                                onClick={() => analytics.demoToEditor('cta_final')}
                            >
                                <button
                                    type="button"
                                    className="px-12 py-6 text-lg font-semibold text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                                    style={{ backgroundColor: '#D4A5A5' }}
                                >
                                    💌 Criar minhas 12 cartas
                                </button>
                            </Link>

                            <Button
                                onClick={() => setStage("main-view")}
                                size="lg"
                                variant="outline"
                                className="px-12 py-6 text-lg font-medium rounded-full border-2 transition-all duration-300"
                                style={{
                                    borderColor: themeColors.accentColor,
                                    color: themeColors.textColor
                                }}
                            >
                                Ver Cartas Novamente
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.3 }}
                            className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg"
                        >
                            <h3 
                                className="text-lg font-medium mb-4"
                                style={{ color: themeColors.textColor }}
                            >
                                ✨ O que você pode personalizar:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                <div>
                                    <p 
                                        className="font-medium mb-1"
                                        style={{ color: themeColors.accentColor }}
                                    >
                                        📝 Mensagens
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Escreva suas próprias palavras para cada carta
                                    </p>
                                </div>
                                <div>
                                    <p 
                                        className="font-medium mb-1"
                                        style={{ color: themeColors.accentColor }}
                                    >
                                        📸 Fotos
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Adicione fotos especiais de vocês
                                    </p>
                                </div>
                                <div>
                                    <p 
                                        className="font-medium mb-1"
                                        style={{ color: themeColors.accentColor }}
                                    >
                                        🎵 Música
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Escolha a trilha sonora perfeita
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
