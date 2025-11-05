import apiService from './apiService';

// ============================================
// TIPOS Y INTERFACES
// ============================================

export interface DynamicReportRequest {
  prompt: string;
  export_format?: 'pdf' | 'excel';
  include_chart?: boolean;
}

export interface DynamicReportPreviewRequest {
  prompt: string;
  limit?: number;
}

export interface DynamicReportResponse {
  success: boolean;
  report_type: string;
  report_metadata: {
    title: string;
    user: string;
    generated_at: string;
    execution_time: number;
    total_results: number;
    summary: string;
    filters_applied: string[];
  };
  results: any[];
  file_url?: string;
  execution_time: number;
  tokens_used: number;
}

export interface DynamicReportPreviewResponse {
  success: boolean;
  report_type: string;
  explanation: string;
  sql_query: string;
  results_count: number;
  results: any[];
  suggested_chart_type: string;
  filters_applied: string[];
}

export interface ManualReportFilters {
  report_type: 'sales' | 'products' | 'inventory' | 'categories' | 'invoices' | 'employees' | 'customers';
  
  // Filtros de fecha
  year?: number;
  month?: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  start_date?: string;
  end_date?: string;
  
  // Filtros específicos
  category?: string;
  status?: string;
  min_stock?: number;
  max_stock?: number;
  
  // Formato de exportación
  export_format?: 'pdf' | 'excel';
}

export interface ManualReportPreviewResponse {
  success: boolean;
  report_type: string;
  total: number;
  results: any[];
  summary: string;
  filters_applied: string[];
}

export interface ReportHistory {
  id: number;
  user: {
    id: number;
    email: string;
    full_name: string;
  };
  report_type: string;
  input_type: 'text' | 'audio' | 'manual';
  original_prompt: string;
  generated_sql: string;
  results_count: number;
  export_format: 'pdf' | 'excel';
  execution_time: number;
  tokens_used: number;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface ReportHistoryResponse {
  total: number;
  page: number;
  page_size: number;
  results: ReportHistory[];
}

export interface ReportSuggestion {
  title: string;
  description: string;
  prompt: string;
  category: string;
  icon: string;
}

// ============================================
// SERVICIO DE REPORTES
// ============================================

class ReportService {
  private readonly baseUrl = '/reports';

  // ============================================
  // REPORTES DINÁMICOS CON IA
  // ============================================

  /**
   * Generar reporte dinámico con IA (con exportación)
   */
  async generateDynamicReport(data: DynamicReportRequest): Promise<Blob> {
    const formData = new FormData();
    formData.append('prompt', data.prompt);
    formData.append('export_format', data.export_format || 'pdf');
    formData.append('include_chart', String(data.include_chart ?? true));

    const axiosInstance = apiService.getAxiosInstance();
    const response = await axiosInstance.post(
      `${this.baseUrl}/generate/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      }
    );

    return response.data;
  }

  /**
   * Generar reporte dinámico con audio
   */
  async generateDynamicReportWithAudio(
    audioBlob: Blob,
    exportFormat: 'pdf' | 'excel' = 'pdf'
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('export_format', exportFormat);
    formData.append('include_chart', 'true');

    const axiosInstance = apiService.getAxiosInstance();
    const response = await axiosInstance.post(
      `${this.baseUrl}/generate/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      }
    );

    return response.data;
  }

  /**
   * Vista previa de reporte dinámico (sin exportar)
   */
  async previewDynamicReport(
    data: DynamicReportPreviewRequest
  ): Promise<DynamicReportPreviewResponse> {
    return await apiService.post(`${this.baseUrl}/preview/`, data);
  }

  // ============================================
  // REPORTES MANUALES
  // ============================================

  /**
   * Vista previa de reporte manual
   */
  async previewManualReport(
    filters: ManualReportFilters
  ): Promise<ManualReportPreviewResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return await apiService.get(`${this.baseUrl}/manual/preview/?${params.toString()}`);
  }

  /**
   * Generar y descargar reporte manual
   */
  async generateManualReport(filters: ManualReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const axiosInstance = apiService.getAxiosInstance();
    const response = await axiosInstance.get(
      `${this.baseUrl}/manual/generate/?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  }

  // ============================================
  // HISTORIAL Y SUGERENCIAS
  // ============================================

  /**
   * Obtener historial de reportes
   */
  async getReportHistory(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      type?: string;
      success_only?: boolean;
    }
  ): Promise<ReportHistoryResponse> {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });

    if (filters?.type) {
      params.append('type', filters.type);
    }

    if (filters?.success_only) {
      params.append('success_only', 'true');
    }

    return await apiService.get(`${this.baseUrl}/history/?${params.toString()}`);
  }

  /**
   * Obtener sugerencias de reportes
   */
  async getReportSuggestions(): Promise<ReportSuggestion[]> {
    const response = await apiService.get(`${this.baseUrl}/suggestions/`);
    return response.suggestions || [];
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Descargar archivo blob con nombre
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Obtener nombre de archivo según formato
   */
  getFileName(reportType: string, format: 'pdf' | 'excel'): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    return `reporte_${reportType}_${timestamp}.${extension}`;
  }
}

export const reportService = new ReportService();
export default reportService;
