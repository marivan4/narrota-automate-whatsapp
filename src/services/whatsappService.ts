
import { WhatsAppConfig } from '@/models/whatsapp';
import { mockDataService } from './mockDataService';

export interface QRCodeResponse {
  qrcode: string;
  base64Image: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export interface ConnectionStatusResponse {
  connected: boolean;
  state: string;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Service for WhatsApp integration
 * Uses mockDataService instead of PHP API
 */
export const whatsappService = {
  generateQRCode: async (config: WhatsAppConfig): Promise<QRCodeResponse> => {
    try {
      // Save the config first
      await mockDataService.saveWhatsAppConfig(config);
      
      // Mock QR code generation
      return {
        qrcode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-demo',
        base64Image: 'data:image/png;base64,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'
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  sendTextMessage: async (config: WhatsAppConfig, to: string, message: string): Promise<MessageResponse> => {
    try {
      // Check if WhatsApp is connected
      const savedConfig = await mockDataService.getWhatsAppConfig(config.instance);
      if (!savedConfig || !savedConfig.isConnected) {
        return {
          success: false,
          message: 'WhatsApp is not connected. Please connect first.'
        };
      }
      
      // Mock sending message
      console.log(`Sending WhatsApp message to ${to}: ${message}`);
      
      return {
        success: true,
        message: 'Message sent successfully',
        messageId: `msg_${Date.now()}`
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  },

  checkConnectionStatus: async (config: WhatsAppConfig): Promise<ConnectionStatusResponse> => {
    try {
      const savedConfig = await mockDataService.getWhatsAppConfig(config.instance);
      
      return {
        connected: savedConfig?.isConnected || false,
        state: savedConfig?.isConnected ? 'CONNECTED' : 'DISCONNECTED',
        message: savedConfig?.isConnected ? 'WhatsApp is connected' : 'WhatsApp is not connected'
      };
    } catch (error) {
      console.error('Error checking WhatsApp connection status:', error);
      throw error;
    }
  },

  logout: async (instance: string): Promise<LogoutResponse> => {
    try {
      const config = await mockDataService.getWhatsAppConfig(instance);
      if (!config) {
        return {
          success: false,
          message: 'Instance not found'
        };
      }
      
      // Update connection status
      config.isConnected = false;
      await mockDataService.saveWhatsAppConfig(config);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Error logging out from WhatsApp:', error);
      throw error;
    }
  }
};
