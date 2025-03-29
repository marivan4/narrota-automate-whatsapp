
import { Client } from '../contract/types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
    address: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
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
    address: 'Avenida Central',
    number: '456',
    neighborhood: 'Copacabana',
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
    address: 'Rua Principal',
    number: '789',
    neighborhood: 'Savassi',
    city: 'Belo Horizonte',
    state: 'MG',
    zipCode: '31234-567',
    role: 'client'
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@exemplo.com',
    phone: '(41) 98765-4321',
    document: '789.123.456-00',
    address: 'Avenida das Araucárias',
    number: '321',
    neighborhood: 'Batel',
    city: 'Curitiba',
    state: 'PR',
    zipCode: '80000-123',
    role: 'client'
  },
  {
    id: '5',
    name: 'Paulo Mendes',
    email: 'paulo.mendes@exemplo.com',
    phone: '(51) 98765-4321',
    document: '321.654.987-00',
    address: 'Rua dos Andradas',
    number: '567',
    neighborhood: 'Centro Histórico',
    city: 'Porto Alegre',
    state: 'RS',
    zipCode: '90000-123',
    role: 'client'
  }
];
