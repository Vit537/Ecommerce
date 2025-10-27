import api from '@/lib/api';
import { isAxiosError } from 'axios';

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
  async sendMessage(message: string, conversationId?: string) {
    try {
      const response = await api.post('/assistant/chat/', {
        message,
        conversation_id: conversationId,
      });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error sending message:', error.response?.data || error.message);
      } else {
        console.error('Error sending message:', (error as Error)?.message || error);
      }
      throw error;
    }
  }

  async getConversations() {
    try {
      const response = await api.get('/assistant/conversations/');
      // El backend devuelve un array directamente
      return Array.isArray(response.data) ? (response.data as ChatConversation[]) : [];
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error getting conversations:', error.response?.data || error.message);
      } else {
        console.error('Error getting conversations:', (error as Error)?.message || error);
      }
      return [];
    }
  }

  async getConversation(conversationId: string) {
    try {
      const response = await api.get(`/assistant/conversations/${conversationId}/`);
      return response.data as ChatConversation;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error getting conversation:', error.response?.data || error.message);
      } else {
        console.error('Error getting conversation:', (error as Error)?.message || error);
      }
      throw error;
    }
  }

  async deleteConversation(conversationId: string) {
    try {
      const response = await api.delete(`/assistant/conversations/${conversationId}/delete/`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error deleting conversation:', error.response?.data || error.message);
      } else {
        console.error('Error deleting conversation:', (error as Error)?.message || error);
      }
      throw error;
    }
  }

  async sendFeedback(messageId: string, rating: number, comment?: string) {
    try {
      const response = await api.post('/assistant/feedback/', {
        message: messageId,
        rating,
        comment: comment || '',
      });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error sending feedback:', error.response?.data || error.message);
      } else {
        console.error('Error sending feedback:', (error as Error)?.message || error);
      }
      throw error;
    }
  }

  async getQuickActions() {
    try {
      const response = await api.get('/assistant/quick-actions/');
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error getting quick actions:', error.response?.data || error.message);
      } else {
        console.error('Error getting quick actions:', (error as Error)?.message || error);
      }
      return { success: true, role: 'employee', quick_actions: [] };
    }
  }

  async getSuggestions() {
    try {
      const response = await api.get('/assistant/suggestions/');
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error getting suggestions:', error.response?.data || error.message);
      } else {
        console.error('Error getting suggestions:', (error as Error)?.message || error);
      }
      return { success: true, role: 'employee', suggestions: [] };
    }
  }
}

export const assistantService = new AssistantService();
