"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
// html2canvas no longer needed — we generate a custom canvas for Stories

// ─── Types ───────────────────────────────────────────────────────────────────

type Stage = "intro" | "story" | "photos" | "vote" | "results" | "ready" | "countdown" | "tease" | "countdown2" | "reveal";

// ─── Mock Data (will come from DB after purchase) ────────────────────────────

const DEMO_DATA = {
  gender: "menina" as "menino" | "menina",
  babyName: "Helena",
  boyName: "Caio",
  girlName: "Helena",
  dadName: "Lucas",
  momName: "Camila",
  parentNames: "Lucas & Camila",
  totalVotes: 47,
  boyVotes: 18,
  girlVotes: 29,
  // Customizable colors (user will choose these in the future)
  boyColor: "#5B9BD5",
  girlColor: "#E6A0B8",
  boyColorLight: "#E8F4FD",
  girlColorLight: "#FDE8F0",
  // Story text from the couple (optional)
  storyText: "Oláaa! Se você recebeu esse link, saiba que é uma pessoa muito especial pra gente e vai ser muito importante na vida do baby que está chegando! 🥰\n\nA mamãe e o papai se conheceram em 2018, numa festa de amigos em comum. Foi amor à primeira vista — pelo menos pro papai! 😄\n\nDepois de 5 anos juntos, muitas aventuras e um casamento dos sonhos, eles descobriram que eu estava a caminho!\n\nFoi numa manhã de terça-feira, com um teste de farmácia e muitas lágrimas de alegria. O papai ficou sem palavras por uns 10 minutos (recorde pessoal dele de ficar calado! 😂).\n\nAgora eles estão contando os dias pra me conhecer. E querem que você faça parte desse momento tão especial!",
  // Photos from the couple (optional, up to 5)
  photos: [
    "/demo/revelacao/1.png",
    "/demo/revelacao/2.png",
    "/demo/revelacao/3.png",
    "/demo/revelacao/4.png",
    "/demo/revelacao/5.png",
  ] as string[],
};

// ─── Confetti ────────────────────────────────────────────────────────────────

function Confetti({ gender, boyColor, girlColor }: { gender: "menino" | "menina"; boyColor: string; girlColor: string }) {
  // Generate lighter/darker variants from the base color
  const colors =
    gender === "menino"
      ? [boyColor, `${boyColor}CC`, `${boyColor}99`, `${boyColor}66`, `${boyColor}DD`]
      : [girlColor, `${girlColor}CC`, `${girlColor}99`, `${girlColor}66`, `${girlColor}DD`];

  const pieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 3,
    width: 6 + Math.random() * 10,
    height: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 720 - 360,
    swing: Math.random() * 100 - 50,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, p.swing, -p.swing, 0],
            rotate: [0, p.rotation],
            opacity: [0, 1, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated Progress Bar ───────────────────────────────────────────────────

function VoteBar({
  label,
  percentage,
  color,
  delay,
}: {
  label: string;
  percentage: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {percentage}%
        </span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RevelacaoVirtualDemo() {
  const [stage, setStage] = useState<Stage>("intro");
  const [userVote, setUserVote] = useState<"menino" | "menina" | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // Generate a 1080x1920 Stories image and share via Web Share API (mobile)
  // or download as image (desktop)
  const handleShareStories = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const W = 1080;
      const H = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      if (isBoy) {
        grad.addColorStop(0, "#E8F4FD");
        grad.addColorStop(1, "#C5DFEF");
      } else {
        grad.addColorStop(0, "#FDE8F0");
        grad.addColorStop(1, "#F0C4D6");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Decorative circles (soft)
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = isBoy ? DEMO_DATA.boyColor : DEMO_DATA.girlColor;
      ctx.beginPath(); ctx.arc(180, 300, 200, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(900, 1600, 250, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(850, 400, 120, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Confetti pieces scattered across the image
      const confettiColors = isBoy
        ? [DEMO_DATA.boyColor, "#7BB8E8", "#A8D4F5", "#4A90C4", "#6AAFE0"]
        : [DEMO_DATA.girlColor, "#F0A0C0", "#F5C4D8", "#D4809E", "#E890B0"];
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed * 9301 + 49297) * 49297;
        return x - Math.floor(x);
      };
      for (let i = 0; i < 120; i++) {
        const cx = seededRandom(i * 3) * W;
        const cy = seededRandom(i * 3 + 1) * H;
        const cw = 8 + seededRandom(i * 3 + 2) * 18;
        const ch = 5 + seededRandom(i * 7) * 10;
        const angle = seededRandom(i * 5) * Math.PI * 2;
        const color = confettiColors[i % confettiColors.length];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.globalAlpha = 0.35 + seededRandom(i * 11) * 0.45;
        ctx.fillStyle = color;
        // Mix of rectangles and circles for variety
        if (i % 3 === 0) {
          ctx.beginPath(); ctx.arc(0, 0, cw / 2.5, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Helper: center text
      const centerText = (text: string, y: number, font: string, color: string) => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.fillText(text, W / 2, y);
      };

      // Big emoji
      centerText(isBoy ? "💙" : "💖", 520, "180px serif", "#000");

      // "Acertei!" or "Errei!" based on user vote
      const didGuessRight = userVote === DEMO_DATA.gender;
      const guessText = didGuessRight ? "Acertei! 🎯" : "Não acertei, mas amei! 💕";
      centerText(guessText, 680, "bold 52px sans-serif", isBoy ? "#2C5F8A" : "#8B4563");

      // Divider line
      ctx.strokeStyle = isBoy ? DEMO_DATA.boyColor : DEMO_DATA.girlColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(W / 2 - 150, 730); ctx.lineTo(W / 2 + 150, 730); ctx.stroke();
      ctx.globalAlpha = 1;

      // "Bem-vinda ao mundo"
      const welcomeText = isBoy ? "Bem-vindo ao mundo" : "Bem-vinda ao mundo";
      centerText(welcomeText, 840, "44px sans-serif", "#555");

      // Baby name (large, script-like)
      centerText(DEMO_DATA.babyName, 960, "bold italic 110px serif", isBoy ? DEMO_DATA.boyColor : DEMO_DATA.girlColor);

      // Teddy bear
      centerText("🧸", 1130, "100px serif", "#000");

      // Dad & Mom
      centerText(`Papai ${DEMO_DATA.dadName}`, 1300, "bold 46px sans-serif", isBoy ? "#2C5F8A" : "#8B4563");
      centerText(`Mamãe ${DEMO_DATA.momName}`, 1380, "bold 46px sans-serif", isBoy ? "#2C5F8A" : "#8B4563");

      // Hearts
      centerText("❤️", 1480, "60px serif", "#000");

      // Footer branding (subtle)
      ctx.globalAlpha = 0.3;
      centerText("paperbloom.com.br", 1820, "28px sans-serif", "#555");
      ctx.globalAlpha = 1;

      canvas.toBlob(async (blob) => {
        if (!blob) { setIsSharing(false); return; }

        const file = new File([blob], "revelacao.png", { type: "image/png" });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `${DEMO_DATA.babyName} está chegando!`,
              text: `🎉 É ${isBoy ? "um menino" : "uma menina"}: ${DEMO_DATA.babyName}!`,
            });
          } catch { /* user cancelled */ }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "revelacao.png";
          a.click();
          URL.revokeObjectURL(url);
        }
        setIsSharing(false);
      }, "image/png");
    } catch {
      setIsSharing(false);
    }
  };

  const isBoy = DEMO_DATA.gender === "menino";
  const accentColor = isBoy ? "#5B9BD5" : "#E6A0B8";
  const bgColor = isBoy ? "#E8F4FD" : "#FDE8F0";
  const textColor = isBoy ? "#2C5F8A" : "#8B4563";

  // Compute vote percentages (add user vote to mock data)
  const totalWithUser = DEMO_DATA.totalVotes + (userVote ? 1 : 0);
  const boyVotes =
    DEMO_DATA.boyVotes + (userVote === "menino" ? 1 : 0);
  const girlVotes =
    DEMO_DATA.girlVotes + (userVote === "menina" ? 1 : 0);
  const boyPct = Math.round((boyVotes / totalWithUser) * 100);
  const girlPct = 100 - boyPct;

  // Countdown timer — works for both "countdown" (1st) and "countdown2" (2nd) stages
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (stage !== "countdown" && stage !== "countdown2") return;

    const nextStage = stage === "countdown" ? "tease" : "reveal";

    // Wait 1s before starting the interval so the first number is visible
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setStage(nextStage);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [stage]);

  // Handle vote submission
  const handleVote = (vote: "menino" | "menina") => {
    setUserVote(vote);
    // Small delay before transitioning to results
    setTimeout(() => setStage("results"), 600);
  };

  // Split background style (half boy color, half girl color) with soft blend
  const splitBg = {
    background: `linear-gradient(to right, ${DEMO_DATA.boyColorLight} 35%, ${DEMO_DATA.girlColorLight} 65%)`,
  };

  // Soft text shadow for readability over colored backgrounds
  const textShadow = { textShadow: "0 1px 8px rgba(255,255,255,0.7)" };
  const textShadowSm = { textShadow: "0 1px 6px rgba(255,255,255,0.6)" };

  // ─── Stage 0: Intro ─────────────────────────────────────────────────────────

  const renderIntro = () => (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-8"
      style={splitBg}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 10 }}
        className="text-7xl mb-6"
      >
        🧸
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="font-serif text-3xl md:text-5xl text-center mb-4 leading-tight max-w-lg"
        style={{ color: "#2D2D2D", ...textShadow }}
      >
        Oii, eu sou... ops!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="text-center text-base md:text-lg max-w-md mb-3 leading-relaxed"
        style={{ color: "#444", ...textShadowSm }}
      >
        Quase me entreguei! 🫢 Ainda é segredo, tá? Mas fica comigo que daqui a pouquinho você vai descobrir meu nome e se eu sou menino ou menina!
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="text-center text-sm max-w-sm mb-12 italic"
        style={{ color: "#777", ...textShadowSm }}
      >
        Mas antes, a mamãe e o papai prepararam algo especial pra você...
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4 }}
        className="mb-6"
      >
        <Button
          size="lg"
          onClick={() => setStage("story")}
          className="px-12 bg-primary hover:bg-primary/90"
        >
          Continuar →
        </Button>
      </motion.div>
    </motion.div>
  );

  // ─── Stage 1: Story ─────────────────────────────────────────────────────────

  const renderStory = () => (
    <motion.div
      key="story"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-6 md:px-6 md:py-12"
      style={splitBg}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl max-w-lg w-full flex flex-col"
        style={{ maxHeight: "85dvh" }}
      >
        {/* Fixed header */}
        <div className="p-6 md:p-10 pb-0 md:pb-0 shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 10 }}
            className="text-5xl text-center mb-4"
          >
            💕
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-serif text-2xl md:text-3xl text-center mb-2"
            style={{ color: "#2D2D2D" }}
          >
            Um breve recado da mamãe e do papai
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs mb-4 italic"
            style={{ color: "#999" }}
          >
            com carinho, {DEMO_DATA.parentNames} 💌
          </motion.p>
        </div>

        {/* Scrollable text area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="overflow-y-auto px-6 md:px-10 py-4 space-y-4 flex-1 min-h-0"
        >
          {DEMO_DATA.storyText.split("\n\n").map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.2 }}
              className="text-sm md:text-base leading-relaxed"
              style={{ color: "#444" }}
            >
              {paragraph}
            </motion.p>
          ))}
        </motion.div>

        {/* Fixed button at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="flex justify-center p-6 md:p-8 pt-4 shrink-0"
        >
          <Button
            size="lg"
            onClick={() => {
              if (DEMO_DATA.photos.length > 0) {
                setStage("photos");
              } else {
                setStage("vote");
              }
            }}
            className="px-12 bg-primary hover:bg-primary/90"
          >
            Continuar →
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // ─── Stage 2: Photos ──────────────────────────────────────────────────────

  const photoEffects = [
    { scale: [0.8, 1], rotate: [-5, 0], opacity: [0, 1] },
    { scale: [1.2, 1], rotate: [5, 0], opacity: [0, 1] },
    { x: [-100, 0], opacity: [0, 1] },
    { x: [100, 0], opacity: [0, 1] },
    { y: [80, 0], scale: [0.9, 1], opacity: [0, 1] },
  ];

  // Auto-advance photos every 2.5s
  const photoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showPhotoContinue, setShowPhotoContinue] = useState(false);

  useEffect(() => {
    if (stage !== "photos") {
      setShowPhotoContinue(false);
      return;
    }

    // Show continue button after 3s
    const btnTimeout = setTimeout(() => setShowPhotoContinue(true), 3000);

    // Auto-advance photos
    photoIntervalRef.current = setInterval(() => {
      setCurrentPhoto((prev) => {
        const next = prev + 1;
        if (next >= DEMO_DATA.photos.length) return 0; // loop
        return next;
      });
    }, 2500);

    return () => {
      clearTimeout(btnTimeout);
      if (photoIntervalRef.current) {
        clearInterval(photoIntervalRef.current);
        photoIntervalRef.current = null;
      }
    };
  }, [stage]);

  const renderPhotos = () => (
    <motion.div
      key="photos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center h-[100dvh] px-6 pt-8 overflow-hidden"
      style={{ ...splitBg, paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-xl md:text-2xl text-center mb-1 shrink-0"
        style={{ color: "#2D2D2D", ...textShadow }}
      >
        A mamãe e o papai esperando por mim 🤰
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-center mb-4 shrink-0"
        style={{ color: "#777", ...textShadowSm }}
      >
        {currentPhoto + 1} de {DEMO_DATA.photos.length}
      </motion.p>

      {/* Photo display — fills available space */}
      <div className="relative w-full max-w-sm flex-1 min-h-0 mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto}
            initial={photoEffects[currentPhoto % photoEffects.length]}
            animate={{ scale: 1, rotate: 0, x: 0, y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEMO_DATA.photos[currentPhoto]}
              alt={`Foto ${currentPhoto + 1} do casal`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 rounded-3xl" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="flex gap-2 mb-4 shrink-0">
        {DEMO_DATA.photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPhoto(i)}
            aria-label={`Ver foto ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentPhoto ? "scale-125" : "opacity-40"
            }`}
            style={{
              backgroundColor: i === currentPhoto
                ? (isBoy ? DEMO_DATA.boyColor : DEMO_DATA.girlColor)
                : "#999",
            }}
          />
        ))}
      </div>

      {/* Continue button appears after 3s */}
      <div className="shrink-0 h-12 mb-2">
        <AnimatePresence>
          {showPhotoContinue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Button
                size="lg"
                onClick={() => setStage("vote")}
                className="px-12 bg-primary hover:bg-primary/90"
              >
                Continuar →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // ─── Stage 3: Vote ─────────────────────────────────────────────────────────

  const renderVote = () => (
    <motion.div
      key="vote"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-10"
      style={splitBg}
    >
      {/* Header */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 10 }}
        className="text-6xl mb-4"
      >
        🧸
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-serif text-3xl md:text-5xl text-center mb-3 leading-tight"
        style={{ color: "#2D2D2D", ...textShadow }}
      >
        Você acha que eu sou menino ou menina?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center mb-12 text-sm md:text-base max-w-md"
        style={{ color: "#555", ...textShadowSm }}
      >
        Dê o seu palpite antes de me conhecer!
      </motion.p>

      {/* Vote buttons */}
      <div className="flex gap-8 md:gap-14">
        {/* Menino */}
        <motion.button
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handleVote("menino")}
          aria-label="Votar menino"
          className={`flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
            userVote === "menino"
              ? "shadow-xl scale-105"
              : "border-gray-200 bg-white/80 hover:shadow-lg"
          }`}
          style={
            userVote === "menino"
              ? { borderColor: DEMO_DATA.boyColor, backgroundColor: DEMO_DATA.boyColorLight }
              : {}
          }
        >
          <div
            className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              userVote === "menino" ? "shadow-lg" : ""
            }`}
            style={{
              backgroundColor: userVote === "menino" ? DEMO_DATA.boyColor : DEMO_DATA.boyColorLight,
            }}
          >
            <span className="text-5xl md:text-6xl">
              {userVote === "menino" ? "💙" : "🧸"}
            </span>
          </div>
          <span
            className="font-serif text-xl font-semibold"
            style={{ color: "#2D2D2D" }}
          >
            Menino
          </span>
          <span
            className="text-sm"
            style={{ color: "#666" }}
          >
            {DEMO_DATA.boyName}
          </span>
        </motion.button>

        {/* Menina */}
        <motion.button
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handleVote("menina")}
          aria-label="Votar menina"
          className={`flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
            userVote === "menina"
              ? "shadow-xl scale-105"
              : "border-gray-200 bg-white/80 hover:shadow-lg"
          }`}
          style={
            userVote === "menina"
              ? { borderColor: DEMO_DATA.girlColor, backgroundColor: DEMO_DATA.girlColorLight }
              : {}
          }
        >
          <div
            className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              userVote === "menina" ? "shadow-lg" : ""
            }`}
            style={{
              backgroundColor: userVote === "menina" ? DEMO_DATA.girlColor : DEMO_DATA.girlColorLight,
            }}
          >
            <span className="text-5xl md:text-6xl">
              {userVote === "menina" ? "💖" : "🧸"}
            </span>
          </div>
          <span
            className="font-serif text-xl font-semibold"
            style={{ color: "#2D2D2D" }}
          >
            Menina
          </span>
          <span
            className="text-sm"
            style={{ color: "#666" }}
          >
            {DEMO_DATA.girlName}
          </span>
        </motion.button>
      </div>

      {/* Subtle hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-10 text-xs"
        style={{ color: "#777", ...textShadowSm }}
      >
        {DEMO_DATA.totalVotes} pessoas já tentaram adivinhar 🤭
      </motion.p>
    </motion.div>
  );

  // ─── Stage 2: Results ──────────────────────────────────────────────────────

  const renderResults = () => (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-10"
      style={splitBg}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full"
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-2xl md:text-3xl text-center mb-2"
          style={{ color: "#2D2D2D" }}
        >
          Olha o que estão achando!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm mb-10"
          style={{ color: "#555" }}
        >
          {totalWithUser} pessoas já deram o palpite sobre mim 😊
        </motion.p>

        {/* Vote bars */}
        <div className="space-y-6 mb-10">
          <VoteBar
            label={`💙 Menino - ${DEMO_DATA.boyName}`}
            percentage={boyPct}
            color={DEMO_DATA.boyColor}
            delay={0.6}
          />
          <VoteBar
            label={`💖 Menina - ${DEMO_DATA.girlName}`}
            percentage={girlPct}
            color={DEMO_DATA.girlColor}
            delay={0.9}
          />
        </div>

        {/* User vote indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mb-8 p-4 rounded-2xl bg-gray-50"
        >
          <p className="text-sm" style={{ color: "#444" }}>
            Você acha que eu sou{" "}
            <span
              className="font-bold"
              style={{
                color: userVote === "menino" ? DEMO_DATA.boyColor : DEMO_DATA.girlColor,
              }}
            >
              {userVote === "menino" ? `${DEMO_DATA.boyName} 💙` : `${DEMO_DATA.girlName} 💖`}
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: "#777" }}>
            Será que você acertou? Vamos descobrir! 🤭
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            onClick={() => setStage("ready")}
            className="px-12 bg-primary hover:bg-primary/90"
          >
            Continuar →
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // ─── Stage 3: Ready ────────────────────────────────────────────────────────

  const renderReady = () => (
    <motion.div
      key="ready"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-10"
      style={splitBg}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", damping: 10 }}
        className="text-7xl mb-8"
      >
        🤫
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="font-serif text-3xl md:text-5xl text-center mb-4 leading-tight max-w-lg"
        style={{ color: "#2D2D2D", ...textShadow }}
      >
        Está pronto para me conhecer?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center text-sm md:text-base mb-12 max-w-md"
        style={{ color: "#555", ...textShadowSm }}
      >
        Clique no botão abaixo e descubra quem eu sou!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Button
            size="lg"
            onClick={() => {
              setCountdown(5);
              setStage("countdown");
            }}
            className="px-14 py-5 text-lg bg-primary hover:bg-primary/90 shadow-xl"
          >
            Descobrir! 🎉
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // ─── Stage 4: Countdown ────────────────────────────────────────────────────

  const renderCountdown = () => (
    <motion.div
      key="countdown"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 relative"
      style={splitBg}
    >
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-xl md:text-2xl mb-12 text-center"
        style={{ color: "#2D2D2D", ...textShadow }}
      >
        Estou chegando...
      </motion.p>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center shadow-2xl bg-primary"
        >
          <span className="text-7xl md:text-8xl font-serif font-bold text-white">
            {countdown}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Pulsing ring */}
      <motion.div
        className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border-4 border-primary/20"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="mt-12 text-sm"
        style={{ color: "#777", ...textShadowSm }}
      >
        Falta pouco para me conhecer...
      </motion.p>
    </motion.div>
  );

  // ─── Stage 5: Reveal ───────────────────────────────────────────────────────

  // ─── Stage 4b: Tease (after first countdown) ──────────────────────────────

  const renderTease = () => (
    <motion.div
      key="tease"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-10"
      style={splitBg}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 10 }}
        className="text-7xl mb-6"
      >
        😜
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="font-serif text-3xl md:text-5xl text-center mb-4 leading-tight max-w-lg"
        style={{ color: "#2D2D2D", ...textShadow }}
      >
        Eeeei, para tudo! ✋
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center text-base md:text-lg max-w-md mb-3 leading-relaxed"
        style={{ color: "#444", ...textShadowSm }}
      >
        Eu sei que você tava ansioso, mas esse momento é especial demais pra passar correndo! 😄
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
        className="text-center text-sm max-w-sm mb-12"
        style={{ color: "#555", ...textShadowSm }}
      >
        Junta todo mundo aí, liga o som e bora contar juntos dessa vez! 🔊👨‍👩‍👧‍👦
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6 }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Button
            size="lg"
            onClick={() => {
              setCountdown(5);
              setStage("countdown2");
            }}
            className="px-14 py-5 text-lg bg-primary hover:bg-primary/90 shadow-xl"
          >
            Estou pronto! 🎉
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // ─── Stage 4c: Countdown 2 (real one) ─────────────────────────────────────

  const renderCountdown2 = () => (
    <motion.div
      key="countdown2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 relative"
      style={splitBg}
    >
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-xl md:text-2xl mb-12 text-center"
        style={{ color: "#2D2D2D", ...textShadow }}
      >
        Agora sim, vamos juntos!
      </motion.p>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center shadow-2xl bg-primary"
        >
          <span className="text-7xl md:text-8xl font-serif font-bold text-white">
            {countdown}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Pulsing ring */}
      <motion.div
        className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border-4 border-primary/20"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="mt-12 text-sm"
        style={{ color: "#777", ...textShadowSm }}
      >
        Falta pouco para me conhecer...
      </motion.p>
    </motion.div>
  );

  // ─── Stage 5: Reveal ───────────────────────────────────────────────────────

  const renderReveal = () => (
    <motion.div
      key="reveal"
      ref={revealRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Confetti */}
      <Confetti gender={DEMO_DATA.gender} boyColor={DEMO_DATA.boyColor} girlColor={DEMO_DATA.girlColor} />

      {/* Main content */}
      <div className="relative z-20 text-center">
        {/* Big emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", damping: 8 }}
          className="text-8xl md:text-9xl mb-6"
        >
          {isBoy ? "💙" : "💖"}
        </motion.div>

        {/* Gender text */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-serif text-4xl md:text-6xl font-bold mb-4"
          style={{ color: textColor }}
        >
          Eu sou {isBoy ? "um Menino" : "uma Menina"}!
        </motion.h1>

        {/* Baby name */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.0, type: "spring", damping: 10 }}
          className="mb-6"
        >
          <p
            className="text-sm uppercase tracking-widest mb-2 opacity-60"
            style={{ color: textColor }}
          >
            Meu nome é
          </p>
          <p
            className="font-script text-5xl md:text-7xl"
            style={{ color: accentColor }}
          >
            {DEMO_DATA.babyName}
          </p>
        </motion.div>

        {/* Parents */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-sm opacity-50 mb-10"
          style={{ color: textColor }}
        >
          Estou a caminho! Com amor, {DEMO_DATA.parentNames} ❤️
        </motion.p>

        {/* Vote result */}
        {userVote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-8 max-w-xs mx-auto"
          >
            <p className="text-sm" style={{ color: textColor }}>
              {userVote === DEMO_DATA.gender
                ? "🎯 Você acertou meu nome! Parabéns!"
                : `😄 Quase! Mas eu sou ${DEMO_DATA.babyName}!`}
            </p>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Share to Instagram Stories */}
          <button
            onClick={handleShareStories}
            disabled={isSharing}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold text-sm transition-all duration-300 hover:opacity-90 active:scale-95 shadow-lg disabled:opacity-60"
            style={{
              background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            {isSharing ? "Gerando imagem..." : "Compartilhar nos Stories"}
          </button>

          {/* Leave a message button */}
          <button
            onClick={() => setShowMessageBox(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 hover:opacity-90 active:scale-95 shadow-lg"
            style={{ backgroundColor: accentColor, color: "#fff" }}
          >
            ✉️ Deixe um Recado
          </button>

          {/* Restart demo */}
          <button
            onClick={() => {
              setStage("intro");
              setUserVote(null);
              setCountdown(5);
              setCurrentPhoto(0);
            }}
            className="text-sm underline opacity-40 hover:opacity-70 transition-opacity mt-4"
            style={{ color: textColor }}
          >
            Recomeçar demo
          </button>
        </motion.div>
      </div>

      {/* Message Box Modal */}
      <AnimatePresence>
        {showMessageBox && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMessageBox(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
            />

            {/* Message card centered on screen */}
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-40 flex items-center justify-center px-4"
            >
              <div
                className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className="font-serif text-xl"
                    style={{ color: "#2D2D2D" }}
                  >
                    Deixe um recado para {DEMO_DATA.babyName} e para os Papais
                  </h3>
                  <button
                    onClick={() => setShowMessageBox(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    aria-label="Fechar"
                  >
                    ×
                  </button>
                </div>

                {!messageSent ? (
                  <>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Escreva uma mensagem carinhosa para ${DEMO_DATA.babyName} e ${DEMO_DATA.parentNames}...`}
                      className="w-full h-40 p-4 rounded-xl border-2 border-gray-200 focus:outline-none transition-colors resize-none text-sm"
                      style={{ borderColor: message ? accentColor : undefined }}
                      autoFocus
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => {
                          if (message.trim()) {
                            setMessageSent(true);
                          }
                        }}
                        disabled={!message.trim()}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: accentColor }}
                      >
                        Enviar →
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6"
                  >
                    <div className="text-5xl mb-3">💌</div>
                    <p className="font-serif text-lg" style={{ color: "#2D2D2D" }}>
                      Recado enviado com carinho!
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#777" }}>
                      {DEMO_DATA.babyName} e {DEMO_DATA.parentNames} vão adorar ler ❤️
                    </p>
                    <button
                      onClick={() => setShowMessageBox(false)}
                      className="mt-4 text-sm font-semibold underline"
                      style={{ color: accentColor }}
                    >
                      Fechar
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <AnimatePresence mode="wait">
        {stage === "intro" && renderIntro()}
        {stage === "story" && renderStory()}
        {stage === "photos" && renderPhotos()}
        {stage === "vote" && renderVote()}
        {stage === "results" && renderResults()}
        {stage === "ready" && renderReady()}
        {stage === "countdown" && renderCountdown()}
        {stage === "tease" && renderTease()}
        {stage === "countdown2" && renderCountdown2()}
        {stage === "reveal" && renderReveal()}
      </AnimatePresence>
    </div>
  );
}
