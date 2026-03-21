"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useParams } from "next/navigation";
import { analytics } from "@/lib/analytics";

type Stage = "intro" | "story" | "photos" | "vote" | "results" | "ready" | "countdown" | "tease" | "countdown2" | "reveal";

interface RevealData {
  id: string;
  boyName: string;
  girlName: string;
  actualGender: "menino" | "menina";
  dadName: string;
  momName: string;
  storyMessage: string | null;
  photos: string[];
  boyColor: string;
  girlColor: string;
}

interface Stats { totalVotes: number; boyVotes: number; girlVotes: number; }

function Confetti({ gender, boyColor, girlColor }: { gender: "menino" | "menina"; boyColor: string; girlColor: string }) {
  const colors = gender === "menino" ? [boyColor, `${boyColor}CC`, `${boyColor}99`, `${boyColor}66`] : [girlColor, `${girlColor}CC`, `${girlColor}99`, `${girlColor}66`];
  const pieces = Array.from({ length: 80 }, (_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 2, duration: 2.5 + Math.random() * 3, width: 6 + Math.random() * 10, height: 4 + Math.random() * 6, color: colors[Math.floor(Math.random() * colors.length)], rotation: Math.random() * 720 - 360, swing: Math.random() * 100 - 50 }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((p) => (<motion.div key={p.id} className="absolute rounded-sm" style={{ left: `${p.left}%`, top: "-20px", width: p.width, height: p.height, backgroundColor: p.color }} animate={{ y: ["0vh", "110vh"], x: [0, p.swing, -p.swing, 0], rotate: [0, p.rotation], opacity: [0, 1, 1, 0.3] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }} />))}
    </div>
  );
}

function VoteBar({ label, percentage, color, delay }: { label: string; percentage: number; color: string; delay: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2"><span className="text-sm font-semibold text-gray-800">{label}</span><span className="text-sm font-bold" style={{ color }}>{percentage}%</span></div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.2, delay, ease: "easeOut" }} /></div>
    </div>
  );
}

export default function RevelacaoVirtualPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [reveal, setReveal] = useState<RevealData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [userVote, setUserVote] = useState<"menino" | "menina" | null>(null);
  const [voterName, setVoterName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [pendingVote, setPendingVote] = useState<"menino" | "menina" | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showPhotoContinue, setShowPhotoContinue] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/gender-reveal/by-slug/${slug}`);
        if (!response.ok) throw new Error("Revelação não encontrada");
        const data = await response.json();
        setReveal(data.reveal);
        setStats(data.stats);
      } catch (e) { setError(e instanceof Error ? e.message : "Erro ao carregar"); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [slug]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (stage !== "countdown" && stage !== "countdown2") return;
    const nextStage = stage === "countdown" ? "tease" : "reveal";
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } setStage(nextStage); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [stage]);

  const photoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (stage !== "photos" || !reveal?.photos.length) { setShowPhotoContinue(false); return; }
    const btnTimeout = setTimeout(() => setShowPhotoContinue(true), 3000);
    photoIntervalRef.current = setInterval(() => { setCurrentPhoto((prev) => (prev + 1) % (reveal?.photos.length || 1)); }, 2500);
    return () => { clearTimeout(btnTimeout); if (photoIntervalRef.current) clearInterval(photoIntervalRef.current); };
  }, [stage, reveal?.photos.length]);

  const handleVoteClick = (vote: "menino" | "menina") => { setPendingVote(vote); setShowNameInput(true); };
  const submitVote = async () => {
    if (!voterName.trim() || !pendingVote || !reveal || isVoting) return;
    setIsVoting(true);
    try {
      await fetch(`/api/gender-reveal/${reveal.id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voterName, vote: pendingVote }) });
      setUserVote(pendingVote); setShowNameInput(false);
      // Track: Voto na revelação
      analytics.castVote(reveal.id, pendingVote);
      if (stats) setStats({ ...stats, totalVotes: stats.totalVotes + 1, boyVotes: stats.boyVotes + (pendingVote === "menino" ? 1 : 0), girlVotes: stats.girlVotes + (pendingVote === "menina" ? 1 : 0) });
      setVoteSuccess(true);
      setTimeout(() => { setVoteSuccess(false); setStage("results"); }, 1500);
    } catch (e) { console.error(e); }
    finally { setIsVoting(false); }
  };
  const submitMessage = async () => {
    if (!message.trim() || !reveal) return;
    try { await fetch(`/api/gender-reveal/${reveal.id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voterName: voterName || "Anônimo", vote: userVote || "menino", message }) }); setMessageSent(true); } catch (e) { console.error(e); }
  };

  const handleShareStories = async () => {
    if (isSharing || !reveal) return;
    setIsSharing(true);
    try {
      const W = 1080, H = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      const isBoyLocal = reveal.actualGender === "menino";
      const babyNameLocal = isBoyLocal ? reveal.boyName : reveal.girlName;
      const colorLocal = isBoyLocal ? reveal.boyColor : reveal.girlColor;
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, isBoyLocal ? "#E8F4FD" : "#FDE8F0");
      grad.addColorStop(1, isBoyLocal ? "#C5DFEF" : "#F0C4D6");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      // Decorative circles
      ctx.globalAlpha = 0.12; ctx.fillStyle = colorLocal;
      ctx.beginPath(); ctx.arc(180, 300, 200, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(900, 1600, 250, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(850, 400, 120, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      // Confetti
      const confettiColors = isBoyLocal ? [colorLocal, "#7BB8E8", "#A8D4F5", "#4A90C4"] : [colorLocal, "#F0A0C0", "#F5C4D8", "#D4809E"];
      const seededRandom = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 49297; return x - Math.floor(x); };
      for (let i = 0; i < 120; i++) {
        const cx = seededRandom(i * 3) * W, cy = seededRandom(i * 3 + 1) * H;
        const cw = 8 + seededRandom(i * 3 + 2) * 18, ch = 5 + seededRandom(i * 7) * 10;
        const angle = seededRandom(i * 5) * Math.PI * 2;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
        ctx.globalAlpha = 0.35 + seededRandom(i * 11) * 0.45;
        ctx.fillStyle = confettiColors[i % confettiColors.length];
        if (i % 3 === 0) { ctx.beginPath(); ctx.arc(0, 0, cw / 2.5, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillRect(-cw / 2, -ch / 2, cw, ch); }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      // Helper
      const centerText = (text: string, y: number, font: string, color: string) => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.fillText(text, W / 2, y); };
      // Content
      centerText(isBoyLocal ? "💙" : "💖", 520, "180px serif", "#000");
      const didGuessRight = userVote === reveal.actualGender;
      centerText(didGuessRight ? "Acertei! 🎯" : "Não acertei, mas amei! 💕", 680, "bold 52px sans-serif", isBoyLocal ? "#2C5F8A" : "#8B4563");
      ctx.strokeStyle = colorLocal; ctx.lineWidth = 3; ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(W / 2 - 150, 730); ctx.lineTo(W / 2 + 150, 730); ctx.stroke(); ctx.globalAlpha = 1;
      centerText(isBoyLocal ? "Bem-vindo ao mundo" : "Bem-vinda ao mundo", 840, "44px sans-serif", "#555");
      centerText(babyNameLocal, 960, "bold italic 110px serif", colorLocal);
      centerText("🧸", 1130, "100px serif", "#000");
      centerText(`Papai ${reveal.dadName}`, 1300, "bold 46px sans-serif", isBoyLocal ? "#2C5F8A" : "#8B4563");
      centerText(`Mamãe ${reveal.momName}`, 1380, "bold 46px sans-serif", isBoyLocal ? "#2C5F8A" : "#8B4563");
      centerText("❤️", 1480, "60px serif", "#000");
      ctx.globalAlpha = 0.3; centerText("paperbloom.com.br", 1820, "28px sans-serif", "#555"); ctx.globalAlpha = 1;
      canvas.toBlob(async (blob) => {
        if (!blob) { setIsSharing(false); return; }
        const file = new File([blob], "revelacao.png", { type: "image/png" });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ files: [file], title: `${babyNameLocal} está chegando!`, text: `🎉 É ${isBoyLocal ? "um menino" : "uma menina"}: ${babyNameLocal}!` }); } catch { /* cancelled */ }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "revelacao.png"; a.click();
          URL.revokeObjectURL(url);
        }
        setIsSharing(false);
      }, "image/png");
    } catch { setIsSharing(false); }
  };

  if (loading) return <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50"><div className="text-center"><div className="text-6xl mb-4">🧸</div><p className="text-gray-600">Carregando revelação...</p></div></div>;
  if (error || !reveal) return <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50"><div className="text-center"><div className="text-6xl mb-4">😢</div><p className="text-gray-600">{error || "Revelação não encontrada"}</p></div></div>;

  const isBoy = reveal.actualGender === "menino";
  const babyName = isBoy ? reveal.boyName : reveal.girlName;
  const accentColor = isBoy ? reveal.boyColor : reveal.girlColor;
  const bgColor = isBoy ? `${reveal.boyColor}15` : `${reveal.girlColor}15`;
  const textColor = isBoy ? "#2C5F8A" : "#8B4563";
  const totalVotes = stats ? stats.totalVotes + (userVote ? 1 : 0) : 0;
  const boyPct = totalVotes > 0 ? Math.round(((stats?.boyVotes || 0) + (userVote === "menino" ? 1 : 0)) / totalVotes * 100) : 50;
  const girlPct = 100 - boyPct;
  const splitBg = { background: `linear-gradient(to right, ${reveal.boyColor}20 35%, ${reveal.girlColor}20 65%)` };


  const renderIntro = () => (
    <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-8" style={splitBg}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", damping: 10 }} className="text-7xl mb-6">🧸</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="font-serif text-3xl md:text-5xl text-center mb-4 leading-tight max-w-lg text-gray-800">Oii, eu sou... ops!</motion.h1>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="text-center text-base md:text-lg max-w-md mb-3 leading-relaxed text-gray-600">Quase me entreguei! 🫢 Ainda é segredo, tá? Mas fica comigo que daqui a pouquinho você vai descobrir meu nome e se eu sou menino ou menina!</motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="text-center text-sm max-w-sm mb-12 italic text-gray-500">Mas antes, {reveal.dadName} e {reveal.momName} prepararam algo especial pra você...</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 }} className="mb-6">
        <Button size="lg" onClick={() => setStage(reveal.storyMessage ? "story" : reveal.photos.length ? "photos" : "vote")} className="px-12 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white">Continuar →</Button>
      </motion.div>
    </motion.div>
  );

  const renderStory = () => {
    if (!reveal.storyMessage) return null;
    return (
      <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-6" style={splitBg}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl max-w-lg w-full flex flex-col" style={{ maxHeight: "85dvh" }}>
          <div className="p-6 md:p-10 pb-0 shrink-0">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", damping: 10 }} className="text-5xl text-center mb-4">💕</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-serif text-2xl md:text-3xl text-center mb-2 text-gray-800">Um breve recado da mamãe e do papai</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs mb-4 italic text-gray-400">com carinho, {reveal.dadName} & {reveal.momName} 💌</motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="overflow-y-auto px-6 md:px-10 py-4 space-y-4 flex-1 min-h-0">
            {reveal.storyMessage.split("\n\n").map((p, i) => (<motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.2 }} className="text-sm md:text-base leading-relaxed text-gray-600">{p}</motion.p>))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="flex justify-center p-6 md:p-8 pt-4 shrink-0">
            <Button size="lg" onClick={() => setStage(reveal.photos.length ? "photos" : "vote")} className="px-12 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white">Continuar →</Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  const renderPhotos = () => {
    if (!reveal.photos.length) return null;
    return (
      <motion.div key="photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }} className="flex flex-col items-center h-[100dvh] px-6 pt-8 overflow-hidden" style={{ ...splitBg, paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-serif text-xl md:text-2xl text-center mb-1 shrink-0 text-gray-800">A mamãe e o papai esperando por mim 🤰</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs text-center mb-4 shrink-0 text-gray-500">{currentPhoto + 1} de {reveal.photos.length}</motion.p>
        <div className="relative w-full max-w-sm flex-1 min-h-0 mb-4">
          <AnimatePresence mode="wait">
            <motion.div key={currentPhoto} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.6, ease: "easeOut" }} className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
              <img src={reveal.photos[currentPhoto]} alt={`Foto ${currentPhoto + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 rounded-3xl" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex gap-2 mb-4 shrink-0">{reveal.photos.map((_, i) => (<button key={i} onClick={() => setCurrentPhoto(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentPhoto ? "scale-125" : "opacity-40"}`} style={{ backgroundColor: i === currentPhoto ? (isBoy ? reveal.boyColor : reveal.girlColor) : "#999" }} />))}</div>
        <div className="shrink-0 h-12 mb-2"><AnimatePresence>{showPhotoContinue && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Button size="lg" onClick={() => setStage("vote")} className="px-12 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white">Continuar →</Button></motion.div>)}</AnimatePresence></div>
      </motion.div>
    );
  };


  const renderVote = () => (
    <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-10" style={splitBg}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", damping: 10 }} className="text-6xl mb-4">🧸</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-serif text-3xl md:text-5xl text-center mb-3 leading-tight text-gray-800">Você acha que eu sou menino ou menina?</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center mb-12 text-sm md:text-base max-w-md text-gray-600">Dê o seu palpite antes de me conhecer!</motion.p>
      {voteSuccess ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }} className="text-5xl mb-4">✅</motion.div>
          <p className="text-lg font-semibold text-gray-800">Voto computado!</p>
          <p className="text-sm text-gray-500 mt-2">Obrigado por participar 💕</p>
        </motion.div>
      ) : showNameInput ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
          <p className="text-center text-gray-700 mb-4">Qual o seu nome para registrar seu voto?</p>
          <input type="text" value={voterName} onChange={(e) => setVoterName(e.target.value)} placeholder="Seu nome" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none mb-4" autoFocus disabled={isVoting} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowNameInput(false)} className="flex-1" disabled={isVoting}>Cancelar</Button>
            <Button onClick={submitVote} disabled={!voterName.trim() || isVoting} className="flex-1 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white">
              {isVoting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Enviando...
                </span>
              ) : "Confirmar"}
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="flex gap-8 md:gap-14">
          <motion.button initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, type: "spring" }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => handleVoteClick("menino")} className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl border-2 border-gray-200 bg-white/80 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center" style={{ backgroundColor: `${reveal.boyColor}30` }}><span className="text-5xl md:text-6xl">🧸</span></div>
            <span className="font-serif text-xl font-semibold text-gray-800">Menino</span>
            <span className="text-sm text-gray-600">{reveal.boyName}</span>
          </motion.button>
          <motion.button initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, type: "spring" }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => handleVoteClick("menina")} className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl border-2 border-gray-200 bg-white/80 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center" style={{ backgroundColor: `${reveal.girlColor}30` }}><span className="text-5xl md:text-6xl">🧸</span></div>
            <span className="font-serif text-xl font-semibold text-gray-800">Menina</span>
            <span className="text-sm text-gray-600">{reveal.girlName}</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  const renderResults = () => (
    <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-10" style={splitBg}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full">
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-serif text-2xl md:text-3xl text-center mb-2 text-gray-800">Olha o que estão achando!</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-sm mb-10 text-gray-600">{totalVotes} pessoas já deram o palpite sobre mim 😊</motion.p>
        <div className="space-y-6 mb-10">
          <VoteBar label={`💙 Menino - ${reveal.boyName}`} percentage={boyPct} color={reveal.boyColor} delay={0.6} />
          <VoteBar label={`💖 Menina - ${reveal.girlName}`} percentage={girlPct} color={reveal.girlColor} delay={0.9} />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-center mb-8 p-4 rounded-2xl bg-gray-50">
          <p className="text-sm text-gray-600">Você acha que eu sou <span className="font-bold" style={{ color: userVote === "menino" ? reveal.boyColor : reveal.girlColor }}>{userVote === "menino" ? `${reveal.boyName} 💙` : `${reveal.girlName} 💖`}</span></p>
          <p className="text-xs mt-1 text-gray-500">Será que você acertou? Vamos descobrir! 🤭</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="flex justify-center"><Button size="lg" onClick={() => setStage("ready")} className="px-12 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white">Continuar →</Button></motion.div>
      </motion.div>
    </motion.div>
  );

  const renderReady = () => (
    <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-10" style={splitBg}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", damping: 10 }} className="text-7xl mb-8">🤫</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="font-serif text-3xl md:text-5xl text-center mb-4 leading-tight max-w-lg text-gray-800">Está pronto para me conhecer?</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-center text-sm md:text-base mb-12 max-w-md text-gray-600">Clique no botão abaixo e descubra quem eu sou!</motion.p>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}><motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><Button size="lg" onClick={() => { setCountdown(5); setStage("countdown"); }} className="px-14 py-5 text-lg bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white shadow-xl">Descobrir! 🎉</Button></motion.div></motion.div>
    </motion.div>
  );

  const renderCountdown = () => (
    <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-6 relative" style={splitBg}>
      <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-xl md:text-2xl mb-12 text-center text-gray-800">Estou chegando...</motion.p>
      <AnimatePresence mode="popLayout">
        <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.3 }} className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-blue-500 to-pink-500">
          <span className="text-7xl md:text-8xl font-serif font-bold text-white">{countdown}</span>
        </motion.div>
      </AnimatePresence>
      <motion.div className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border-4 border-pink-300/30" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1 }} className="mt-12 text-sm text-gray-500">Falta pouco para me conhecer...</motion.p>
    </motion.div>
  );

  const renderTease = () => (
    <motion.div key="tease" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-10" style={splitBg}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", damping: 10 }} className="text-7xl mb-6">😜</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="font-serif text-3xl md:text-5xl text-center mb-4 leading-tight max-w-lg text-gray-800">Eeeei, para tudo! ✋</motion.h1>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="text-center text-base md:text-lg max-w-md mb-3 leading-relaxed text-gray-600">Eu sei que você tava ansioso, mas esse momento é especial demais pra passar correndo! 😄</motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }} className="text-center text-sm max-w-sm mb-12 text-gray-500">Junta todo mundo aí, liga o som e bora contar juntos dessa vez! 🔊👨‍👩‍👧‍👦</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6 }}><motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><Button size="lg" onClick={() => { setCountdown(5); setStage("countdown2"); }} className="px-14 py-5 text-lg bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white shadow-xl">Estou pronto! 🎉</Button></motion.div></motion.div>
    </motion.div>
  );

  const renderCountdown2 = () => (
    <motion.div key="countdown2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-6 relative" style={splitBg}>
      <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-xl md:text-2xl mb-12 text-center text-gray-800">Agora sim, vamos juntos!</motion.p>
      <AnimatePresence mode="popLayout">
        <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.3 }} className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-blue-500 to-pink-500">
          <span className="text-7xl md:text-8xl font-serif font-bold text-white">{countdown}</span>
        </motion.div>
      </AnimatePresence>
      <motion.div className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border-4 border-pink-300/30" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1 }} className="mt-12 text-sm text-gray-500">Falta pouco para me conhecer...</motion.p>
    </motion.div>
  );

  const renderReveal = () => (
    <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[100dvh] px-6 relative overflow-hidden" style={{ backgroundColor: bgColor }}>
      <Confetti gender={reveal.actualGender} boyColor={reveal.boyColor} girlColor={reveal.girlColor} />
      <div className="relative z-20 text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", damping: 8 }} className="text-8xl md:text-9xl mb-6">{isBoy ? "💙" : "💖"}</motion.div>
        <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="font-serif text-4xl md:text-6xl font-bold mb-4" style={{ color: textColor }}>Eu sou {isBoy ? "um Menino" : "uma Menina"}!</motion.h1>
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0, type: "spring", damping: 10 }} className="mb-6">
          <p className="text-sm uppercase tracking-widest mb-2 opacity-60" style={{ color: textColor }}>Meu nome é</p>
          <p className="font-script text-5xl md:text-7xl" style={{ color: accentColor }}>{babyName}</p>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-sm opacity-50 mb-10" style={{ color: textColor }}>Estou a caminho! Com amor, {reveal.dadName} & {reveal.momName} ❤️</motion.p>
        {userVote && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-8 max-w-xs mx-auto">
            <p className="text-sm" style={{ color: textColor }}>{userVote === reveal.actualGender ? "🎯 Você acertou meu nome! Parabéns!" : `😄 Quase! Mas eu sou ${babyName}!`}</p>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="flex flex-col items-center gap-3">
          <button onClick={handleShareStories} disabled={isSharing} className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold text-sm transition-all duration-300 hover:opacity-90 active:scale-95 shadow-lg disabled:opacity-60" style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            {isSharing ? "Gerando imagem..." : "Compartilhar nos Stories"}
          </button>
          <button onClick={() => setShowMessageBox(true)} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 hover:opacity-90 active:scale-95 shadow-lg" style={{ backgroundColor: accentColor, color: "#fff" }}>✉️ Deixe um Recado</button>
        </motion.div>
      </div>
      <AnimatePresence>
        {showMessageBox && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMessageBox(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" />
            <motion.div initial={{ y: 60, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed inset-0 z-40 flex items-center justify-center px-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-xl text-gray-800">Deixe um recado para {babyName} e para os Papais</h3>
                  <button onClick={() => setShowMessageBox(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Fechar">×</button>
                </div>
                {!messageSent ? (
                  <>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Escreva uma mensagem carinhosa para ${babyName} e ${reveal.dadName} & ${reveal.momName}...`} className="w-full h-40 p-4 rounded-xl border-2 border-gray-200 focus:outline-none transition-colors resize-none text-sm" style={{ borderColor: message ? accentColor : undefined }} autoFocus />
                    <div className="flex justify-end mt-4">
                      <button onClick={submitMessage} disabled={!message.trim()} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{ backgroundColor: accentColor }}>Enviar →</button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                    <div className="text-5xl mb-3">💌</div>
                    <p className="font-serif text-lg text-gray-800">Recado enviado com carinho!</p>
                    <p className="text-sm mt-1 text-gray-500">{babyName} e {reveal.dadName} & {reveal.momName} vão adorar ler ❤️</p>
                    <button onClick={() => setShowMessageBox(false)} className="mt-4 text-sm font-semibold underline" style={{ color: accentColor }}>Fechar</button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );

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
