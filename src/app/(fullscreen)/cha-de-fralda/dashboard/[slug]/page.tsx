"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Eye, Users, Gift, MessageCircle, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RsvpGiftLine {
  giftId: string;
  qty: number;
  name?: string;
  category?: 'fralda' | 'mimo';
  diaperSize?: string | null;
}

interface Rsvp {
  id: string;
  guestName: string;
  attendance: 'sim' | 'nao' | 'talvez';
  message: string | null;
  gifts: RsvpGiftLine[];
  createdAt: string;
}

interface DashGift {
  id: string;
  name: string;
  category: 'fralda' | 'mimo';
  diaperSize: string | null;
  qtyDesired: number;
  qtyReserved: number;
  qtyAvailable: number;
  priceCents: number | null;
  reservedBy: { guestName: string; qty: number }[];
}

interface DashboardData {
  babyShower: {
    id: string;
    babyName: string | null;
    hostName: string;
    partnerName: string | null;
    slug: string;
    qrCodeUrl: string | null;
    createdAt: string;
  };
  stats: {
    totalRsvps: number;
    confirmedYes: number;
    confirmedNo: number;
    confirmedMaybe: number;
    viewCount: number;
  };
  rsvps: Rsvp[];
  gifts: DashGift[];
}

const ATTENDANCE_LABEL: Record<Rsvp['attendance'], { label: string; cls: string }> = {
  sim: { label: 'Vai', cls: 'bg-green-100 text-green-700' },
  talvez: { label: 'Talvez', cls: 'bg-amber-100 text-amber-700' },
  nao: { label: 'Não vai', cls: 'bg-gray-100 text-gray-500' },
};

export default function ChaDeFraldaDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/baby-shower/dashboard/${slug}`);
        if (!res.ok) throw new Error('Painel não encontrado');
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  const copyLink = async () => {
    if (!data) return;
    const publicUrl = `${window.location.origin}/cha-de-fralda/${data.babyShower.slug}`;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="font-serif text-2xl text-text-main mb-2">Painel não encontrado</h1>
        <p className="text-text-main/70">{error}</p>
      </div>
    );
  }

  const { babyShower, stats, rsvps, gifts } = data;
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/cha-de-fralda/${babyShower.slug}`;
  const messages = rsvps.filter((r) => r.message);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <p className="text-5xl mb-3">🍼</p>
          <h1 className="font-serif text-3xl text-text-main">
            Painel · Chá de Fralda {babyShower.babyName ? `do(a) ${babyShower.babyName}` : ''}
          </h1>
          <p className="text-text-main/70 mt-1">
            {babyShower.partnerName ? `${babyShower.hostName} & ${babyShower.partnerName}` : babyShower.hostName}
          </p>
        </div>

        {/* Share */}
        <div className="bg-white rounded-2xl border border-primary/30 p-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <p className="text-xs uppercase tracking-wide text-text-main/60 mb-1">Link para convidados</p>
            <p className="text-sm text-text-main break-all">{publicUrl}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={copyLink} variant="outline" size="sm">
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" /> Abrir
              </Button>
            </a>
          </div>
        </div>

        {babyShower.qrCodeUrl && (
          <div className="bg-white rounded-2xl border border-primary/30 p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-text-main/60 mb-3">QR Code</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={babyShower.qrCodeUrl} alt="QR Code do convite" className="w-40 h-40 mx-auto rounded-lg border border-primary/20 p-2 bg-white" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Users className="w-5 h-5" />} label="Confirmados" value={stats.confirmedYes} />
          <StatCard icon={<MessageCircle className="w-5 h-5" />} label="Talvez" value={stats.confirmedMaybe} />
          <StatCard icon={<Users className="w-5 h-5" />} label="Não vão" value={stats.confirmedNo} />
          <StatCard icon={<Eye className="w-5 h-5" />} label="Visualizações" value={stats.viewCount} />
        </div>

        {/* Gifts */}
        <div className="bg-white rounded-2xl border border-primary/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl text-text-main">Lista de presentes</h2>
          </div>
          <div className="space-y-3">
            {gifts.map((g) => (
              <div key={g.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-main">
                    {g.category === 'fralda' ? '🍼' : '🧸'} {g.name}
                  </span>
                  <span className="text-xs text-text-main/70">
                    {g.qtyReserved}/{g.qtyDesired} reservado(s)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${g.qtyDesired ? (g.qtyReserved / g.qtyDesired) * 100 : 0}%` }}
                  />
                </div>
                {g.reservedBy.length > 0 && (
                  <p className="text-xs text-text-main/60 mt-2">
                    Por: {g.reservedBy.map((r) => `${r.guestName} (${r.qty})`).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Confirmations */}
        <div className="bg-white rounded-2xl border border-primary/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl text-text-main">Confirmações ({stats.totalRsvps})</h2>
          </div>
          {rsvps.length === 0 ? (
            <p className="text-sm text-text-main/60">Nenhuma confirmação ainda.</p>
          ) : (
            <div className="space-y-2">
              {rsvps.map((r) => (
                <div key={r.id} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-sm text-text-main">{r.guestName}</span>
                    {r.gifts.length > 0 && (
                      <p className="text-xs text-text-main/60 mt-0.5">
                        🎁 {r.gifts.map((g) => `${g.name}${g.qty > 1 ? ` (${g.qty})` : ''}`).join(' + ')}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${ATTENDANCE_LABEL[r.attendance].cls}`}>
                    {ATTENDANCE_LABEL[r.attendance].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="bg-white rounded-2xl border border-primary/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl text-text-main">Recados ({messages.length})</h2>
            </div>
            <div className="space-y-3">
              {messages.map((r) => (
                <div key={r.id} className="bg-pink-50 rounded-lg p-3">
                  <p className="text-sm text-text-main italic">&ldquo;{r.message}&rdquo;</p>
                  <p className="text-xs text-text-main/60 mt-1">— {r.guestName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-text-main/50 pb-6">Atualiza automaticamente · Paper Bloom</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-primary/30 p-4 text-center">
      <div className="flex justify-center text-primary mb-1">{icon}</div>
      <p className="text-2xl font-bold text-text-main">{value}</p>
      <p className="text-xs text-text-main/60">{label}</p>
    </div>
  );
}
