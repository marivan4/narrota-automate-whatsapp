
export interface Invoice {
  id: string;
  invoice_number: string;
  contract_id: string;
  issue_date: string; // Changed from Date to string
  due_date: string; // Changed from Date to string
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: string; // Changed from Date to string
  payment_method?: string;
  notes?: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    document?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    created_at?: string; // Added to match the usage in mockDataService
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  created_at: string; // Changed from Date to string
  updated_at: string; // Changed from Date to string
}

export type InvoiceFormData = {
  invoice_number: string;
  contract_id: string;
  issue_date: string; // Changed from Date to string
  due_date: string; // Changed from Date to string
  amount: number;
  tax_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: string; // Changed from Date to string
  payment_method?: string;
  notes?: string;
  client_id?: string;
  items?: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
};
