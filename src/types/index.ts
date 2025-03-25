
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface WhatsAppConnection {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qrCode?: string;
  instance?: string;
  lastUpdated: Date;
  errorMessage?: string;
}

export interface WhatsAppMessage {
  number: string;
  text: string;
  delay?: number;
  linkPreview?: boolean;
}

export interface Contract {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  status: 'draft' | 'active' | 'archived';
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
  createdBy: string;
  status: 'draft' | 'active' | 'archived';
}

export interface ChecklistItem {
  id: string;
  title: string;
  required: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: Date;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
