import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/Navbar/AdminNavbar';
import {
  Save,
  Mail,
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  TestTube,
  Eye,
  EyeOff,
  Send,
  FileText,
  Users
} from 'lucide-react';
import {
  notificationService,
  NotificationSettings as INotificationSettings
} from '../../services/notificationService';

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<INotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Estados para Broadcast Email
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    recipients: '',
    subject: '',
    message: '',
    is_html: false
  });
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  // Estados para Daily Report
  const [sendingReport, setSendingReport] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    resend_api_key: '',
    from_email: '',
    from_name: 'SPORTSWEAR',
    admin_email: '',
    enable_order_confirmation: true,
    enable_payment_notifications: true,
    enable_low_stock_alerts: true,
    enable_daily_reports: true,
    daily_report_time: '20:00:00',
    low_stock_threshold: 10
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getSettings();
      setSettings(data);
      setFormData({
        resend_api_key: '',
        from_email: data.from_email,
        from_name: data.from_name,
        admin_email: data.admin_email,
        enable_order_confirmation: data.enable_order_confirmation,
        enable_payment_notifications: data.enable_payment_notifications,
        enable_low_stock_alerts: data.enable_low_stock_alerts,
        enable_daily_reports: data.enable_daily_reports,
        daily_report_time: data.daily_report_time,
        low_stock_threshold: data.low_stock_threshold
      });
    } catch (error: any) {
      console.error('Error loading settings:', error);
      alert(error.response?.data?.detail || 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    // Validaciones
    if (!formData.admin_email) {
      alert('El email del administrador es obligatorio');
      return;
    }

    if (!formData.from_email) {
      alert('El email de remitente es obligatorio');
      return;
    }

    setSaving(true);
    try {
      // Solo enviar la API key si fue modificada
      const dataToSend = { ...formData };
      if (!dataToSend.resend_api_key) {
        delete dataToSend.resend_api_key;
      }

      await notificationService.updateSettings(settings.id, dataToSend);
      alert('✓ Configuración guardada exitosamente');
      loadSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(error.response?.data?.detail || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await notificationService.testConnection();
      setTestResult({
        success: result.success,
        message: result.message
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || 'Error al probar la conexión'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSendBroadcast = async () => {
    // Validaciones
    if (!broadcastData.recipients.trim()) {
      alert('Debes ingresar al menos un destinatario');
      return;
    }
    if (!broadcastData.subject.trim()) {
      alert('El asunto es obligatorio');
      return;
    }
    if (!broadcastData.message.trim()) {
      alert('El mensaje es obligatorio');
      return;
    }

    setSendingBroadcast(true);
    setBroadcastResult(null);

    try {
      // Convertir la lista de emails separados por comas en array
      const recipientsList = broadcastData.recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const result = await notificationService.sendBroadcastEmail({
        recipients: recipientsList,
        subject: broadcastData.subject,
        message: broadcastData.message,
        is_html: broadcastData.is_html
      });

      setBroadcastResult(result);
      
      // Limpiar formulario si fue exitoso
      if (result.success) {
        setBroadcastData({
          recipients: '',
          subject: '',
          message: '',
          is_html: false
        });
      }
    } catch (error: any) {
      setBroadcastResult({
        success: false,
        message: error.response?.data?.error || 'Error al enviar emails',
        results: null
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleSendDailyReport = async () => {
    setSendingReport(true);
    setReportResult(null);

    try {
      const result = await notificationService.sendDailyReport();
      setReportResult({
        success: true,
        message: result.message || 'Reporte enviado exitosamente'
      });
    } catch (error: any) {
      setReportResult({
        success: false,
        message: error.response?.data?.error || 'Error al enviar reporte'
      });
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="animate-spin" size={24} />
            <span className="text-lg">Cargando configuración...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <AdminNavbar>
    <>
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CONFIGURACIÓN DE NOTIFICACIONES
            </h1>
            <p className="text-gray-600">
              Gestiona los emails automáticos y notificaciones del sistema
            </p>
          </div>

          {/* Email Configuration Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-black rounded-lg">
                <Mail className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Configuración de Email
                </h2>
                <p className="text-sm text-gray-500">
                  Configura Resend para envío de emails
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Resend API Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resend API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.resend_api_key}
                    onChange={(e) =>
                      setFormData({ ...formData, resend_api_key: e.target.value })
                    }
                    placeholder="re_xxxxxxxxxxxxx (dejar vacío para no cambiar)"
                    className="w-full px-4 py-2.5 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Obtén tu API key en{' '}
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black font-semibold hover:underline"
                  >
                    resend.com/api-keys
                  </a>
                </p>
              </div>

              {/* From Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Remitente *
                  </label>
                  <input
                    type="email"
                    value={formData.from_email}
                    onChange={(e) =>
                      setFormData({ ...formData, from_email: e.target.value })
                    }
                    placeholder="noreply@sportswear.com"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Remitente
                  </label>
                  <input
                    type="text"
                    value={formData.from_name}
                    onChange={(e) =>
                      setFormData({ ...formData, from_name: e.target.value })
                    }
                    placeholder="SPORTSWEAR"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email del Administrador *
                </label>
                <input
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) =>
                    setFormData({ ...formData, admin_email: e.target.value })
                  }
                  placeholder="admin@sportswear.com"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recibirá reportes diarios y alertas de stock
                </p>
              </div>

              {/* Test Connection Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !settings}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>Probando conexión...</span>
                    </>
                  ) : (
                    <>
                      <TestTube size={16} />
                      <span>PROBAR CONEXIÓN</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div
                    className={`mt-4 p-4 rounded-lg border ${
                      testResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {testResult.success ? (
                        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                      ) : (
                        <XCircle className="text-red-600 flex-shrink-0" size={20} />
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            testResult.success ? 'text-green-900' : 'text-red-900'
                          }`}
                        >
                          {testResult.success ? 'Conexión Exitosa' : 'Error de Conexión'}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            testResult.success ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification Toggles Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-black rounded-lg">
                <Bell className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Tipos de Notificaciones
                </h2>
                <p className="text-sm text-gray-500">
                  Activa o desactiva notificaciones específicas
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Order Confirmation */}
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    Confirmación de Compra
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Enviar email al cliente cuando realiza una compra
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enable_order_confirmation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enable_order_confirmation: e.target.checked
                    })
                  }
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                />
              </label>

              {/* Payment Notifications */}
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    Notificaciones de Pago
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Enviar email cuando se recibe una cuota de pago
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enable_payment_notifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enable_payment_notifications: e.target.checked
                    })
                  }
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                />
              </label>

              {/* Low Stock Alerts */}
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    Alertas de Stock Bajo
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Enviar alerta al administrador cuando el stock sea bajo
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enable_low_stock_alerts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enable_low_stock_alerts: e.target.checked
                    })
                  }
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                />
              </label>

              {/* Daily Reports */}
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Reportes Diarios</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Enviar reporte de ventas diario al administrador
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enable_daily_reports}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enable_daily_reports: e.target.checked
                    })
                  }
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Additional Settings Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-black rounded-lg">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Configuración Adicional
                </h2>
                <p className="text-sm text-gray-500">Ajustes de horarios y umbrales</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Daily Report Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hora de Reporte Diario
                </label>
                <input
                  type="time"
                  value={formData.daily_report_time.substring(0, 5)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_report_time: e.target.value + ':00'
                    })
                  }
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hora en que se enviará el reporte diario
                </p>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Umbral de Stock Bajo
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.low_stock_threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      low_stock_threshold: parseInt(e.target.value)
                    })
                  }
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad mínima antes de alertar
                </p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1 text-sm text-blue-900">
                <p className="font-semibold mb-2">Información Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    La API key de Resend solo debe ingresarse si deseas cambiarla
                  </li>
                  <li>El plan gratuito de Resend incluye 3,000 emails/mes</li>
                  <li>
                    Asegúrate de verificar tu dominio en Resend para mejor
                    deliverability
                  </li>
                  <li>Los reportes diarios se envían automáticamente a la hora configurada</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Broadcast Email Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-black rounded-lg">
                <Users className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Envío de Email Masivo
                </h2>
                <p className="text-sm text-gray-500">
                  Envía un email personalizado a múltiples destinatarios
                </p>
              </div>
              <button
                onClick={() => setShowBroadcastModal(!showBroadcastModal)}
                className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
              >
                <Send size={16} />
                ENVIAR EMAIL
              </button>
            </div>

            {showBroadcastModal && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destinatarios (separados por comas) *
                  </label>
                  <textarea
                    value={broadcastData.recipients}
                    onChange={(e) =>
                      setBroadcastData({ ...broadcastData, recipients: e.target.value })
                    }
                    placeholder="email1@example.com, email2@example.com"
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={broadcastData.subject}
                    onChange={(e) =>
                      setBroadcastData({ ...broadcastData, subject: e.target.value })
                    }
                    placeholder="Asunto del email"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    value={broadcastData.message}
                    onChange={(e) =>
                      setBroadcastData({ ...broadcastData, message: e.target.value })
                    }
                    placeholder="Escribe tu mensaje aquí..."
                    rows={6}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={broadcastData.is_html}
                    onChange={(e) =>
                      setBroadcastData({ ...broadcastData, is_html: e.target.checked })
                    }
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">
                    El mensaje contiene HTML personalizado
                  </span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowBroadcastModal(false);
                      setBroadcastResult(null);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleSendBroadcast}
                    disabled={sendingBroadcast}
                    className="flex items-center gap-2 px-6 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingBroadcast ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        <span>ENVIANDO...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>ENVIAR AHORA</span>
                      </>
                    )}
                  </button>
                </div>

                {broadcastResult && (
                  <div
                    className={`p-4 rounded-lg border ${
                      broadcastResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {broadcastResult.success ? (
                        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                      ) : (
                        <XCircle className="text-red-600 flex-shrink-0" size={20} />
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            broadcastResult.success ? 'text-green-900' : 'text-red-900'
                          }`}
                        >
                          {broadcastResult.message}
                        </p>
                        {broadcastResult.results && (
                          <div className="text-sm mt-2">
                            <p className="text-green-700">
                              ✓ Exitosos: {broadcastResult.results.success?.length || 0}
                            </p>
                            <p className="text-red-700">
                              ✗ Fallidos: {broadcastResult.results.failed?.length || 0}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Daily Report Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <FileText className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Reporte Diario de Ventas
                </h2>
                <p className="text-sm text-gray-500">
                  Enviar manualmente el reporte de ventas del día al administrador
                </p>
              </div>
              <button
                onClick={handleSendDailyReport}
                disabled={sendingReport}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingReport ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    <span>ENVIANDO...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>ENVIAR REPORTE</span>
                  </>
                )}
              </button>
            </div>

            {reportResult && (
              <div
                className={`mt-4 p-4 rounded-lg border ${
                  reportResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {reportResult.success ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={20} />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        reportResult.success ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {reportResult.success ? 'Reporte Enviado' : 'Error al Enviar'}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        reportResult.success ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {reportResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !settings}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>GUARDANDO...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>GUARDAR CONFIGURACIÓN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
    </AdminNavbar>
  );
};

export default NotificationSettingsPage;
