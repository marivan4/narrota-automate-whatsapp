
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF/CNPJ
  address: string;
  city: string;
  state: string;
  zipCode: string;
  role: 'admin' | 'client' | 'viewer';
  asaas_id?: string; // ID do cliente no Asaas
  created_at: Date;
  updated_at: Date;
}

export type ClientFormValues = Omit<Client, 'id' | 'created_at' | 'updated_at' | 'asaas_id'>;
