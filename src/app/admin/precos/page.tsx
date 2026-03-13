"use client";

import { useState, useEffect } from "react";
import { DollarSign, Save, History, X } from "lucide-react";

interface ProductPrice {
  id: string;
  productId: string;
  productName: string;
  priceFromCents: number | null;
  priceCents: number;
  isActive: boolean;
  updatedAt: string;
}

interface PriceHistory {
  id: string;
  productId: string;
  oldPriceCents: number | null;
  newPriceCents: number;
  oldPriceFromCents: number | null;
  newPriceFromCents: number | null;
  reason: string | null;
  createdAt: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function centsToReais(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function reaisToCents(reais: string): number {
  const cleaned = reais.replace(",", ".").replace(/[^\d.]/g, "");
  return Math.round(parseFloat(cleaned || "0") * 100);
}

export default function AdminPrecosPage() {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    priceCents: string;
    priceFromCents: string;
  }>({ priceCents: "", priceFromCents: "" });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await fetch("/api/admin/prices");
      const data = await res.json();
      setPrices(data.prices || []);
    } catch {
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/prices/history");
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const startEditing = (price: ProductPrice) => {
    setEditingId(price.productId);
    setEditValues({
      priceCents: centsToReais(price.priceCents),
      priceFromCents: price.priceFromCents ? centsToReais(price.priceFromCents) : "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({ priceCents: "", priceFromCents: "" });
  };

  const savePrice = async (productId: string) => {
    setSaving(productId);
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          priceCents: reaisToCents(editValues.priceCents),
          priceFromCents: editValues.priceFromCents 
            ? reaisToCents(editValues.priceFromCents) 
            : null,
        }),
      });

      if (res.ok) {
        await fetchPrices();
        cancelEditing();
      }
    } catch (error) {
      console.error("Error saving price:", error);
    } finally {
      setSaving(null);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Preços</h1>
          <p className="text-gray-500">Configure os preços dos seus produtos</p>
        </div>
        <button
          onClick={() => {
            setShowHistory(true);
            fetchHistory();
          }}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <History size={18} />
          Histórico
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Preço De:</strong> Valor original mostrado riscado (opcional, para promoções)
          <br />
          <strong>Preço Por:</strong> Valor atual de venda
        </p>
      </div>

      {/* Prices Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Produto</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Preço De</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Preço Por</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price.productId} className="border-t">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                          <DollarSign size={20} className="text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {price.productName.replace("Paper Bloom Digital - ", "")}
                          </p>
                          <p className="text-xs text-gray-500">ID: {price.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingId === price.productId ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-500">R$</span>
                          <input
                            type="text"
                            value={editValues.priceFromCents}
                            onChange={(e) => setEditValues({ ...editValues, priceFromCents: e.target.value })}
                            placeholder="0,00"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        </div>
                      ) : (
                        <span className={price.priceFromCents ? "text-gray-400 line-through" : "text-gray-400"}>
                          {price.priceFromCents ? formatCurrency(price.priceFromCents) : "-"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingId === price.productId ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-500">R$</span>
                          <input
                            type="text"
                            value={editValues.priceCents}
                            onChange={(e) => setEditValues({ ...editValues, priceCents: e.target.value })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(price.priceCents)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingId === price.productId ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={cancelEditing}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            <X size={18} />
                          </button>
                          <button
                            onClick={() => savePrice(price.productId)}
                            disabled={saving === price.productId}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <Save size={16} />
                            {saving === price.productId ? "Salvando..." : "Salvar"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(price)}
                          className="px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Histórico de Alterações</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {historyLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma alteração registrada</p>
              ) : (
                <div className="divide-y">
                  {history.map((entry) => (
                    <div key={entry.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{entry.productId}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          Preço Por: {entry.oldPriceCents ? formatCurrency(entry.oldPriceCents) : "-"} → {formatCurrency(entry.newPriceCents)}
                        </p>
                        {(entry.oldPriceFromCents || entry.newPriceFromCents) && (
                          <p>
                            Preço De: {entry.oldPriceFromCents ? formatCurrency(entry.oldPriceFromCents) : "-"} → {entry.newPriceFromCents ? formatCurrency(entry.newPriceFromCents) : "-"}
                          </p>
                        )}
                        {entry.reason && <p className="text-gray-500 mt-1">Motivo: {entry.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
