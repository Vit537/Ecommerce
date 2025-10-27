import React from 'react';

interface InvoiceData {
  id: string;
  order_number: string;
  created_at: string;
  customer: {
    name: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  items: Array<{
    product_name: string;
    variant_info: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: string;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Tienda de Ropa</h1>
          <p className="text-gray-600">Calle Comercio 123</p>
          <p className="text-gray-600">28001 Madrid, España</p>
          <p className="text-gray-600">Tel: +34 912 345 678</p>
          <p className="text-gray-600">email@mitienda.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">FACTURA</h2>
          <p className="text-gray-600"><strong>Nº:</strong> {data.order_number}</p>
          <p className="text-gray-600"><strong>Fecha:</strong> {formatDate(data.created_at)}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8 p-4 bg-gray-50 rounded">
        <h3 className="font-bold text-gray-900 mb-2">Facturar a:</h3>
        <p className="font-medium">{data.customer.name}</p>
        <p className="text-gray-600">{data.customer.email}</p>
        <p className="text-gray-600">{data.customer.address.street}</p>
        <p className="text-gray-600">
          {data.customer.address.city}, {data.customer.address.state}
        </p>
        <p className="text-gray-600">
          {data.customer.address.postal_code}, {data.customer.address.country}
        </p>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left">Descripción</th>
              <th className="border border-gray-300 p-3 text-center">Cantidad</th>
              <th className="border border-gray-300 p-3 text-right">Precio Unitario</th>
              <th className="border border-gray-300 p-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-3">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-600">{item.variant_info}</p>
                  </div>
                </td>
                <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.price)}</td>
                <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-1/3">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>IVA (21%):</span>
            <span>{formatCurrency(data.tax)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold border-t">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-8 p-4 bg-blue-50 rounded">
        <h3 className="font-bold text-gray-900 mb-2">Información de Pago</h3>
        <p><strong>Método de pago:</strong> {data.payment_method}</p>
        <p><strong>Estado:</strong> Pagado</p>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm border-t pt-4">
        <p>Gracias por su compra. Para cualquier consulta, no dude en contactarnos.</p>
        <p className="mt-2">Mi Tienda de Ropa - CIF: B12345678</p>
      </div>
    </div>
  );
};

// Utility function to generate PDF from invoice data
export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<Blob> => {
  // This would typically use a library like jsPDF or Puppeteer
  // For now, we'll create a simple HTML to PDF conversion
  
  const invoiceHTML = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Factura ${invoiceData.order_number}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
          }
          .company-info h1 { 
            color: #1e40af; 
            margin-bottom: 10px; 
          }
          .invoice-info { 
            text-align: right; 
          }
          .customer-info { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 30px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background: #f8f9fa; 
            font-weight: bold; 
          }
          .totals { 
            width: 300px; 
            margin-left: auto; 
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 5px 0; 
          }
          .total-final { 
            border-top: 2px solid #333; 
            font-weight: bold; 
            font-size: 18px; 
            color: #1e40af; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>Mi Tienda de Ropa</h1>
            <p>Calle Comercio 123<br>28001 Madrid, España<br>Tel: +34 912 345 678<br>email@mitienda.com</p>
          </div>
          <div class="invoice-info">
            <h2>FACTURA</h2>
            <p><strong>Nº:</strong> ${invoiceData.order_number}</p>
            <p><strong>Fecha:</strong> ${new Date(invoiceData.created_at).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div class="customer-info">
          <h3>Facturar a:</h3>
          <p><strong>${invoiceData.customer.name}</strong></p>
          <p>${invoiceData.customer.email}</p>
          <p>${invoiceData.customer.address.street}</p>
          <p>${invoiceData.customer.address.city}, ${invoiceData.customer.address.state}</p>
          <p>${invoiceData.customer.address.postal_code}, ${invoiceData.customer.address.country}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: right;">Precio Unitario</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>
                  <strong>${item.product_name}</strong><br>
                  <small style="color: #666;">${item.variant_info}</small>
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.price)}</td>
                <td style="text-align: right;">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(invoiceData.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>IVA (21%):</span>
            <span>${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(invoiceData.tax)}</span>
          </div>
          <div class="total-row total-final">
            <span>Total:</span>
            <span>${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(invoiceData.total)}</span>
          </div>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 30px 0;">
          <h3>Información de Pago</h3>
          <p><strong>Método de pago:</strong> ${invoiceData.payment_method}</p>
          <p><strong>Estado:</strong> Pagado</p>
        </div>

        <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>Gracias por su compra. Para cualquier consulta, no dude en contactarnos.</p>
          <p style="margin-top: 10px;">Mi Tienda de Ropa - CIF: B12345678</p>
        </div>
      </body>
    </html>
  `;

  // Convert HTML to Blob (in a real app, you'd use a proper PDF library)
  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  return blob;
};

export default InvoiceTemplate;