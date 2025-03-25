export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  token: string | null;
}

export interface Contract {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  status: 'active' | 'draft' | 'archived';
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
  createdAt: Date;
  createdBy: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WhatsAppConnection {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qrCode?: string;
  instanceName?: string;
  apiKey?: string;
  errorMessage?: string;
  lastUpdated: Date;
}
