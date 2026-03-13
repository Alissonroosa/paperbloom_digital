"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Eye, Users, MessageCircle, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Vote {
  id: string;
  voterName: string;
  vote: "menino" | "menina";
  message: string | null;
  createdAt: string;
}

interface DashboardData {
  reveal: {
    id: string;
    boyName: string;
    girlName: string;
    actualGender: "menino" | "menina";
    dadName: string;
    momName: string;
    slug: string;
    qrCodeUrl: string | null;
    createdAt: string;
  };
  stats: {
    totalVotes: number;
    boyVotes: number;
    girlVotes: number;
    viewCount: number;
    votes: Vote[];
  };
}

export default function DashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/gender-reveal/dashboard/${slug}`);
        if (!response.ok) throw new Error("Dashboard não encontrado");
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  const copyLink = async () => {
    if (!data) return;
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/revelacao-virtual/${data.reveal.slug}`;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-gray-600">{error || "Dashboard não encontrado"}</p>
        </div>
      </div>
    );
  }

  const { reveal, stats } = data;
  const isBoy = reveal.actualGender === "menino";
  const babyName = isBoy ? reveal.boyName : reveal.girlName;
  const boyPct = stats.totalVotes > 0 ? Math.round((stats.boyVotes / stats.totalVotes) * 100) : 50;
  const girlPct = 100 - boyPct;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${baseUrl}/revelacao-virtual/${reveal.slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-5xl mb-4">{isBoy ? "💙" : "💖"}</div>
          <h1 className="font-serif text-3xl text-gray-800 mb-2">
            Dashboard da Revelação
          </h1>
          <p className="text-gray-600">
            {reveal.dadName} & {reveal.momName} • <span className="font-medium" style={{ color: isBoy ? "#5B9BD5" : "#E6A0B8" }}>{babyName}</span>
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold text-gray-800">{stats.viewCount}</p>
            <p className="text-sm text-gray-500">Visualizações</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-pink-500" />
            <p className="text-3xl font-bold text-gray-800">{stats.totalVotes}</p>
            <p className="text-sm text-gray-500">Votos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-bold text-gray-800">{stats.votes.filter(v => v.message).length}</p>
            <p className="text-sm text-gray-500">Mensagens</p>
          </div>
        </motion.div>

        {/* Vote Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="font-serif text-xl text-gray-800 mb-6">Resultado dos Votos</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">💙 Menino - {reveal.boyName}</span>
                <span className="font-bold" style={{ color: "#5B9BD5" }}>{stats.boyVotes} votos ({boyPct}%)</span>
              </div>
              <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${boyPct}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: "#5B9BD5" }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">💖 Menina - {reveal.girlName}</span>
                <span className="font-bold" style={{ color: "#E6A0B8" }}>{stats.girlVotes} votos ({girlPct}%)</span>
              </div>
              <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${girlPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full" style={{ backgroundColor: "#E6A0B8" }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="font-serif text-xl text-gray-800 mb-4">Link para Compartilhar</h2>
          
          <div className="flex gap-3">
            <input type="text" value={publicUrl} readOnly className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 text-sm" />
            <Button onClick={copyLink} variant="outline" className="px-4">
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </Button>
            <Button onClick={() => window.open(publicUrl, "_blank")} className="px-4 bg-gradient-to-r from-blue-400 to-pink-400">
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
          
          {reveal.qrCodeUrl && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">QR Code para imprimir:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reveal.qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto border-2 border-gray-200 rounded-xl p-2 bg-white" />
            </div>
          )}
        </motion.div>

        {/* Messages */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="font-serif text-xl text-gray-800 mb-6">Votos e Mensagens</h2>
          
          {stats.votes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum voto ainda. Compartilhe o link!</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stats.votes.map((vote) => (
                <div key={vote.id} className="border-l-4 pl-4 py-2" style={{ borderColor: vote.vote === "menino" ? "#5B9BD5" : "#E6A0B8" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{vote.voterName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: vote.vote === "menino" ? "#5B9BD520" : "#E6A0B820", color: vote.vote === "menino" ? "#5B9BD5" : "#E6A0B8" }}>
                      {vote.vote === "menino" ? "💙 Menino" : "💖 Menina"}
                    </span>
                  </div>
                  {vote.message && <p className="text-gray-600 text-sm">{vote.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(vote.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Atualiza automaticamente a cada 30 segundos • Paper Bloom
        </p>
      </div>
    </div>
  );
}
