import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../../components/admin/Navbar/AdminNavbar';
import { financeService, Transaction } from '../../../services/financeService';
import { TrendingUp, TrendingDown, Filter } from 'lucide-react';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadTransactions();
  }, [typeFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await financeService.getTransactions(
        typeFilter !== 'all' ? { type: typeFilter as any } : {}
      );
      setTransactions(data.results);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(parseFloat(value));
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      online: 'Tienda Web',
      in_store: 'Tienda Física',
      administrative: 'Administrativo'
    };
    return labels[channel] || channel;
  };

  return (
    <AdminNavbar>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black uppercase tracking-wider">
              Transacciones
            </h1>
            <p className="text-gray-600 mt-1">Historial completo de ingresos y egresos</p>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <div className="flex gap-2">
                {['all', 'income', 'expense'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      typeFilter === type
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type === 'all' && 'Todas'}
                    {type === 'income' && 'Ingresos'}
                    {type === 'expense' && 'Egresos'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Canal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Método de Pago
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {transaction.transaction_type === 'income' ? (
                            <>
                              <TrendingUp className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">Ingreso</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-5 h-5 text-red-600" />
                              <span className="text-sm font-semibold text-red-600">Egreso</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDateTime(transaction.transaction_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.expense_category_name && (
                            <div className="text-xs text-gray-500 mt-1">
                              Categoría: {transaction.expense_category_name}
                            </div>
                          )}
                          {transaction.order_number && (
                            <div className="text-xs text-gray-500 mt-1">
                              Orden: {transaction.order_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {getChannelLabel(transaction.channel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {transaction.payment_method_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          transaction.transaction_type === 'income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminNavbar>
  );
};

export default TransactionsPage;
