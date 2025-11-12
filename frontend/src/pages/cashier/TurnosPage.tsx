import React, { useState, useEffect } from 'react';
import {
  Clock,
  DollarSign,
  CreditCard,
  QrCode,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer
} from 'lucide-react';
import { cashierService, Shift } from '../../services/cashierService';
import { useAuth } from '../../contexts/AuthContext';

const TurnosPage: React.FC = () => {
  const { user } = useAuth();
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [initialCash, setInitialCash] = useState('');
  const [finalCash, setFinalCash] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shift, history] = await Promise.all([
        cashierService.getActiveShift(),
        cashierService.getShiftHistory()
      ]);
      setActiveShift(shift);
      setShiftHistory(history);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartShift = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const shift = await cashierService.startShift({
        cashier_id: user.id,
        initial_cash: parseFloat(initialCash) || 0
      });
      setActiveShift(shift);
      setShowStartModal(false);
      setInitialCash('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al iniciar turno');
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    setLoading(true);
    try {
      const shift = await cashierService.endShift({
        shift_id: activeShift.id,
        final_cash: parseFloat(finalCash) || 0
      });
      setActiveShift(null);
      setShiftHistory([shift, ...shiftHistory]);
      setShowEndModal(false);
      setFinalCash('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cerrar turno');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
            GESTIÓN DE TURNOS
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Administra el inicio y cierre de turnos de caja
          </p>
        </div>

        {/* Active Shift Section */}
        <div className="mb-6">
          {activeShift ? (
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold uppercase tracking-wider">
                      TURNO ACTIVO
                    </h2>
                    <p className="text-sm text-gray-600">
                      Iniciado: {new Date(activeShift.start_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEndModal(true)}
                  className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-red-700"
                >
                  Cerrar Turno
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock size={16} />
                    <span className="text-xs font-semibold uppercase">Duración</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatDuration(activeShift.start_time)}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <TrendingUp size={16} />
                    <span className="text-xs font-semibold uppercase">Ventas</span>
                  </div>
                  <p className="text-2xl font-bold">{activeShift.sales_count || 0}</p>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <DollarSign size={16} />
                    <span className="text-xs font-semibold uppercase">Efectivo Inicial</span>
                  </div>
                  <p className="text-2xl font-bold">${activeShift.initial_cash.toFixed(2)}</p>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <DollarSign size={16} />
                    <span className="text-xs font-semibold uppercase">Total Ventas</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${(activeShift.sales_summary?.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              {activeShift.sales_summary && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <DollarSign size={16} />
                      <span className="text-xs font-semibold uppercase">Efectivo</span>
                    </div>
                    <p className="text-xl font-bold text-green-700">
                      ${activeShift.sales_summary.cash.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <CreditCard size={16} />
                      <span className="text-xs font-semibold uppercase">Tarjeta</span>
                    </div>
                    <p className="text-xl font-bold text-blue-700">
                      ${activeShift.sales_summary.card.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                      <QrCode size={16} />
                      <span className="text-xs font-semibold uppercase">QR</span>
                    </div>
                    <p className="text-xl font-bold text-purple-700">
                      ${activeShift.sales_summary.qr.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <Clock size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No hay turno activo</h3>
              <p className="text-sm text-gray-600 mb-6">
                Inicia un nuevo turno para comenzar a registrar ventas
              </p>
              <button
                onClick={() => setShowStartModal(true)}
                className="px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-900"
              >
                Iniciar Turno
              </button>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-lg font-semibold uppercase tracking-wider mb-4">
            HISTORIAL DE TURNOS
          </h2>

          {shiftHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-3" />
              <p className="text-sm">No hay turnos anteriores</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shiftHistory.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-gray-50 border border-gray-300 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          shift.status === 'closed' 
                            ? 'bg-gray-200 text-gray-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {shift.status === 'closed' ? <CheckCircle size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold">{shift.cashier_name}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(shift.start_time).toLocaleDateString()} • {formatDuration(shift.start_time, shift.end_time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-right">
                      <div>
                        <p className="text-xs text-gray-600">Ventas</p>
                        <p className="font-semibold">{shift.sales_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="font-semibold">${(shift.sales_summary?.total || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Diferencia</p>
                        <p className={`font-semibold ${
                          (shift.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${Math.abs(shift.difference || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start Shift Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-6">
              INICIAR TURNO
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Efectivo inicial en caja
              </label>
              <input
                type="number"
                step="0.01"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                placeholder="0.00"
                autoFocus
              />
              <p className="text-xs text-gray-600 mt-2">
                Ingresa la cantidad de efectivo con la que inicias tu turno
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 px-4 py-3 text-sm font-semibold uppercase border border-gray-300 hover:border-black rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartShift}
                disabled={!initialCash || loading}
                className="flex-1 px-4 py-3 text-sm font-semibold uppercase bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
              >
                Iniciar Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Shift Modal */}
      {showEndModal && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-6">
              CERRAR TURNO
            </h2>

            {/* Summary */}
            <div className="mb-6 space-y-3">
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Duración del turno</p>
                <p className="text-lg font-bold">{formatDuration(activeShift.start_time)}</p>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Ventas realizadas</p>
                <p className="text-lg font-bold">{activeShift.sales_count || 0}</p>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Total en efectivo esperado</p>
                <p className="text-lg font-bold">
                  ${((activeShift.initial_cash || 0) + (activeShift.sales_summary?.cash || 0)).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Efectivo final en caja
              </label>
              <input
                type="number"
                step="0.01"
                value={finalCash}
                onChange={(e) => setFinalCash(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                placeholder="0.00"
                autoFocus
              />
              <p className="text-xs text-gray-600 mt-2">
                Cuenta el efectivo físico y registra el total
              </p>
            </div>

            {finalCash && (
              <div className={`mb-6 border rounded-lg p-4 ${
                Math.abs(
                  parseFloat(finalCash) - 
                  ((activeShift.initial_cash || 0) + (activeShift.sales_summary?.cash || 0))
                ) < 0.01
                  ? 'bg-green-50 border-green-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <p className="text-xs font-semibold mb-1">Diferencia</p>
                <p className="text-lg font-bold">
                  ${(
                    parseFloat(finalCash) - 
                    ((activeShift.initial_cash || 0) + (activeShift.sales_summary?.cash || 0))
                  ).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 px-4 py-3 text-sm font-semibold uppercase border border-gray-300 hover:border-black rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleEndShift}
                disabled={!finalCash || loading}
                className="flex-1 px-4 py-3 text-sm font-semibold uppercase bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Cerrar Turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnosPage;
