
import { Client } from '../contract/types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    role: 'client'
  },
  {
    id: '2',
    name: 'Maria Souza',
    email: 'maria.souza@exemplo.com',
    phone: '(21) 98765-4321',
    document: '987.654.321-00',
    address: 'Avenida Central, 456',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '21234-567',
    role: 'client'
  },
  {
    id: '3',
    name: 'Carlos Pereira',
    email: 'carlos.pereira@exemplo.com',
    phone: '(31) 98765-4321',
    document: '456.789.123-00',
    address: 'Rua Principal, 789',
    city: 'Belo Horizonte',
    state: 'MG',
    zipCode: '31234-567',
    role: 'client'
  }
];
