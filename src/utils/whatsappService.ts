
/**
 * WhatsApp Service
 * Handles interactions with the WhatsApp API
 */
import { WHATSAPP_DEFAULTS } from '@/types';

// Constants
const GLOBAL_API_KEY = 'd9919cda7e370839d33b8946584dac93';
const BASE_URL = 'https://evolutionapi.gpstracker-16.com.br';

// Types
interface WhatsAppMessage {
  to: string;
  message: string;
  options?: {
    delay?: number;
    presence?: 'composing' | 'recording' | 'paused';
  };
}

// Service functions
export const whatsappService = {
  /**
   * Generate QR Code for connecting WhatsApp
   * Always uses the global API key for admin operations
   */
  generateQRCode: async (instance: string) => {
    try {
      const response = await fetch(`${BASE_URL}/instance/connect/${instance}`, {
        method: 'GET',
        headers: {
          'apikey': GLOBAL_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },
  
  /**
   * Check connection state
   * Uses global API key for admin operations
   */
  checkConnectionState: async (instance: string) => {
    try {
      const response = await fetch(`${BASE_URL}/instance/connectionState/${instance}`, {
        method: 'GET',
        headers: {
          'apikey': GLOBAL_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error checking connection state:', error);
      throw error;
    }
  },
  
  /**
   * Logout/disconnect WhatsApp
   * Uses global API key for admin operations
   */
  logout: async (instance: string) => {
    try {
      const response = await fetch(`${BASE_URL}/instance/logout/${instance}`, {
        method: 'DELETE',
        headers: {
          'apikey': GLOBAL_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      throw error;
    }
  },
  
  /**
   * Restart WhatsApp instance
   * Uses global API key for admin operations
   */
  restart: async (instance: string) => {
    try {
      const response = await fetch(`${BASE_URL}/instance/restart/${instance}`, {
        method: 'POST',
        headers: {
          'apikey': GLOBAL_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error restarting WhatsApp instance:', error);
      throw error;
    }
  },
  
  /**
   * Send text message
   * Uses client-specific API key
   */
  sendMessage: async (instance: string, apiKey: string, data: WhatsAppMessage) => {
    if (!apiKey) {
      throw new Error('API key is required for sending messages');
    }
    
    try {
      const response = await fetch(`${BASE_URL}/message/sendText/${instance}`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }
};
