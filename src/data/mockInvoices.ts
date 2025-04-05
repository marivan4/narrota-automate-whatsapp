
import { Invoice } from '../models/invoice';

// Dados fictícios apenas para desenvolvimento - serão utilizados somente como fallback
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
    subtotal: 1500.0,
    discount: 0.0,
    status: 'paid',
    payment_date: new Date(2023, 10, 10),
    payment_method: 'Cartão de Crédito',
    client: {
      id: 'CUST-001',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      phone: '11987654321',
      document: '123.456.789-00',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    items: [
      {
        id: '1',
        description: 'Instalação de rastreador',
        quantity: 1,
        price: 1500.0
      }
    ],
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
    subtotal: 750.5,
    discount: 0.0,
    status: 'pending' as const,
    client: {
      id: 'CUST-002',
      name: 'Maria Oliveira',
      email: 'maria@exemplo.com',
      phone: '11987654322',
      document: '987.654.321-00',
      address: 'Avenida Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04567-890'
    },
    items: [
      {
        id: '1',
        description: 'Mensalidade rastreador',
        quantity: 1,
        price: 750.5
      }
    ],
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
    subtotal: 2250.0,
    discount: 0.0,
    status: 'overdue' as const,
    client: {
      id: 'CUST-003',
      name: 'Carlos Santos',
      email: 'carlos@exemplo.com',
      phone: '11987654323',
      document: '111.222.333-44',
      address: 'Rua Augusta, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-000'
    },
    items: [
      {
        id: '1',
        description: 'Instalação de rastreador premium',
        quantity: 1,
        price: 2250.0
      }
    ],
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
    subtotal: 450.25,
    discount: 0.0,
    status: 'cancelled' as const,
    client: {
      id: 'CUST-004',
      name: 'Ana Pereira',
      email: 'ana@exemplo.com',
      phone: '11987654324',
      document: '444.555.666-77',
      address: 'Alameda Santos, 800',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04500-001'
    },
    items: [
      {
        id: '1',
        description: 'Mensalidade rastreador básico',
        quantity: 1,
        price: 450.25
      }
    ],
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
    subtotal: 1200.75,
    discount: 0.0,
    status: 'pending' as const,
    client: {
      id: 'CUST-005',
      name: 'Pedro Almeida',
      email: 'pedro@exemplo.com',
      phone: '11987654325',
      document: '888.999.000-11',
      address: 'Rua Oscar Freire, 300',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-000'
    },
    items: [
      {
        id: '1',
        description: 'Instalação e configuração',
        quantity: 1,
        price: 1200.75
      }
    ],
    created_at: new Date(2023, 10, 30),
    updated_at: new Date(2023, 10, 30),
  },
];

// Simulando armazenamento local para persistir dados durante o desenvolvimento
// Não mais usado diretamente na aplicação - dados vêm do banco de dados
let invoicesData: Invoice[] = [];

export { invoicesData };
