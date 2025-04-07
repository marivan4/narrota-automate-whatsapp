
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role?: string;
  created_at: string;
  updated_at?: string;
  contracts?: any[];
  asaas_id?: string;
}
