
import { Client } from '@/models/client';
import { mockDataService } from './mockDataService';

/**
 * Service for managing clients
 * Uses mockDataService instead of PHP API
 */
export const clientService = {
  getClients: async (): Promise<Client[]> => {
    try {
      return await mockDataService.getClients();
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  getClient: async (id: string): Promise<Client> => {
    try {
      const client = await mockDataService.getClient(id);
      if (!client) {
        throw new Error(`Client with ID ${id} not found`);
      }
      return client;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  },

  createClient: async (clientData: any): Promise<Client> => {
    try {
      return await mockDataService.createClient(clientData);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  updateClient: async (id: string, clientData: any): Promise<Client> => {
    try {
      const updatedClient = await mockDataService.updateClient(id, clientData);
      if (!updatedClient) {
        throw new Error(`Client with ID ${id} not found`);
      }
      return updatedClient;
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  },

  deleteClient: async (id: string): Promise<boolean> => {
    try {
      const result = await mockDataService.deleteClient(id);
      if (!result) {
        throw new Error(`Client with ID ${id} not found or could not be deleted`);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      throw error;
    }
  }
};
