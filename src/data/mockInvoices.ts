
import { Invoice } from '../models/invoice';

// Mock data for development
export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoice_number: 'INV-001',
    contract_id: 'CONT-001',
    issue_date: new Date(2023, 9, 15),
    due_date: new Date(2023, 10, 15),
    amount: 1500.0,
    tax_amount: 0,
    total_amount: 1500.0,
    status: 'paid',
    payment_date: new Date(2023, 10, 10),
    payment_method: 'Cartão de Crédito',
    client: {
      id: 'CUST-001',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      phone: '11987654321',
    },
    created_at: new Date(2023, 9, 15),
    updated_at: new Date(2023, 9, 15),
  },
  {
    id: 'INV-002',
    invoice_number: 'INV-002',
    contract_id: 'CONT-002',
    issue_date: new Date(2023, 10, 20),
    due_date: new Date(2023, 11, 20),
    amount: 750.5,
    tax_amount: 0,
    total_amount: 750.5,
    status: 'pending' as const,
    client: {
      id: 'CUST-002',
      name: 'Maria Oliveira',
      email: 'maria@exemplo.com',
      phone: '11987654322',
    },
    created_at: new Date(2023, 10, 20),
    updated_at: new Date(2023, 10, 20),
  },
  {
    id: 'INV-003',
    invoice_number: 'INV-003',
    contract_id: 'CONT-003',
    issue_date: new Date(2023, 8, 10),
    due_date: new Date(2023, 9, 10),
    amount: 2250.0,
    tax_amount: 100.0,
    total_amount: 2350.0,
    status: 'overdue' as const,
    client: {
      id: 'CUST-003',
      name: 'Carlos Santos',
      email: 'carlos@exemplo.com',
      phone: '11987654323',
    },
    created_at: new Date(2023, 8, 10),
    updated_at: new Date(2023, 8, 10),
  },
  {
    id: 'INV-004',
    invoice_number: 'INV-004',
    contract_id: 'CONT-004',
    issue_date: new Date(2023, 11, 5),
    due_date: new Date(2023, 12, 5),
    amount: 450.25,
    tax_amount: 30.0,
    total_amount: 480.25,
    status: 'cancelled' as const,
    client: {
      id: 'CUST-004',
      name: 'Ana Pereira',
      email: 'ana@exemplo.com',
      phone: '11987654324',
    },
    created_at: new Date(2023, 11, 5),
    updated_at: new Date(2023, 11, 5),
  },
  {
    id: 'INV-005',
    invoice_number: 'INV-005',
    contract_id: 'CONT-005',
    issue_date: new Date(2023, 10, 30),
    due_date: new Date(2023, 11, 30),
    amount: 1200.75,
    tax_amount: 75.0,
    total_amount: 1275.75,
    status: 'pending' as const,
    client: {
      id: 'CUST-005',
      name: 'Pedro Almeida',
      email: 'pedro@exemplo.com',
      phone: '11987654325',
    },
    created_at: new Date(2023, 10, 30),
    updated_at: new Date(2023, 10, 30),
  },
];

// Simulating a local storage to persist data during development
let invoicesData: Invoice[] = [...mockInvoices];

export { invoicesData };
