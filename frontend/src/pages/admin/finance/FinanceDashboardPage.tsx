import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../../components/admin/Navbar/AdminNavbar';
import { financeService, FinancialSummary, CashFlowItem, AccountBalance } from '../../../services/financeService';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ShoppingCart,
  Store,
  CreditCard,
  Package
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const FinanceDashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowItem[]>([]);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, cashFlowData, balanceData] = await Promise.all([
        financeService.getFinancialSummary(period),
        financeService.getCashFlow(30),
        financeService.getAccountBalance()
      ]);
      
      setSummary(summaryData);
      setCashFlow(cashFlowData);
      setBalance(balanceData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Colores para gráficos
  const COLORS = ['#1a1a1a', '#404040', '#666666', '#999999', '#b3b3b3'];

  if (loading) {
    return (
      <AdminNavbar>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos financieros...</p>
          </div>
        </div>
      </AdminNavbar>
    );
  }

  return (
    <AdminNavbar>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black uppercase tracking-wider">
                Dashboard Financiero
              </h1>
              <p className="text-gray-600 mt-1">Resumen de ingresos y egresos</p>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 bg-white border border-gray-300 rounded-lg p-1">
              {['day', 'week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    period === p
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p === 'day' && 'Hoy'}
                  {p === 'week' && 'Semana'}
                  {p === 'month' && 'Mes'}
                  {p === 'year' && 'Año'}
                </button>
              ))}
            </div>
          </div>

          {/* Balance Actual */}
          {balance && (
            <div className="bg-black text-white rounded-xl p-8 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                    Balance Actual
                  </p>
                  <h2 className="text-4xl font-bold">
                    {formatCurrency(parseFloat(balance.balance))}
                  </h2>
                </div>
                <DollarSign className="w-16 h-16 text-gray-700" />
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Ingresos */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-1">
                  {formatCurrency(summary.total_income)}
                </h3>
                <p className="text-sm text-gray-600">
                  Total de ventas
                </p>
              </div>

              {/* Total Egresos */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Egresos
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-1">
                  {formatCurrency(summary.total_expense)}
                </h3>
                <p className="text-sm text-gray-600">
                  Total de gastos
                </p>
              </div>

              {/* Utilidad Neta */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Utilidad Neta
                  </span>
                </div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.net_profit)}
                </h3>
                <p className="text-sm text-gray-600">
                  Ganancia real
                </p>
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Flujo de Caja */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-4">
                Flujo de Caja (30 días)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Ingresos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Egresos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#1a1a1a" 
                    strokeWidth={2}
                    name="Neto"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gastos por Categoría */}
            {summary && Object.keys(summary.expense_by_category).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-4">
                  Gastos por Categoría
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(summary.expense_by_category).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(summary.expense_by_category).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Revenue Breakdown */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ingresos por Canal */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-4">
                  Ingresos por Canal
                </h3>
                <div className="space-y-4">
                  {Object.entries(summary.income_by_channel).map(([channel, amount]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {channel === 'online' ? (
                          <ShoppingCart className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Store className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {channel === 'online' ? 'Tienda Web' : 'Tienda Física'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-black">
                          {formatCurrency(amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {summary.total_income > 0 
                            ? `${((amount / summary.total_income) * 100).toFixed(1)}%`
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingresos por Método de Pago */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-4">
                  Ingresos por Método de Pago
                </h3>
                <div className="space-y-4">
                  {Object.entries(summary.income_by_payment_method).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {method}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-black">
                          {formatCurrency(amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {summary.total_income > 0 
                            ? `${((amount / summary.total_income) * 100).toFixed(1)}%`
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminNavbar>
  );
};

export default FinanceDashboardPage;
