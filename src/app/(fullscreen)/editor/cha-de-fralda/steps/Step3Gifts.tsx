"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBabyShowerEditor, type EditorGift } from '@/contexts/BabyShowerEditorContext';
import { Button } from '@/components/ui/Button';
import {
  CATALOG_DIAPERS,
  CATALOG_MIMOS,
  MIMO_SUBCATEGORY_LABELS,
  computeProportionalGifts,
  type MimoSubcategory,
} from '@/config/baby-shower-catalog';
import { DIAPER_SIZES, type DiaperSize } from '@/types/baby-shower';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

export function Step3Gifts() {
  const { data, updateData, nextStep, prevStep } = useBabyShowerEditor();
  const [error, setError] = useState<string | null>(null);
  // Accordion dos blocos de mimos — todos começam fechados; o cliente abre o que quiser.
  const [openSubcats, setOpenSubcats] = useState<Set<MimoSubcategory>>(new Set<MimoSubcategory>());

  const gifts = data.gifts;

  // Selected catalog keys = keys present in the gifts list (non-custom).
  const selectedKeys = new Set(gifts.filter((g) => g.key).map((g) => g.key as string));

  /**
   * Recalcula as quantidades proporcionais para os itens de catálogo selecionados,
   * com base no número de convidados. Mantém itens custom intactos.
   */
  const recalcProportional = (giftList: EditorGift[]): EditorGift[] => {
    const keys = new Set(giftList.filter((g) => g.key).map((g) => g.key as string));
    const qtyByKey = computeProportionalGifts(data.guestCount, keys);
    return giftList.map((g) =>
      g.key && qtyByKey[g.key] !== undefined ? { ...g, qtyDesired: qtyByKey[g.key] } : g
    );
  };

  // Recalcula automaticamente quando o número de convidados muda (e no mount inicial
  // se houver convidados informados). Não recalcula se guestCount = 0.
  const lastGuestCount = useRef<number | null>(null);
  useEffect(() => {
    if (data.guestCount > 0 && lastGuestCount.current !== data.guestCount) {
      lastGuestCount.current = data.guestCount;
      updateData({ gifts: recalcProportional(gifts) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.guestCount]);

  const toggleCatalogItem = (key: string) => {
    const cat = [...CATALOG_DIAPERS, ...CATALOG_MIMOS].find((c) => c.key === key);
    if (!cat) return;
    const exists = gifts.find((g) => g.key === key);
    let next: EditorGift[];
    if (exists) {
      next = gifts.filter((g) => g.key !== key);
    } else {
      next = [
        ...gifts,
        {
          key: cat.key,
          name: cat.name,
          category: cat.category,
          diaperSize: cat.diaperSize,
          qtyDesired: cat.defaultQty,
          priceCents: cat.priceCents,
          isCustom: false,
        },
      ];
    }
    // Após mudar a seleção, redistribui proporcionalmente (se houver convidados).
    updateData({ gifts: data.guestCount > 0 ? recalcProportional(next) : next });
  };

  const updateGiftQtyByKey = (key: string, qty: number) => {
    updateData({
      gifts: gifts.map((g) => (g.key === key ? { ...g, qtyDesired: Math.max(1, qty) } : g)),
    });
  };

  const removeGift = (index: number) => {
    updateData({ gifts: gifts.filter((_, i) => i !== index) });
  };

  const addCustomGift = () => {
    updateData({
      gifts: [
        ...gifts,
        { name: '', category: 'mimo', diaperSize: null, qtyDesired: 1, priceCents: null, isCustom: true },
      ],
    });
  };

  const updateCustomGift = (index: number, updates: Partial<EditorGift>) => {
    const next = [...gifts];
    next[index] = { ...next[index], ...updates };
    if (updates.category === 'mimo') next[index].diaperSize = null;
    updateData({ gifts: next });
  };

  const handleNext = () => {
    const valid = gifts.filter((g) => g.name.trim() && g.qtyDesired >= 1);
    if (valid.length === 0) {
      setError('Adicione ao menos um presente à lista');
      return;
    }
    const invalidFralda = gifts.find((g) => g.category === 'fralda' && !g.diaperSize);
    if (invalidFralda) {
      setError('Selecione o tamanho de todas as fraldas');
      return;
    }
    setError(null);
    nextStep();
  };

  const qtyByKey = (key: string) => gifts.find((g) => g.key === key)?.qtyDesired ?? 0;

  // Totais para o resumo (soma real de unidades dos itens de catálogo selecionados)
  const totalFraldas = gifts.filter((g) => g.category === 'fralda').reduce((s, g) => s + g.qtyDesired, 0);
  const totalMimos = gifts.filter((g) => g.category === 'mimo' && !g.isCustom).reduce((s, g) => s + g.qtyDesired, 0);

  const customGifts = gifts.map((g, i) => ({ g, i })).filter(({ g }) => g.isCustom);

  // Agrupa mimos por subcategoria (na ordem das labels), com contagem de selecionados.
  const mimosBySubcat = (Object.keys(MIMO_SUBCATEGORY_LABELS) as MimoSubcategory[]).map((sub) => {
    const items = CATALOG_MIMOS.filter((m) => m.subcategory === sub);
    const selectedCount = items.filter((m) => selectedKeys.has(m.key)).length;
    return { sub, items, selectedCount };
  });

  const toggleSubcat = (sub: MimoSubcategory) => {
    setOpenSubcats((prev) => {
      const next = new Set(prev);
      if (next.has(sub)) next.delete(sub);
      else next.add(sub);
      return next;
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-4 py-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 10 }}
        className="text-6xl mb-4"
      >
        🎁
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        Lista de presentes
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 mb-6 max-w-md"
      >
        {data.guestCount > 0 ? (
          <>
            Sugerimos as quantidades para <strong>{data.guestCount} convidados</strong>. Marque os itens e ajuste o que quiser.
          </>
        ) : (
          <>Selecione fraldas e mimos. Informe o número de convidados no passo 1 para sugestões automáticas de quantidade.</>
        )}
      </motion.p>

      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-2.5 h-2.5 rounded-full transition-all ${step === 3 ? 'bg-pink-400 scale-125' : 'bg-pink-200'}`}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-lg space-y-6"
      >
        {/* Resumo */}
        {data.guestCount > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-pink-50 border border-pink-200 p-3 text-center">
              <p className="text-2xl font-bold text-pink-600">{totalFraldas}</p>
              <p className="text-xs text-gray-600">fraldas no total</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{totalMimos}</p>
              <p className="text-xs text-gray-600">mimos disponíveis</p>
            </div>
          </div>
        )}

        {/* ===== FRALDAS ===== */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">🍼 Fraldas</h3>
            <span className="text-xs text-gray-400">por tamanho</span>
          </div>
          <div className="space-y-2">
            {CATALOG_DIAPERS.map((c) => {
              const selected = selectedKeys.has(c.key);
              return (
                <div
                  key={c.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selected ? 'border-pink-300 bg-pink-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCatalogItem(c.key)}
                    className="w-5 h-5 accent-pink-400"
                  />
                  <span className="flex-1 text-sm text-gray-700">{c.name}</span>
                  {selected && (
                    <input
                      type="number"
                      min={1}
                      value={qtyByKey(c.key)}
                      onChange={(e) => updateGiftQtyByKey(c.key, Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-md border border-gray-300 text-center text-sm"
                      aria-label={`Quantidade de ${c.name}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== MIMOS (accordion por subcategoria) ===== */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">🧸 Mimos</h3>
            <span className="text-xs text-gray-400">tudo que ajuda o bebê</span>
          </div>

          <div className="space-y-2">
            {mimosBySubcat.map(({ sub, items, selectedCount }) => {
              const open = openSubcats.has(sub);
              return (
                <div key={sub} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSubcat(sub)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      {MIMO_SUBCATEGORY_LABELS[sub]}
                      {selectedCount > 0 && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                          {selectedCount}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 p-3 pt-1">
                          {items.map((c) => {
                            const selected = selectedKeys.has(c.key);
                            return (
                              <div
                                key={c.key}
                                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                                  selected ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleCatalogItem(c.key)}
                                  className="w-5 h-5 accent-amber-400"
                                />
                                <span className="flex-1 text-sm text-gray-700">{c.name}</span>
                                {selected && (
                                  <input
                                    type="number"
                                    min={1}
                                    value={qtyByKey(c.key)}
                                    onChange={(e) => updateGiftQtyByKey(c.key, Number(e.target.value))}
                                    className="w-16 px-2 py-1 rounded-md border border-gray-300 text-center text-sm"
                                    aria-label={`Quantidade de ${c.name}`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== ITENS PRÓPRIOS ===== */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Seus itens</h3>
            <button
              type="button"
              onClick={addCustomGift}
              className="flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm font-medium"
            >
              <Plus size={16} /> Adicionar item
            </button>
          </div>

          {customGifts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Nenhum item próprio adicionado</p>
          )}

          <div className="space-y-3">
            {customGifts.map(({ g, i }) => (
              <div key={i} className="space-y-2 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={g.name}
                    onChange={(e) => updateCustomGift(i, { name: e.target.value })}
                    placeholder="Nome do presente"
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeGift(i)}
                    className="text-red-400 hover:text-red-600"
                    aria-label="Remover item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={g.category}
                    onChange={(e) => updateCustomGift(i, { category: e.target.value as 'fralda' | 'mimo' })}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                  >
                    <option value="mimo">Mimo</option>
                    <option value="fralda">Fralda</option>
                  </select>
                  {g.category === 'fralda' && (
                    <select
                      value={g.diaperSize ?? ''}
                      onChange={(e) => updateCustomGift(i, { diaperSize: (e.target.value || null) as DiaperSize | null })}
                      className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                    >
                      <option value="">Tamanho</option>
                      {DIAPER_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="number"
                    min={1}
                    value={g.qtyDesired}
                    onChange={(e) => updateCustomGift(i, { qtyDesired: Math.max(1, Number(e.target.value)) })}
                    className="w-16 px-2 py-2 rounded-md border border-gray-300 text-center text-sm"
                    aria-label="Quantidade"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2 pb-8">
          <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
            ← Voltar
          </Button>
          <Button onClick={handleNext} size="lg" className="flex-1 bg-pink-400 hover:bg-pink-500 text-white font-semibold">
            Continuar →
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
