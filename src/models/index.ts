
export * from './client';
export * from './contract';
export * from './invoice';
export * from './whatsapp';

export interface Vehicle {
  id: string;
  client_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  vin: string;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}
