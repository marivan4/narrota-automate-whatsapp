
export interface Contract {
  id: string;
  client_id: string;
  vehicle_id: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  value: number;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  created_at: string;
  updated_at?: string;
  notes?: string;
  terms?: string;
  signature?: {
    date: string;
    ip: string;
    signature_image?: string;
  };
}
