/**
 * Servicio para gestión de notificaciones
 */
import { apiService } from './apiService';

// ==================== INTERFACES ====================

export interface NotificationSettings {
  id: number;
  from_email: string;
  from_name: string;
  admin_email: string;
  enable_order_confirmation: boolean;
  enable_payment_notifications: boolean;
  enable_low_stock_alerts: boolean;
  enable_daily_reports: boolean;
  daily_report_time: string;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: number;
  event_type: string;
  event_type_display: string;
  subject: string;
  html_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user?: number;
  user_email?: string;
  user_name?: string;
  notification_type: 'email' | 'system';
  notification_type_display: string;
  event_type: string;
  title: string;
  message: string;
  recipient_email?: string;
  email_id?: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  status_display: string;
  error_message?: string;
  metadata?: Record<string, any>;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export interface UpdateSettingsDTO {
  resend_api_key?: string;
  from_email?: string;
  from_name?: string;
  admin_email?: string;
  enable_order_confirmation?: boolean;
  enable_payment_notifications?: boolean;
  enable_low_stock_alerts?: boolean;
  enable_daily_reports?: boolean;
  daily_report_time?: string;
  low_stock_threshold?: number;
}

// ==================== SERVICIO ====================

class NotificationService {
  private baseUrl = '/notifications';

  // ==================== SETTINGS ====================

  /**
   * Obtiene la configuración actual de notificaciones
   */
  async getSettings(): Promise<NotificationSettings> {
    return apiService.get<NotificationSettings>(`${this.baseUrl}/settings/current/`);
  }

  /**
   * Actualiza la configuración de notificaciones
   */
  async updateSettings(id: number, data: UpdateSettingsDTO): Promise<NotificationSettings> {
    return apiService.put<NotificationSettings>(`${this.baseUrl}/settings/${id}/`, data);
  }

  /**
   * Prueba la conexión con Resend
   */
  async testConnection(): Promise<{ success: boolean; message: string; email_id?: string; error?: string }> {
    return apiService.post<{ success: boolean; message: string; email_id?: string; error?: string }>(
      `${this.baseUrl}/settings/test_connection/`,
      {}
    );
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Obtiene todas las notificaciones (admin) o del usuario actual
   */
  async getNotifications(): Promise<Notification[]> {
    return apiService.get<Notification[]>(`${this.baseUrl}/notifications/`);
  }

  /**
   * Obtiene las notificaciones del usuario actual
   */
  async getMyNotifications(): Promise<Notification[]> {
    return apiService.get<Notification[]>(`${this.baseUrl}/notifications/my_notifications/`);
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   */
  async getUnreadCount(): Promise<{ unread_count: number }> {
    return apiService.get<{ unread_count: number }>(`${this.baseUrl}/notifications/unread_count/`);
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    return apiService.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/notifications/${notificationId}/mark_as_read/`,
      {}
    );
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    return apiService.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/notifications/mark_all_as_read/`,
      {}
    );
  }

  /**
   * Elimina todas las notificaciones leídas
   */
  async clearAll(): Promise<{ success: boolean; message: string }> {
    return apiService.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/notifications/clear_all/`
    );
  }

  // ==================== TEMPLATES ====================

  /**
   * Obtiene todas las plantillas de notificaciones
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    return apiService.get<NotificationTemplate[]>(`${this.baseUrl}/templates/`);
  }

  /**
   * Obtiene una plantilla específica
   */
  async getTemplate(id: number): Promise<NotificationTemplate> {
    return apiService.get<NotificationTemplate>(`${this.baseUrl}/templates/${id}/`);
  }

  /**
   * Actualiza una plantilla de notificación
   */
  async updateTemplate(id: number, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    return apiService.put<NotificationTemplate>(`${this.baseUrl}/templates/${id}/`, data);
  }

  /**
   * Activa o desactiva una plantilla
   */
  async toggleTemplate(id: number, isActive: boolean): Promise<NotificationTemplate> {
    return apiService.patch<NotificationTemplate>(`${this.baseUrl}/templates/${id}/`, {
      is_active: isActive
    });
  }
}

export const notificationService = new NotificationService();
