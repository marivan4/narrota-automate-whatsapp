
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading?: boolean;
  error?: string | null;
}

export interface Contract {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  status: 'active' | 'draft' | 'archived';
  clientId?: string; // Added to link contracts to clients
  vehicleInfo?: VehicleInfo; // Added for vehicle information
  capturedIp?: string; // Added for IP tracking
  geolocation?: GeolocationData; // Added for location tracking
  signatureData?: SignatureData; // Added for signature data
}

export interface VehicleInfo {
  model: string;
  plate: string;
  trackerModel: string;
  trackerImei: string;
  installationLocation?: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface SignatureData {
  signature: string; // Base64 image of signature
  timestamp: string;
  ipAddress: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF/CNPJ
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role: 'admin' | 'client' | 'viewer';
  createdAt: Date;
  contracts: Contract[];
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  createdAt: Date;
  createdBy: string;
  status?: 'active' | 'draft' | 'archived';
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  required?: boolean;
  title?: string; // Added for backward compatibility
}

export interface WhatsAppConnection {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qrCode?: string;
  instanceName?: string;
  apiKey?: string;
  errorMessage?: string;
  lastUpdated: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  whatsappConfig?: WhatsAppConfig;
}

export interface WhatsAppConfig {
  apiKey: string;
  instance: string;
  serverUrl: string;
  lastConnected?: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
  description?: string;
  items?: InvoiceItem[];
  contract?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Vehicle {
  id: string;
  clientId: string;
  model: string;
  plate: string;
  chassis?: string;
  color?: string;
  year?: string;
  trackerInfo: {
    model: string;
    imei: string;
    installationDate?: string;
    installationLocation?: string;
  };
  createdAt: Date;
}

export interface Report {
  id: string;
  title: string;
  type: 'revenue' | 'clients' | 'contracts' | 'vehicles' | 'invoices';
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any; // This would depend on the report type
  createdAt: Date;
  createdBy: string;
  format?: 'pdf' | 'csv' | 'excel';
}
