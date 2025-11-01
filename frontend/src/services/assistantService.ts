import axios from 'axios';
import { config } from '../config/env';

const API_URL = `${config.apiUrl}/api`;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggested_actions?: Array<{
    label: string;
    url: string;
    type: string;
    icon?: string;
  }>;
  related_resources?: Array<{
    title: string;
    description: string;
    url: string;
    type: string;
  }>;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  started_at: string;
  last_message_at: string;
  is_active: boolean;
  message_count: number;
  last_message_preview?: {
    role: string;
    content: string;
  };
  messages?: ChatMessage[];
}

export interface QuickAction {
  label: string;
  url: string;
  icon: string;
}

class AssistantService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token disponible en localStorage');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async sendMessage(message: string, conversationId?: string) {
    try {
      const response = await axios.post(
        `${API_URL}/assistant/chat/`,
        {
          message,
          conversation_id: conversationId,
        },
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }

  async getConversations() {
    try {
      const response = await axios.get(`${API_URL}/assistant/conversations/`, {
        headers: this.getAuthHeaders(),
      });
      // El backend devuelve un array directamente, no un objeto con propiedad 'conversations'
      return Array.isArray(response.data) ? response.data : [] as ChatConversation[];
    } catch (error: any) {
      console.error('Error getting conversations:', error.response?.data || error.message);
      return [];
    }
  }

  async getConversation(conversationId: string) {
    try {
      const response = await axios.get(
        `${API_URL}/assistant/conversations/${conversationId}/`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data as ChatConversation;
    } catch (error: any) {
      console.error('Error getting conversation:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteConversation(conversationId: string) {
    try {
      const response = await axios.delete(
        `${API_URL}/assistant/conversations/${conversationId}/delete/`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting conversation:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendFeedback(messageId: string, rating: number, comment?: string) {
    try {
      const response = await axios.post(
        `${API_URL}/assistant/feedback/`,
        {
          message: messageId,
          rating,
          comment: comment || '',
        },
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error sending feedback:', error.response?.data || error.message);
      throw error;
    }
  }

  async getQuickActions() {
    try {
      const response = await axios.get(`${API_URL}/assistant/quick-actions/`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting quick actions:', error.response?.data || error.message);
      return { success: true, role: 'employee', quick_actions: [] };
    }
  }

  async getSuggestions() {
    try {
      const response = await axios.get(`${API_URL}/assistant/suggestions/`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting suggestions:', error.response?.data || error.message);
      return { success: true, role: 'employee', suggestions: [] };
    }
  }
}

export const assistantService = new AssistantService();
