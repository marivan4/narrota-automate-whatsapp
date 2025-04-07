
import { Invoice, Client, Contract, Vehicle, User, WhatsAppConfig } from '@/models';

/**
 * This service provides mock data for the application
 * It replaces the PHP backend with local storage-based persistence
 */

// Helper to get data from localStorage with proper typing
const getStoredData = <T>(key: string, defaultData: T): T => {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    try {
      return JSON.parse(storedData) as T;
    } catch (error) {
      console.error(`Error parsing stored data for ${key}:`, error);
      return defaultData;
    }
  }
  return defaultData;
};

// Helper to store data in localStorage
const storeData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initialize mock data if it doesn't exist
const initMockData = (): void => {
  // Clients
  if (!localStorage.getItem('clients')) {
    const clients: Client[] = [
      {
        id: 'c1',
        name: 'João Silva',
        email: 'joao.silva@example.com',
        phone: '(11) 98765-4321',
        document: '123.456.789-00',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        created_at: new Date().toISOString(),
      },
      {
        id: 'c2',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@example.com',
        phone: '(11) 91234-5678',
        document: '987.654.321-00',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        created_at: new Date().toISOString(),
      },
    ];
    storeData('clients', clients);
  }

  // Vehicles
  if (!localStorage.getItem('vehicles')) {
    const vehicles: Vehicle[] = [
      {
        id: 'v1',
        client_id: 'c1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'Prata',
        license_plate: 'ABC-1234',
        vin: '12345678901234567',
        created_at: new Date().toISOString(),
      },
      {
        id: 'v2',
        client_id: 'c2',
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        color: 'Preto',
        license_plate: 'DEF-5678',
        vin: '76543210987654321',
        created_at: new Date().toISOString(),
      },
    ];
    storeData('vehicles', vehicles);
  }

  // Contracts
  if (!localStorage.getItem('contracts')) {
    const contracts: Contract[] = [
      {
        id: 'ct1',
        client_id: 'c1',
        vehicle_id: 'v1',
        contract_number: 'CONT-2023-001',
        start_date: new Date(2023, 0, 1).toISOString(),
        end_date: new Date(2024, 0, 1).toISOString(),
        value: 1200,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'ct2',
        client_id: 'c2',
        vehicle_id: 'v2',
        contract_number: 'CONT-2023-002',
        start_date: new Date(2023, 1, 1).toISOString(),
        end_date: new Date(2024, 1, 1).toISOString(),
        value: 1500,
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];
    storeData('contracts', contracts);
  }

  // Invoices
  if (!localStorage.getItem('invoices')) {
    const invoices: Invoice[] = [
      {
        id: 'i1',
        invoice_number: 'FAT-2023-001',
        contract_id: 'ct1',
        client_id: 'c1',
        issue_date: new Date(2023, 0, 5).toISOString(),
        due_date: new Date(2023, 0, 15).toISOString(),
        amount: 100,
        tax_amount: 10,
        total_amount: 110,
        status: 'paid',
        payment_date: new Date(2023, 0, 10).toISOString(),
        payment_method: 'credit_card',
        notes: 'Pagamento da primeira mensalidade',
        created_at: new Date().toISOString(),
        client: {
          name: 'João Silva',
          email: 'joao.silva@example.com',
          phone: '(11) 98765-4321',
          document: '123.456.789-00',
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
        items: [
          {
            id: 'item1',
            description: 'Mensalidade de rastreamento',
            quantity: 1,
            price: 100,
          }
        ],
        subtotal: 100,
        discount: 0,
      },
      {
        id: 'i2',
        invoice_number: 'FAT-2023-002',
        contract_id: 'ct2',
        client_id: 'c2',
        issue_date: new Date(2023, 1, 5).toISOString(),
        due_date: new Date(2023, 1, 15).toISOString(),
        amount: 150,
        tax_amount: 15,
        total_amount: 165,
        status: 'pending',
        payment_method: 'bank_transfer',
        notes: 'Aguardando pagamento',
        created_at: new Date().toISOString(),
        client: {
          name: 'Maria Oliveira',
          email: 'maria.oliveira@example.com',
          phone: '(11) 91234-5678',
          document: '987.654.321-00',
          address: 'Av. Paulista, 1000',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
        },
        items: [
          {
            id: 'item2',
            description: 'Mensalidade de rastreamento',
            quantity: 1,
            price: 150,
          }
        ],
        subtotal: 150,
        discount: 0,
      },
    ];
    storeData('invoices', invoices);
  }

  // WhatsApp configs
  if (!localStorage.getItem('whatsapp_configs')) {
    const whatsappConfigs: Record<string, WhatsAppConfig> = {
      'default': {
        instance: 'default',
        apiKey: 'sample-api-key',
        isConnected: false,
        phone: '5511999998888',
        businessName: 'GPS Tracker'
      }
    };
    storeData('whatsapp_configs', whatsappConfigs);
  }
};

// Initialize on service import
initMockData();

// Export the mock data service API
export const mockDataService = {
  // Clients
  getClients: async (): Promise<Client[]> => {
    return getStoredData('clients', []);
  },
  
  getClient: async (id: string): Promise<Client | null> => {
    const clients = getStoredData<Client[]>('clients', []);
    return clients.find(client => client.id === id) || null;
  },
  
  createClient: async (client: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
    const clients = getStoredData<Client[]>('clients', []);
    const newClient: Client = {
      ...client,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    clients.push(newClient);
    storeData('clients', clients);
    return newClient;
  },
  
  updateClient: async (id: string, client: Partial<Client>): Promise<Client | null> => {
    const clients = getStoredData<Client[]>('clients', []);
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    clients[index] = { ...clients[index], ...client };
    storeData('clients', clients);
    return clients[index];
  },
  
  deleteClient: async (id: string): Promise<boolean> => {
    const clients = getStoredData<Client[]>('clients', []);
    const filteredClients = clients.filter(client => client.id !== id);
    if (filteredClients.length === clients.length) return false;
    
    storeData('clients', filteredClients);
    return true;
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    return getStoredData('invoices', []);
  },
  
  getInvoice: async (id: string): Promise<Invoice | null> => {
    const invoices = getStoredData<Invoice[]>('invoices', []);
    return invoices.find(invoice => invoice.id === id) || null;
  },
  
  createInvoice: async (invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
    const invoices = getStoredData<Invoice[]>('invoices', []);
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    invoices.push(newInvoice);
    storeData('invoices', invoices);
    return newInvoice;
  },
  
  updateInvoice: async (id: string, invoice: Partial<Invoice>): Promise<Invoice | null> => {
    const invoices = getStoredData<Invoice[]>('invoices', []);
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    invoices[index] = { ...invoices[index], ...invoice };
    storeData('invoices', invoices);
    return invoices[index];
  },
  
  deleteInvoice: async (id: string): Promise<boolean> => {
    const invoices = getStoredData<Invoice[]>('invoices', []);
    const filteredInvoices = invoices.filter(invoice => invoice.id !== id);
    if (filteredInvoices.length === invoices.length) return false;
    
    storeData('invoices', filteredInvoices);
    return true;
  },

  // WhatsApp
  getWhatsAppConfig: async (instance: string = 'default'): Promise<WhatsAppConfig | null> => {
    const configs = getStoredData<Record<string, WhatsAppConfig>>('whatsapp_configs', {});
    return configs[instance] || null;
  },
  
  saveWhatsAppConfig: async (config: WhatsAppConfig): Promise<WhatsAppConfig> => {
    const configs = getStoredData<Record<string, WhatsAppConfig>>('whatsapp_configs', {});
    configs[config.instance] = config;
    storeData('whatsapp_configs', configs);
    return config;
  },
  
  // Vehicle methods
  getVehicles: async (): Promise<Vehicle[]> => {
    return getStoredData('vehicles', []);
  },
  
  getVehicle: async (id: string): Promise<Vehicle | null> => {
    const vehicles = getStoredData<Vehicle[]>('vehicles', []);
    return vehicles.find(vehicle => vehicle.id === id) || null;
  },
  
  createVehicle: async (vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle> => {
    const vehicles = getStoredData<Vehicle[]>('vehicles', []);
    const newVehicle: Vehicle = {
      ...vehicle,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    vehicles.push(newVehicle);
    storeData('vehicles', vehicles);
    return newVehicle;
  },
  
  updateVehicle: async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null> => {
    const vehicles = getStoredData<Vehicle[]>('vehicles', []);
    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) return null;
    
    vehicles[index] = { ...vehicles[index], ...vehicle };
    storeData('vehicles', vehicles);
    return vehicles[index];
  },
  
  deleteVehicle: async (id: string): Promise<boolean> => {
    const vehicles = getStoredData<Vehicle[]>('vehicles', []);
    const filteredVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    if (filteredVehicles.length === vehicles.length) return false;
    
    storeData('vehicles', filteredVehicles);
    return true;
  },

  // Contract methods
  getContracts: async (): Promise<Contract[]> => {
    return getStoredData('contracts', []);
  },
  
  getContract: async (id: string): Promise<Contract | null> => {
    const contracts = getStoredData<Contract[]>('contracts', []);
    return contracts.find(contract => contract.id === id) || null;
  },
  
  createContract: async (contract: Omit<Contract, 'id' | 'created_at'>): Promise<Contract> => {
    const contracts = getStoredData<Contract[]>('contracts', []);
    const newContract: Contract = {
      ...contract,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    contracts.push(newContract);
    storeData('contracts', contracts);
    return newContract;
  },
  
  updateContract: async (id: string, contract: Partial<Contract>): Promise<Contract | null> => {
    const contracts = getStoredData<Contract[]>('contracts', []);
    const index = contracts.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    contracts[index] = { ...contracts[index], ...contract };
    storeData('contracts', contracts);
    return contracts[index];
  },
  
  deleteContract: async (id: string): Promise<boolean> => {
    const contracts = getStoredData<Contract[]>('contracts', []);
    const filteredContracts = contracts.filter(contract => contract.id !== id);
    if (filteredContracts.length === contracts.length) return false;
    
    storeData('contracts', filteredContracts);
    return true;
  },
};
