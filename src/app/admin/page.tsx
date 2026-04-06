"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  ShoppingCart, 
  Eye, 
  TrendingUp,
  Package
} from "lucide-react";

interface ProductStats {
  productId: string;
  productName: string;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
}

interface RecentOrder {
  id: string;
  productType: string;
  productName: string;
  customerEmail: string;
  amountCents: number;
  status: string;
  createdAt: string;
  slug: string | null;
}

interface SalesByPeriod {
  date: string;
  totalSales: number;
  totalRevenue: number;
}

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  productStats: ProductStats[];
  recentOrders: RecentOrder[];
  salesByPeriod: SalesByPeriod[];
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/dashboard?days=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-12">
        Erro ao carregar dados
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Visão geral do seu negócio</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Receita Total"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Total de Vendas"
          value={data.totalOrders.toString()}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Visualizações"
          value={data.totalViews.toLocaleString("pt-BR")}
          icon={Eye}
          color="purple"
        />
        <KPICard
          title="Taxa de Conversão"
          value={data.totalViews > 0 
            ? `${((data.totalOrders / data.totalViews) * 100).toFixed(1)}%`
            : "0%"
          }
          icon={TrendingUp}
          color="pink"
        />
      </div>


      {/* Product Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Produto</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produto</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Vendas</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Receita</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Views</th>
              </tr>
            </thead>
            <tbody>
              {data.productStats.map((product) => (
                <tr key={product.productId} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Package size={16} className="text-pink-600" />
                      </div>
                      <span className="font-medium text-gray-900">{product.productName.replace('Paper Bloom Digital - ', '')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">{product.totalSales}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(product.totalRevenue)}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{product.totalViews.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Chart (Simple bar representation) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendas nos últimos {period} dias</h2>
        <div className="h-48 flex items-end gap-1">
          {data.salesByPeriod.slice(-30).map((day, i) => {
            const maxSales = Math.max(...data.salesByPeriod.map(d => d.totalSales), 1);
            const height = (day.totalSales / maxSales) * 100;
            return (
              <div
                key={day.date}
                className="flex-1 bg-pink-200 hover:bg-pink-400 transition-colors rounded-t cursor-pointer group relative"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${day.date}: ${day.totalSales} vendas`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {new Date(day.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}: {day.totalSales} vendas
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Vendas</h2>
        {data.recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma venda ainda</p>
        ) : (
          <div className="space-y-3">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.productName.replace('Paper Bloom Digital - ', '')}</p>
                    <p className="text-sm text-gray-500">{order.customerEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(order.amountCents)}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  color: "green" | "blue" | "purple" | "pink";
}) {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
