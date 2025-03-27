
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
  };
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
