"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Loader2, MapPin, CalendarDays, Check, X, Plus, Minus } from 'lucide-react';
import { getTheme, THEME_DEFAULT, pageBgStyle, cardStyle } from '@/config/baby-shower-themes';

interface PublicGift {
  id: string;
  name: string;
  category: 'fralda' | 'mimo';
  diaperSize: string | null;
  qtyDesired: number;
  qtyReserved: number;
  qtyAvailable: number;
  priceCents: number | null;
}

interface PublicEvent {
  id: string;
  babyName: string | null;
  babyGender: 'menino' | 'menina' | 'surpresa';
  hostName: string;
  partnerName: string | null;
  welcomeMessage: string | null;
  eventDate: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationMapsUrl: string | null;
  photos: string[];
  primaryColor: string;
  theme?: string | null;
}

type Attendance = 'sim' | 'nao' | 'talvez';

const ATTENDANCE: { value: Attendance; label: string; emoji: string }[] = [
  { value: 'sim', label: 'Vou comparecer', emoji: '🎉' },
  { value: 'talvez', label: 'Talvez', emoji: '🤔' },
  { value: 'nao', label: 'Não vou conseguir', emoji: '💌' },
];

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return null;
  }
}

export default function ChaDeFraldaPublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [gifts, setGifts] = useState<PublicGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RSVP state
  const [guestName, setGuestName] = useState('');
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [wantsToGift, setWantsToGift] = useState<boolean | null>(null); // only relevant for "nao"
  const [selectedDiaperId, setSelectedDiaperId] = useState<string | null>(null);
  // Mimos múltiplos: mapa giftId -> quantidade (>=1 quando marcado).
  const [mimoQty, setMimoQty] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Theme is visual-only for now: comes from event.theme, falls back to default (safari).
  const theme = useMemo(() => getTheme(event?.theme ?? THEME_DEFAULT), [event?.theme]);

  async function load() {
    try {
      const res = await fetch(`/api/baby-shower/by-slug/${slug}`);
      if (!res.ok) throw new Error('Chá de fralda não encontrado');
      const data = await res.json();
      setEvent(data.babyShower);
      setGifts(data.gifts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Mostra TODOS os itens (inclusive esgotados, que ficam desabilitados em cinza).
  const diapers = gifts.filter((g) => g.category === 'fralda');
  const mimos = gifts.filter((g) => g.category === 'mimo');
  const hasAvailableDiaper = diapers.some((g) => g.qtyAvailable > 0);

  const openGiftModal = (att: Attendance) => {
    if (!guestName.trim()) {
      setFormError('Digite seu nome antes de confirmar');
      return;
    }
    setFormError(null);
    setAttendance(att);
    setWantsToGift(att === 'nao' ? null : true);
    setSelectedDiaperId(null);
    setMimoQty({});
    setModalOpen(true);
  };

  const toggleMimo = (g: PublicGift) => {
    setMimoQty((prev) => {
      const next = { ...prev };
      if (next[g.id]) delete next[g.id];
      else next[g.id] = 1;
      return next;
    });
  };

  const changeMimoQty = (g: PublicGift, delta: number) => {
    setMimoQty((prev) => {
      const current = prev[g.id] ?? 0;
      const next = Math.min(g.qtyAvailable, Math.max(1, current + delta));
      return { ...prev, [g.id]: next };
    });
  };

  const submit = async () => {
    setFormError(null);
    const giftingActive = attendance !== 'nao' || wantsToGift === true;

    // Fralda é obrigatória ao presentear (se houver fralda disponível).
    if (giftingActive && hasAvailableDiaper && !selectedDiaperId) {
      setFormError(
        attendance === 'nao'
          ? 'Escolha um tamanho de fralda (ou selecione "Não vou presentear")'
          : 'Escolha um tamanho de fralda para levar'
      );
      return;
    }

    const giftSelections: { giftId: string; qty: number }[] = [];
    if (giftingActive) {
      if (selectedDiaperId) giftSelections.push({ giftId: selectedDiaperId, qty: 1 });
      for (const [giftId, qty] of Object.entries(mimoQty)) {
        if (qty >= 1) giftSelections.push({ giftId, qty });
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/baby-shower/${event!.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName.trim(),
          attendance,
          message: message.trim() || null,
          giftSelections,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao confirmar');
      }
      setModalOpen(false);
      setDone(true);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao confirmar');
      load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-5xl mb-4">🍼</p>
        <h1 className="font-serif text-2xl text-text-main mb-2">Ops!</h1>
        <p className="text-text-main/70">{error || 'Chá de fralda não encontrado'}</p>
      </div>
    );
  }

  const dateLabel = formatDate(event.eventDate);
  const parents = event.partnerName ? `${event.hostName} & ${event.partnerName}` : event.hostName;

  if (done) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center" style={pageBgStyle(theme)}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }} className="text-7xl mb-6">
          {theme.emoji}
        </motion.div>
        <h1 className="font-serif text-3xl mb-3" style={{ color: theme.heading }}>
          Obrigado, {guestName}!
        </h1>
        <p className="max-w-md" style={{ color: theme.body }}>
          Sua resposta foi registrada com sucesso.
          {(selectedDiaperId || Object.keys(mimoQty).length > 0) && ' Obrigado pelo carinho com o presente reservado! 💕'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] py-10 px-4" style={pageBgStyle(theme)}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-center">
          <div className="flex justify-center gap-2 text-4xl mb-3">
            {theme.decorations.slice(0, 4).map((d, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 * i, type: 'spring', damping: 8 }}
              >
                {d}
              </motion.span>
            ))}
          </div>
          <p className="font-script text-2xl mb-1" style={{ color: theme.script }}>
            Você está convidado para o
          </p>
          <h1 className="font-serif text-3xl md:text-4xl" style={{ color: theme.heading }}>
            Chá de Fralda {event.babyName ? `do(a) ${event.babyName}` : `de ${parents}`}
          </h1>
          {event.welcomeMessage && (
            <p className="mt-4 italic" style={{ color: theme.body }}>
              &ldquo;{event.welcomeMessage}&rdquo;
            </p>
          )}
        </motion.div>

        {/* Event details */}
        {(dateLabel || event.locationName) && (
          <div className="rounded-2xl p-5 space-y-3" style={cardStyle(theme)}>
            {dateLabel && (
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 mt-0.5" style={{ color: theme.accent }} />
                <p className="text-sm" style={{ color: theme.body }}>{dateLabel}</p>
              </div>
            )}
            {event.locationName && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5" style={{ color: theme.accent }} />
                <div className="text-sm">
                  <p className="font-medium" style={{ color: theme.heading }}>{event.locationName}</p>
                  {event.locationAddress && <p style={{ color: theme.body }}>{event.locationAddress}</p>}
                  {event.locationMapsUrl && (
                    <a href={event.locationMapsUrl} target="_blank" rel="noreferrer" className="underline" style={{ color: theme.accent }}>
                      Ver no mapa
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RSVP — minimal: name + attendance */}
        <div className="rounded-2xl p-5 space-y-5" style={cardStyle(theme)}>
          <h2 className="font-serif text-xl" style={{ color: theme.heading }}>
            Confirme sua presença
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.body }}>
              Seu nome
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Como você se chama?"
              className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/70 focus:outline-none focus:ring-2"
              style={{ ['--tw-ring-color' as string]: theme.accent }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {ATTENDANCE.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => openGiftModal(opt.value)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-xs hover:scale-[1.02]"
                style={{ borderColor: theme.accent, color: theme.body, backgroundColor: 'rgba(255,255,255,0.5)' }}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {formError && !modalOpen && <p className="text-red-500 text-sm">{formError}</p>}
        </div>

        <p className="text-center text-xs pb-6" style={{ color: theme.body, opacity: 0.6 }}>
          Feito com 💕 pela Paper Bloom
        </p>
      </div>

      {/* Gift modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setModalOpen(false)}
          >
            <motion.div
              className="w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
              style={cardStyle(theme)}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl" style={{ color: theme.heading }}>
                  {attendance === 'nao' ? 'Que pena que não poderá ir!' : 'Escolha um presente 🎁'}
                </h3>
                <button onClick={() => !submitting && setModalOpen(false)} aria-label="Fechar" style={{ color: theme.body }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* For "nao": ask if they want to gift anyway */}
              {attendance === 'nao' && wantsToGift === null && (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: theme.body }}>
                    Você gostaria de presentear o bebê mesmo assim?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setWantsToGift(true)}
                      className="text-white font-semibold"
                      style={{ backgroundColor: theme.accent }}
                    >
                      Sim, quero presentear 💝
                    </Button>
                    <Button variant="outline" onClick={() => setWantsToGift(false)}>
                      Só confirmar
                    </Button>
                  </div>
                </div>
              )}

              {/* Gift selection (sim/talvez always; nao only if wantsToGift) */}
              {(attendance !== 'nao' || wantsToGift === true) && (
                <div className="space-y-5">
                  {/* Fraldas — obrigatória ao presentear. Esgotadas ficam em cinza/riscado. */}
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: theme.heading }}>
                      {theme.diaperEmoji} Escolha um tamanho de fralda para levar
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {diapers.map((g) => {
                        const out = g.qtyAvailable <= 0;
                        const sel = selectedDiaperId === g.id;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            disabled={out}
                            onClick={() => !out && setSelectedDiaperId(sel ? null : g.id)}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                              out ? 'cursor-not-allowed line-through' : ''
                            }`}
                            style={
                              out
                                ? { borderColor: '#e5e7eb', backgroundColor: '#f3f4f6', color: '#9ca3af' }
                                : {
                                    borderColor: theme.accent,
                                    backgroundColor: sel ? theme.accent : 'transparent',
                                    color: sel ? '#fff' : theme.body,
                                  }
                            }
                            title={out ? 'Esgotado' : undefined}
                          >
                            {g.diaperSize || g.name}
                            {out && <span className="ml-1 text-[10px] no-underline">(esgotado)</span>}
                          </button>
                        );
                      })}
                      {/* Convidado que não vai pode optar por não presentear */}
                      {attendance === 'nao' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDiaperId(null);
                            setMimoQty({});
                            setWantsToGift(false);
                          }}
                          className="px-4 py-2 rounded-xl border-2 border-dashed text-sm"
                          style={{ borderColor: theme.accent, color: theme.body }}
                        >
                          Não vou presentear
                        </button>
                      )}
                    </div>
                    {!hasAvailableDiaper && (
                      <p className="text-xs mt-2" style={{ color: theme.body, opacity: 0.7 }}>
                        Todas as fraldas já foram reservadas. Obrigado pelo carinho!
                      </p>
                    )}
                  </div>

                  {/* Mimos — múltiplos, com quantidade nos selecionados. Esgotados em cinza. */}
                  {mimos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2" style={{ color: theme.heading }}>
                        {theme.mimoEmoji} Quer levar um mimo também?
                      </p>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {mimos.map((g) => {
                          const out = g.qtyAvailable <= 0;
                          const qty = mimoQty[g.id] ?? 0;
                          const sel = qty > 0;
                          return (
                            <div
                              key={g.id}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                out ? 'cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              style={
                                out
                                  ? { borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' }
                                  : {
                                      borderColor: sel ? theme.accent : 'rgba(0,0,0,0.1)',
                                      backgroundColor: sel ? theme.accentSoft : 'transparent',
                                    }
                              }
                              onClick={() => !out && !sel && toggleMimo(g)}
                            >
                              <span
                                className={`flex-1 text-sm ${out ? 'line-through' : ''}`}
                                style={{ color: out ? '#9ca3af' : theme.body }}
                              >
                                {g.name}
                                {out && <span className="ml-1 text-[10px] no-underline">(esgotado)</span>}
                              </span>

                              {!out && !sel && <Check className="w-4 h-4 opacity-0" />}

                              {/* Stepper de quantidade — só aparece nos mimos marcados */}
                              {!out && sel && (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => (qty <= 1 ? toggleMimo(g) : changeMimoQty(g, -1))}
                                    className="w-7 h-7 rounded-full border flex items-center justify-center"
                                    style={{ borderColor: theme.accent, color: theme.accent }}
                                    aria-label="Diminuir"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-5 text-center text-sm font-medium" style={{ color: theme.body }}>
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => changeMimoQty(g, 1)}
                                    disabled={qty >= g.qtyAvailable}
                                    className="w-7 h-7 rounded-full border flex items-center justify-center disabled:opacity-40"
                                    style={{ borderColor: theme.accent, color: theme.accent }}
                                    aria-label="Aumentar"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message — always */}
              <div className="mt-5">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.body }}>
                  Deixe um recado (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Uma mensagem carinhosa para os pais..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/70 focus:outline-none focus:ring-2 resize-none"
                  style={{ ['--tw-ring-color' as string]: theme.accent }}
                />
              </div>

              {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}

              {/* Submit (hidden while nao is still deciding to gift) */}
              {!(attendance === 'nao' && wantsToGift === null) && (
                <Button
                  onClick={submit}
                  size="lg"
                  disabled={submitting}
                  className="w-full mt-5 text-white font-semibold"
                  style={{ backgroundColor: theme.accent }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Confirmar'
                  )}
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
