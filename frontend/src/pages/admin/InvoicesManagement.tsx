import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/Navbar/AdminNavbar';
import { invoiceService, Invoice, InvoiceFilters } from '../../services/invoiceService';
import { FileText, Filter, Download, Search, Calendar } from 'lucide-react';

const InvoicesManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    page_size: 20,
  });

  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getInvoicesAdmin(filters);
      setInvoices(response.results);
      setTotalPages(Math.ceil(response.count / (filters.page_size || 20)));
    } catch (error) {
      console.error('Error loading invoices:', error);
      alert('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof InvoiceFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filters change
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
    });
    setCurrentPage(1);
  };

  const viewInvoiceDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      online: 'Web',
      in_store: 'Tienda',
      phone: 'Teléfono',
    };
    return labels[type] || type;
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      sent: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Pagada',
      sent: 'Enviada',
      draft: 'Borrador',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  return (
    <AdminNavbar>
    <>
     
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
                GESTIÓN DE FACTURAS
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualiza todas las facturas de los clientes con filtros avanzados
              </p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-black transition-colors"
            >
              <Filter size={16} />
              <span className="text-sm font-medium">Filtros</span>
            </button>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-semibold text-black uppercase mb-4">
                Filtrar Facturas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro por canal */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Canal de Venta
                  </label>
                  <select
                    value={filters.order_type || ''}
                    onChange={(e) => handleFilterChange('order_type', e.target.value || undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                  >
                    <option value="">Todos</option>
                    <option value="online">Web</option>
                    <option value="in_store">Tienda</option>
                    <option value="phone">Teléfono</option>
                  </select>
                </div>

                {/* Filtro por tipo de pago */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de Pago
                  </label>
                  <select
                    value={filters.payment_type || ''}
                    onChange={(e) => handleFilterChange('payment_type', e.target.value || undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                  >
                    <option value="">Todos</option>
                    <option value="cash">Efectivo</option>
                    <option value="stripe">Tarjeta (Stripe)</option>
                    <option value="qr_code">Código QR</option>
                    <option value="bank_transfer">Transferencia</option>
                  </select>
                </div>

                {/* Filtro por fecha desde */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>

                {/* Filtro por fecha hasta */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>

                {/* Filtro por estado */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                  >
                    <option value="">Todos</option>
                    <option value="paid">Pagada</option>
                    <option value="sent">Enviada</option>
                    <option value="draft">Borrador</option>
                    <option value="overdue">Vencida</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm border border-gray-300 hover:border-black transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Tabla de facturas */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No se encontraron facturas</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">
                          Nro. Factura
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">
                          Canal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">
                          Método Pago
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-black">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{invoice.customer_name}</div>
                              <div className="text-xs text-gray-500">{invoice.customer_email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              {getOrderTypeLabel(invoice.order_type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {invoice.payments.length > 0 ? (
                              <div>
                                {invoice.payments.map((p, idx) => (
                                  <div key={idx} className="text-xs">
                                    {p.payment_method}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-black">
                            ${parseFloat(invoice.total_amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(invoice.created_at).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(invoice.status)}`}>
                              {getStatusLabel(invoice.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => viewInvoiceDetail(invoice)}
                              className="text-black hover:text-gray-700 font-medium"
                            >
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-300 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDetailModal(false)}
          />
          
          <div className="relative bg-white rounded-xl border border-gray-300 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black uppercase">
                Factura {selectedInvoice.invoice_number}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del cliente */}
              <div>
                <h3 className="text-sm font-semibold text-black uppercase mb-3">
                  Cliente
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Nombre</p>
                      <p className="text-sm font-medium">{selectedInvoice.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{selectedInvoice.customer_email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de la orden */}
              <div>
                <h3 className="text-sm font-semibold text-black uppercase mb-3">
                  Información de la Orden
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Orden</p>
                      <p className="text-sm font-medium">{selectedInvoice.order_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Canal</p>
                      <p className="text-sm font-medium">{selectedInvoice.order_type_display}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedInvoice.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    {selectedInvoice.shipping_method_name && (
                      <div>
                        <p className="text-xs text-gray-500">Método de Envío</p>
                        <p className="text-sm font-medium">{selectedInvoice.shipping_method_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="text-sm font-semibold text-black uppercase mb-3">
                  Productos
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-black">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-black">SKU</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-black">Cantidad</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-black">P. Unitario</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-black">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.order_items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <div className="font-medium">{item.product_name}</div>
                              {item.variant_details && Object.keys(item.variant_details).length > 0 && (
                                <div className="text-xs text-gray-500">
                                  {item.variant_details.size && `Talla: ${item.variant_details.size}`}
                                  {item.variant_details.color && ` - Color: ${item.variant_details.color}`}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.product_sku}</td>
                          <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-right">${parseFloat(item.total_price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Información de pago */}
              <div>
                <h3 className="text-sm font-semibold text-black uppercase mb-3">
                  Información de Pago
                </h3>
                <div className="space-y-3">
                  {selectedInvoice.payments.map((payment, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Método</p>
                          <p className="text-sm font-medium">{payment.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Monto</p>
                          <p className="text-sm font-medium">${parseFloat(payment.amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Estado</p>
                          <p className="text-sm font-medium capitalize">{payment.status}</p>
                        </div>
                        {payment.transaction_id && (
                          <div>
                            <p className="text-xs text-gray-500">ID Transacción</p>
                            <p className="text-xs font-mono">{payment.transaction_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="border-t border-gray-300 pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos:</span>
                    <span className="font-medium">${parseFloat(selectedInvoice.tax_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                    <span>Total:</span>
                    <span>${parseFloat(selectedInvoice.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    </AdminNavbar>
  );
};

export default InvoicesManagement;
