
import { Contract } from '@/models/contract';
import { mockDataService } from './mockDataService';

/**
 * Service for managing contracts
 * Uses mockDataService instead of PHP API
 */
export const contractService = {
  getContracts: async (): Promise<Contract[]> => {
    try {
      return await mockDataService.getContracts();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  getContract: async (id: string): Promise<Contract> => {
    try {
      const contract = await mockDataService.getContract(id);
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      return contract;
    } catch (error) {
      console.error(`Error fetching contract ${id}:`, error);
      throw error;
    }
  },

  createContract: async (contractData: any): Promise<Contract> => {
    try {
      return await mockDataService.createContract(contractData);
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  updateContract: async (id: string, contractData: any): Promise<Contract> => {
    try {
      const updatedContract = await mockDataService.updateContract(id, contractData);
      if (!updatedContract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      return updatedContract;
    } catch (error) {
      console.error(`Error updating contract ${id}:`, error);
      throw error;
    }
  },

  deleteContract: async (id: string): Promise<boolean> => {
    try {
      const result = await mockDataService.deleteContract(id);
      if (!result) {
        throw new Error(`Contract with ID ${id} not found or could not be deleted`);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting contract ${id}:`, error);
      throw error;
    }
  },

  // Additional methods
  generateContractPdf: async (id: string): Promise<string> => {
    try {
      // Mock PDF generation
      console.log(`Generating PDF for contract ${id}`);
      // Return a mock URL
      return `data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAFLSUxbQGERRsxCVGVXIRUQEBBXQQ==`;
    } catch (error) {
      console.error(`Error generating PDF for contract ${id}:`, error);
      throw error;
    }
  },

  sendContractByEmail: async (id: string, email: string): Promise<boolean> => {
    try {
      // Mock email sending
      console.log(`Sending contract ${id} to ${email}`);
      return true;
    } catch (error) {
      console.error(`Error sending contract ${id} by email:`, error);
      throw error;
    }
  }
};
