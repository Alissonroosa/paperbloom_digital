"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, Edit2, Trash2, Package, TrendingUp, AlertCircle, type LucideIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminProduct {
  id: string;
  name: string;
  default_cost_cents: number;
  default_price_cents: number;
  active: boolean;
}

type DeliveryType = 'entrega-canoas' | 'mercado-envios' | 'retirada' | 'outro';
type PaymentStatus = 'pago' | 'reserva-30' | 'pendente';
type OrderStatus = 'novo' | 'em-producao' | 'pronto' | 'entregue' | 'cancelado';

interface PhysicalOrder {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string | null;
  customer_city: string | null;
  product_id: string | null;
  product_name: string;
  quantity: number;
  cost_cents: number;
  price_cents: number;
  production_days: number | null;
  order_date: string;
  delivery_date: string | null;
  delivery_type: DeliveryType;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes: string | null;
}

interface OrderSummary {
  totalOrders: number;
  totalRevenueCents: number;
  totalCostCents: number;
  totalProfitCents: number;
  pendingPaymentCount: number;
  inProductionCount: number;
  readyToDeliverCount: number;
}

interface ProductGrouped {
  product_id: string | null;
  product_name: string;
  order_count: number;
  total_quantity: number;
  total_revenue_cents: number;
  total_cost_cents: number;
  total_profit_cents: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function fmtDate(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function parsePriceInput(value: string): number {
  // "55,00" → 5500 ; "55" → 5500 ; "55.50" → 5550
  const clean = value.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(clean);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function formatPriceInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

const PAYMENT_LABELS: Record<PaymentStatus, { label: string; cls: string }> = {
  pago: { label: "Pago", cls: "bg-green-100 text-green-700" },
  "reserva-30": { label: "Reserva 30%", cls: "bg-amber-100 text-amber-700" },
  pendente: { label: "Pendente", cls: "bg-red-100 text-red-700" },
};

const STATUS_LABELS: Record<OrderStatus, { label: string; cls: string }> = {
  novo: { label: "Novo", cls: "bg-blue-100 text-blue-700" },
  "em-producao": { label: "Em produção", cls: "bg-amber-100 text-amber-700" },
  pronto: { label: "Pronto", cls: "bg-purple-100 text-purple-700" },
  entregue: { label: "Entregue", cls: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", cls: "bg-gray-100 text-gray-700" },
};

const DELIVERY_LABELS: Record<DeliveryType, string> = {
  "entrega-canoas": "Entrega Canoas",
  "mercado-envios": "Mercado Envios",
  retirada: "Retirada",
  outro: "Outro",
};

// ─── Page ────────────────────────────────────────────────────────────────────

type Tab = "pedidos" | "por-produto" | "produtos";

export default function PedidosFisicosPage() {
  const [tab, setTab] = useState<Tab>("pedidos");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pedidos físicos</h1>
        <p className="text-gray-600 text-sm">Gestão manual de encomendas via WhatsApp</p>
      </div>

      {/* Tabs — rolagem horizontal em mobile */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 px-2 sm:px-4 flex gap-1 overflow-x-auto">
        {[
          { id: "pedidos" as Tab, label: "Pedidos" },
          { id: "por-produto" as Tab, label: "Por produto" },
          { id: "produtos" as Tab, label: "Produtos cadastrados" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? "border-pink-600 text-pink-600"
                : "border-transparent text-gray-600 hover:text-pink-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pedidos" && <OrdersTab />}
      {tab === "por-produto" && <GroupedTab />}
      {tab === "produtos" && <ProductsTab />}
    </div>
  );
}

// ─── Aba 1: Pedidos ──────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<PhysicalOrder[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PhysicalOrder | null>(null);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState<{
    paymentStatus: string;
    orderStatus: string;
    search: string;
  }>({ paymentStatus: "", orderStatus: "", search: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (filters.paymentStatus) sp.set("paymentStatus", filters.paymentStatus);
    if (filters.orderStatus) sp.set("orderStatus", filters.orderStatus);
    if (filters.search) sp.set("search", filters.search);

    const monthStart = new Date();
    monthStart.setDate(1);
    const fromDate = monthStart.toISOString().slice(0, 10);

    const [ordersRes, summaryRes, productsRes] = await Promise.all([
      fetch(`/api/admin/physical-orders?${sp.toString()}`),
      fetch(`/api/admin/physical-orders/summary?fromDate=${fromDate}`),
      fetch(`/api/admin/products`),
    ]);
    const ordersData = await ordersRes.json();
    const summaryData = await summaryRes.json();
    const productsData = await productsRes.json();
    setOrders(ordersData.orders || []);
    setSummary(summaryData.summary || null);
    setProducts(productsData.products || []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este pedido?")) return;
    await fetch(`/api/admin/physical-orders/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* KPIs do mês */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard icon={Package} label="Pedidos no mês" value={summary.totalOrders.toString()} />
          <KPICard icon={TrendingUp} label="Receita" value={fmtCurrency(summary.totalRevenueCents)} />
          <KPICard icon={TrendingUp} label="Lucro bruto" value={fmtCurrency(summary.totalProfitCents)} highlight />
          <KPICard icon={AlertCircle} label="Pagamento pendente" value={summary.pendingPaymentCount.toString()} warn={summary.pendingPaymentCount > 0} />
        </div>
      )}

      {/* Filtros + botão novo */}
      <div className="bg-white rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3 shadow-sm">
        <button
          onClick={() => setCreating(true)}
          className="w-full sm:hidden px-4 py-2.5 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 inline-flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Novo pedido
        </button>
        <div className="relative flex-1 sm:min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-auto"
          >
            <option value="">Pagamento</option>
            <option value="pago">Pago</option>
            <option value="reserva-30">Reserva 30%</option>
            <option value="pendente">Pendente</option>
          </select>
          <select
            value={filters.orderStatus}
            onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-auto"
          >
            <option value="">Status</option>
            <option value="novo">Novo</option>
            <option value="em-producao">Em produção</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="hidden sm:inline-flex sm:ml-auto px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 items-center gap-2"
        >
          <Plus size={16} /> Novo pedido
        </button>
      </div>

      {/* Lista — cards em mobile, tabela em desktop */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">Carregando...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          Nenhum pedido. Toque em <strong>+ Novo pedido</strong> para começar.
        </div>
      ) : (
        <>
          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => {
              const total = o.price_cents * o.quantity;
              const profit = (o.price_cents - o.cost_cents) * o.quantity;
              return (
                <button
                  key={o.id}
                  onClick={() => setEditing(o)}
                  className="block w-full bg-white rounded-xl shadow-sm p-4 text-left active:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-gray-400">#{String(o.order_number).padStart(3, "0")}</span>
                        <span className="font-semibold text-gray-900 truncate">{o.customer_name}</span>
                      </div>
                      {o.customer_city && <div className="text-xs text-gray-500">{o.customer_city}</div>}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }}
                      className="text-gray-300 hover:text-red-500 p-1 -mr-1"
                      aria-label="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    {o.product_name}
                    {o.quantity > 1 && <span className="text-gray-500"> · {o.quantity}x</span>}
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Venda</div>
                      <div className="font-semibold text-gray-900">{fmtCurrency(total)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Lucro</div>
                      <div className={`font-semibold ${profit > 0 ? "text-green-700" : "text-gray-500"}`}>{fmtCurrency(profit)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PAYMENT_LABELS[o.payment_status].cls}`}>
                      {PAYMENT_LABELS[o.payment_status].label}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_LABELS[o.order_status].cls}`}>
                      {STATUS_LABELS[o.order_status].label}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      📦 {fmtDate(o.delivery_date)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tabela desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Produto</th>
                    <th className="px-4 py-3 text-right">Venda</th>
                    <th className="px-4 py-3 text-right">Lucro</th>
                    <th className="px-4 py-3 text-left">Pagto</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Entrega</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => {
                    const total = o.price_cents * o.quantity;
                    const profit = (o.price_cents - o.cost_cents) * o.quantity;
                    return (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-500">#{String(o.order_number).padStart(3, "0")}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{o.customer_name}</div>
                          {o.customer_city && <div className="text-xs text-gray-500">{o.customer_city}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{o.product_name}</div>
                          {o.quantity > 1 && <div className="text-xs text-gray-500">qtd: {o.quantity}</div>}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{fmtCurrency(total)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${profit > 0 ? "text-green-700" : "text-gray-500"}`}>
                          {fmtCurrency(profit)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${PAYMENT_LABELS[o.payment_status].cls}`}>
                            {PAYMENT_LABELS[o.payment_status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_LABELS[o.order_status].cls}`}>
                            {STATUS_LABELS[o.order_status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <div>{fmtDate(o.delivery_date)}</div>
                          <div className="text-gray-500">{DELIVERY_LABELS[o.delivery_type]}</div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button onClick={() => setEditing(o)} className="text-gray-400 hover:text-pink-600 p-1" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(o.id)} className="text-gray-400 hover:text-red-600 p-1" title="Remover">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {(creating || editing) && (
        <OrderForm
          order={editing}
          products={products}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// ─── Aba 2: Por produto ──────────────────────────────────────────────────────

function GroupedTab() {
  const [grouped, setGrouped] = useState<ProductGrouped[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/physical-orders/summary?grouped=1`)
      .then((r) => r.json())
      .then((d) => {
        setGrouped(d.grouped || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">Carregando...</div>;
  if (grouped.length === 0)
    return <div className="bg-white rounded-xl p-12 text-center text-gray-500">Nenhum pedido ainda.</div>;

  return (
    <>
      {/* Cards mobile */}
      <div className="md:hidden space-y-3">
        {grouped.map((g) => {
          const margin = g.total_revenue_cents > 0 ? (g.total_profit_cents / g.total_revenue_cents) * 100 : 0;
          return (
            <div key={(g.product_id ?? "null") + g.product_name} className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold text-gray-900 mb-3">{g.product_name}</div>
              <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                <div>
                  <div className="text-xs text-gray-500">Pedidos</div>
                  <div className="font-semibold">{g.order_count}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Qtd</div>
                  <div className="font-semibold">{g.total_quantity}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Margem</div>
                  <div className="font-semibold">{margin.toFixed(1)}%</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Receita</div>
                  <div className="font-semibold text-gray-900">{fmtCurrency(g.total_revenue_cents)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Lucro bruto</div>
                  <div className="font-semibold text-green-700">{fmtCurrency(g.total_profit_cents)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-right">Pedidos</th>
                <th className="px-4 py-3 text-right">Qtd total</th>
                <th className="px-4 py-3 text-right">Receita</th>
                <th className="px-4 py-3 text-right">Custo</th>
                <th className="px-4 py-3 text-right">Lucro bruto</th>
                <th className="px-4 py-3 text-right">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grouped.map((g) => {
                const margin = g.total_revenue_cents > 0 ? (g.total_profit_cents / g.total_revenue_cents) * 100 : 0;
                return (
                  <tr key={(g.product_id ?? "null") + g.product_name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{g.product_name}</td>
                    <td className="px-4 py-3 text-right">{g.order_count}</td>
                    <td className="px-4 py-3 text-right">{g.total_quantity}</td>
                    <td className="px-4 py-3 text-right">{fmtCurrency(g.total_revenue_cents)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{fmtCurrency(g.total_cost_cents)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">{fmtCurrency(g.total_profit_cents)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{margin.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Aba 3: Produtos cadastrados ─────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/admin/products?includeInactive=1`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Desativar este produto? (não remove dos pedidos antigos)")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {products.filter((p) => p.active).length} ativos · {products.filter((p) => !p.active).length} inativos
        </p>
        <button
          onClick={() => setCreating(true)}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 inline-flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Novo produto
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">Carregando...</div>
      ) : (
        <>
          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {products.map((p) => {
              const profit = p.default_price_cents - p.default_cost_cents;
              return (
                <button
                  key={p.id}
                  onClick={() => setEditing(p)}
                  className={`block w-full bg-white rounded-xl shadow-sm p-4 text-left active:bg-gray-50 ${!p.active ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="font-semibold text-gray-900 flex-1">{p.name}</div>
                    {p.active ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 shrink-0">Ativo</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 shrink-0">Inativo</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Custo</div>
                      <div className="font-medium text-gray-700">{fmtCurrency(p.default_cost_cents)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Venda</div>
                      <div className="font-medium text-gray-900">{fmtCurrency(p.default_price_cents)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Lucro</div>
                      <div className={`font-semibold ${profit > 0 ? "text-green-700" : "text-gray-500"}`}>{fmtCurrency(profit)}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tabela desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-right">Custo padrão</th>
                  <th className="px-4 py-3 text-right">Venda padrão</th>
                  <th className="px-4 py-3 text-right">Lucro</th>
                  <th className="px-4 py-3 text-center">Ativo</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const profit = p.default_price_cents - p.default_cost_cents;
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 ${!p.active ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{fmtCurrency(p.default_cost_cents)}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{fmtCurrency(p.default_price_cents)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${profit > 0 ? "text-green-700" : "text-gray-500"}`}>
                        {fmtCurrency(profit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.active ? (
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Ativo</span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">Inativo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => setEditing(p)} className="text-gray-400 hover:text-pink-600 p-1">
                          <Edit2 size={16} />
                        </button>
                        {p.active && (
                          <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600 p-1">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(creating || editing) && (
        <ProductForm
          product={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function KPICard({
  icon: Icon,
  label,
  value,
  highlight,
  warn,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${highlight ? "border-2 border-pink-200" : ""}`}>
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
        <Icon size={14} /> {label}
      </div>
      <div className={`text-2xl font-bold ${highlight ? "text-pink-600" : warn ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}

// Formulário de pedido (criar/editar)

function OrderForm({
  order,
  products,
  onClose,
  onSaved,
}: {
  order: PhysicalOrder | null;
  products: AdminProduct[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    customerName: order?.customer_name ?? "",
    customerPhone: order?.customer_phone ?? "",
    customerCity: order?.customer_city ?? "",
    productId: order?.product_id ?? "",
    productName: order?.product_name ?? "",
    quantity: order?.quantity ?? 1,
    costCents: order?.cost_cents ?? 0,
    priceCents: order?.price_cents ?? 0,
    productionDays: order?.production_days ?? null,
    orderDate: order?.order_date.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    deliveryDate: order?.delivery_date?.slice(0, 10) ?? "",
    deliveryType: order?.delivery_type ?? "outro" as DeliveryType,
    paymentStatus: order?.payment_status ?? "pendente" as PaymentStatus,
    orderStatus: order?.order_status ?? "novo" as OrderStatus,
    notes: order?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  // Quando seleciona produto do catálogo, preenche nome e preços
  const onProductChange = (id: string) => {
    if (!id) {
      setForm({ ...form, productId: "" });
      return;
    }
    const p = products.find((x) => x.id === id);
    if (p) {
      setForm({
        ...form,
        productId: id,
        productName: p.name,
        costCents: p.default_cost_cents,
        priceCents: p.default_price_cents,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      productId: form.productId || null,
      customerPhone: form.customerPhone || null,
      customerCity: form.customerCity || null,
      deliveryDate: form.deliveryDate || null,
      productionDays: form.productionDays || null,
      notes: form.notes || null,
    };
    const url = order ? `/api/admin/physical-orders/${order.id}` : `/api/admin/physical-orders`;
    const method = order ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Erro ao salvar pedido.");
  };

  const total = form.priceCents * form.quantity;
  const profit = (form.priceCents - form.costCents) * form.quantity;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:p-4 justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white sm:rounded-2xl rounded-t-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-xl"
      >
        <div className="flex items-center justify-between sticky top-0 bg-white -mx-4 px-4 -mt-4 pt-4 sm:-mx-6 sm:px-6 sm:-mt-6 sm:pt-6 pb-2 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {order ? `Pedido #${String(order.order_number).padStart(3, "0")}` : "Novo pedido físico"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mr-1">
            <X size={22} />
          </button>
        </div>

        {/* Cliente */}
        <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Nome do cliente *" required>
            <input
              type="text"
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </Field>
          <Field label="Telefone">
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </Field>
          <Field label="Cidade">
            <input
              type="text"
              value={form.customerCity}
              onChange={(e) => setForm({ ...form, customerCity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </Field>
        </fieldset>

        {/* Produto */}
        <fieldset className="space-y-3 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Produto do catálogo (opcional)">
              <select
                value={form.productId}
                onChange={(e) => onProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">— Avulso (digite o nome abaixo) —</option>
                {products.filter((p) => p.active).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Nome do produto *" required>
              <input
                type="text"
                required
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Quantidade">
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value || "1") })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Custo unit. (R$)">
              <input
                type="text"
                inputMode="decimal"
                value={formatPriceInput(form.costCents)}
                onChange={(e) => setForm({ ...form, costCents: parsePriceInput(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Venda unit. (R$)">
              <input
                type="text"
                inputMode="decimal"
                value={formatPriceInput(form.priceCents)}
                onChange={(e) => setForm({ ...form, priceCents: parsePriceInput(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Produção (dias)">
              <input
                type="number"
                min={0}
                value={form.productionDays ?? ""}
                onChange={(e) => setForm({ ...form, productionDays: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
          </div>
          {/* Resumo financeiro */}
          <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 text-sm">
            <div><span className="text-gray-500">Total venda:</span> <strong>{fmtCurrency(total)}</strong></div>
            <div><span className="text-gray-500">Total custo:</span> <strong>{fmtCurrency(form.costCents * form.quantity)}</strong></div>
            <div className={profit > 0 ? "text-green-700" : "text-gray-700"}>
              <span className="text-gray-500">Lucro bruto:</span> <strong>{fmtCurrency(profit)}</strong>
            </div>
          </div>
        </fieldset>

        {/* Entrega + status */}
        <fieldset className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t pt-4">
          <Field label="Data do pedido">
            <input
              type="date"
              value={form.orderDate}
              onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </Field>
          <Field label="Data de entrega">
            <input
              type="date"
              value={form.deliveryDate}
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </Field>
          <Field label="Tipo de entrega">
            <select
              value={form.deliveryType}
              onChange={(e) => setForm({ ...form, deliveryType: e.target.value as DeliveryType })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="entrega-canoas">Entrega Canoas</option>
              <option value="mercado-envios">Mercado Envios</option>
              <option value="retirada">Retirada</option>
              <option value="outro">Outro</option>
            </select>
          </Field>
          <Field label="Status do pagamento">
            <select
              value={form.paymentStatus}
              onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="pago">Pago</option>
              <option value="reserva-30">Reserva 30%</option>
              <option value="pendente">Pendente</option>
            </select>
          </Field>
          <Field label="Status do pedido">
            <select
              value={form.orderStatus}
              onChange={(e) => setForm({ ...form, orderStatus: e.target.value as OrderStatus })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="novo">Novo</option>
              <option value="em-producao">Em produção</option>
              <option value="pronto">Pronto</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </Field>
        </fieldset>

        <Field label="Observações">
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Personalização, observações da entrega, etc"
          />
        </Field>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 border-t sticky bottom-0 bg-white -mx-4 px-4 sm:-mx-6 sm:px-6 -mb-4 pb-4 sm:-mb-6 sm:pb-6">
          <button type="button" onClick={onClose} className="px-4 py-3 sm:py-2 text-gray-600 hover:text-gray-900">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 sm:py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : order ? "Salvar alterações" : "Criar pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Formulário de produto (criar/editar)

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    defaultCostCents: product?.default_cost_cents ?? 0,
    defaultPriceCents: product?.default_price_cents ?? 0,
    active: product?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const url = product ? `/api/admin/products/${product.id}` : `/api/admin/products`;
    const method = product ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Erro ao salvar produto.");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:p-4 justify-center">
      <form onSubmit={handleSubmit} className="bg-white sm:rounded-2xl rounded-t-2xl max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{product ? "Editar produto" : "Novo produto"}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mr-1">
            <X size={22} />
          </button>
        </div>

        <Field label="Nome *" required>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Custo padrão (R$)">
            <input
              type="text"
              inputMode="decimal"
              value={formatPriceInput(form.defaultCostCents)}
              onChange={(e) => setForm({ ...form, defaultCostCents: parsePriceInput(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </Field>
          <Field label="Venda padrão (R$)">
            <input
              type="text"
              inputMode="decimal"
              value={formatPriceInput(form.defaultPriceCents)}
              onChange={(e) => setForm({ ...form, defaultPriceCents: parsePriceInput(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Produto ativo (aparece no seletor de pedidos)
        </label>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t">
          <button type="button" onClick={onClose} className="px-4 py-3 sm:py-2 text-gray-600 hover:text-gray-900">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 sm:py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : product ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
