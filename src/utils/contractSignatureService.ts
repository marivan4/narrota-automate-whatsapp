
import { ContractFormValues } from '@/components/shared/contract/types';
import { whatsappService } from './whatsappService';
import { toast } from "sonner";
import { WHATSAPP_DEFAULTS } from '@/types';

export const contractSignatureService = {
  /**
   * Generate a signature link for a contract
   */
  generateSignatureLink: (contractId: string, baseUrl: string): string => {
    // In a real implementation, you might want to generate a unique token and store it in your database
    return `${baseUrl}/contract-signature?contractId=${contractId}`;
  },

  /**
   * Send a contract signature link via WhatsApp
   */
  sendContractViaWhatsApp: async (
    phoneNumber: string, 
    contract: ContractFormValues,
    contractId: string,
    clientName: string
  ): Promise<boolean> => {
    try {
      // Get WhatsApp config from localStorage
      const storedConfig = localStorage.getItem('whatsapp_config');
      if (!storedConfig) {
        toast.error("Configuração do WhatsApp não encontrada");
        return false;
      }
      
      const config = JSON.parse(storedConfig);
      const { instance, apiKey, baseUrl } = config;

      if (!instance || !apiKey) {
        toast.error("Configuração do WhatsApp incompleta");
        return false;
      }
      
      // Format the phone number if needed
      let formattedNumber = phoneNumber.replace(/\D/g, '');
      if (!formattedNumber.startsWith('55')) {
        formattedNumber = '55' + formattedNumber;
      }
      
      // Generate signature link
      const currentDomain = window.location.origin;
      const signatureLink = contractSignatureService.generateSignatureLink(contractId, currentDomain);
      
      // Create message text
      const message = `*${contract.title}*\n\n`
        + `Olá ${clientName},\n\n`
        + `Seu contrato de rastreamento veicular está pronto para assinatura. `
        + `Para assinar online, clique no link abaixo:\n\n`
        + `${signatureLink}\n\n`
        + `O link é válido por 7 dias. Se precisar de ajuda, entre em contato conosco.\n\n`
        + `Atenciosamente,\n`
        + `Equipe de Rastreamento`;
      
      // Send message via WhatsApp
      await whatsappService.sendMessage(
        instance, 
        apiKey, 
        {
          to: formattedNumber,
          message: message,
          options: {
            delay: 1200,
            presence: 'composing'
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error("Error sending contract via WhatsApp:", error);
      throw error;
    }
  }
};
