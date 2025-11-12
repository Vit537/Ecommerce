import React from 'react';
import { AlertCircle, CheckCircle2, Download, Copy } from 'lucide-react';

interface QRPaymentDisplayProps {
  qrImageUrl: string;
  amount: number;
  orderId: string;
  onConfirmPayment: () => void;
  onCancel: () => void;
}

const QRPaymentDisplay: React.FC<QRPaymentDisplayProps> = ({
  qrImageUrl,
  amount,
  orderId,
  onConfirmPayment,
  onCancel
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `qr-pago-orden-${orderId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-t-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Pago con Código QR</h2>
        <p className="text-gray-300">Escanea el código QR para completar tu pago</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-b-2xl shadow-xl p-8">
        {/* Amount Display */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Monto a Pagar</p>
          <p className="text-4xl font-bold text-gray-900">Bs. {amount.toFixed(2)}</p>
        </div>

        {/* QR Code Image */}
        <div className="bg-white border-4 border-gray-200 rounded-2xl p-6 mb-6 flex justify-center">
          <img 
            src={qrImageUrl} 
            alt="Código QR para pago" 
            className="w-full max-w-sm h-auto"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>

        {/* Order ID */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Número de Orden</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{orderId}</p>
            </div>
            <button
              onClick={handleCopyOrderId}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-3">Instrucciones:</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Abre la aplicación de tu banco en tu teléfono</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Selecciona la opción de pago por código QR</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Escanea el código QR mostrado arriba</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Verifica el monto: <strong>Bs. {amount.toFixed(2)}</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">5.</span>
                  <span>Completa el pago en tu aplicación bancaria</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">6.</span>
                  <span>Haz clic en "He Realizado el Pago" una vez completado</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Importante:</p>
              <p>Tu pedido será verificado una vez que procesemos la confirmación del pago. Recibirás un correo electrónico cuando esto suceda.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleDownloadQR}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <Download className="h-5 w-5" />
            Descargar QR
          </button>
          <button
            onClick={onConfirmPayment}
            className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            He Realizado el Pago
          </button>
        </div>

        {/* Cancel Option */}
        <button
          onClick={onCancel}
          className="w-full mt-4 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Cancelar y volver
        </button>
      </div>
    </div>
  );
};

export default QRPaymentDisplay;
