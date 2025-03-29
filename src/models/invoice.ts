
export interface Invoice {
  id: string;
  invoice_number: string;
  contract_id: string;
  issue_date: Date;
  due_date: Date;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: Date;
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
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  created_at: Date;
  updated_at: Date;
}

export type InvoiceFormData = {
  invoice_number: string;
  contract_id: string;
  issue_date: Date;
  due_date: Date;
  amount: number;
  tax_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: Date;
  payment_method?: string;
  notes?: string;
  client_id?: string;
};
