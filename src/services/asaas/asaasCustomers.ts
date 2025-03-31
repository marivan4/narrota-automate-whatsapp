
/**
 * Module for Asaas customer-related operations
 */

import { callAsaasApi } from './asaasApi';
import { AsaasCustomer, AsaasCustomersResponse } from './asaasTypes';
import { Client } from '@/models/client';

export const asaasCustomers = {
  /**
   * Find a customer by CPF/CNPJ
   */
  findCustomerByCpfCnpj: async (cpfCnpj: string): Promise<AsaasCustomer | null> => {
    try {
      const result = await callAsaasApi<AsaasCustomersResponse>(`/customers?cpfCnpj=${cpfCnpj}`);
      return result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  },

  /**
   * Create a customer in Asaas
   */
  createCustomer: async (client: Client): Promise<string> => {
    const customerData = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      cpfCnpj: client.document.replace(/[^0-9]/g, ''),
      address: client.address,
      addressNumber: '', // Optional field
      province: '', // Optional field
      postalCode: client.zipCode.replace(/[^0-9]/g, ''),
      city: client.city,
      state: client.state,
      externalReference: client.id, // Reference to client ID in the system
      notificationDisabled: false
    };

    try {
      const result = await callAsaasApi<{ id: string }>('/customers', 'POST', customerData);
      return result.id;
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error);
      throw error;
    }
  },

  /**
   * Create or update a customer in Asaas
   */
  syncCustomer: async (client: Client): Promise<string> => {
    try {
      // Check if customer already exists in Asaas
      const existingCustomer = await asaasCustomers.findCustomerByCpfCnpj(client.document);
      
      if (existingCustomer) {
        // Customer already exists, return ID
        return existingCustomer.id;
      } else {
        // Customer doesn't exist, create a new one
        return await asaasCustomers.createCustomer(client);
      }
    } catch (error) {
      console.error('Erro ao sincronizar cliente com Asaas:', error);
      throw error;
    }
  }
};
