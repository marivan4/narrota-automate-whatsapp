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
  whatsappApiKey?: string;
  whatsappInstance?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface WhatsAppConnection {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  qrCode?: string;
  instanceName?: string;
  apiKey?: string;
  errorMessage?: string;
  lastUpdated: Date;
}

export interface WhatsAppConfig {
  apiKey: string;
  instance: string;
  serverUrl: string;
  lastConnected?: Date;
  isGlobalKey?: boolean; // Flag to indicate if this is the global admin key
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

export interface VehicleInfo {
  id?: string;
  model: string;
  plate: string;
  trackerModel: string;
  trackerImei: string;
  installationLocation?: string;
  clientId?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role: string;
  createdAt: Date;
  contracts: Contract[];
}

export interface Contract {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  status: 'active' | 'draft' | 'archived';
  clientId?: string;
  signedAt?: Date;
  signedBy?: string;
  signatureIp?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  required: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
  createdBy: string;
  status: 'active' | 'draft' | 'archived';
}

export interface Permission {
  key: string;
  name: string;
  description: string;
  roles: UserRole[];
}

export const PERMISSIONS: Permission[] = [
  {
    key: 'client.view',
    name: 'Ver Clientes',
    description: 'Permissão para visualizar detalhes dos clientes',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]
  },
  {
    key: 'client.edit',
    name: 'Editar Clientes',
    description: 'Permissão para editar detalhes dos clientes',
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  },
  {
    key: 'client.delete',
    name: 'Excluir Clientes',
    description: 'Permissão para excluir clientes',
    roles: [UserRole.ADMIN]
  },
  {
    key: 'contract.view',
    name: 'Ver Contratos',
    description: 'Permissão para visualizar contratos',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]
  },
  {
    key: 'contract.edit',
    name: 'Editar Contratos',
    description: 'Permissão para editar contratos',
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  },
  {
    key: 'whatsapp.connect',
    name: 'Conexão WhatsApp',
    description: 'Permissão para conectar ao WhatsApp',
    roles: [UserRole.ADMIN]
  },
  {
    key: 'whatsapp.message',
    name: 'Enviar Mensagens WhatsApp',
    description: 'Permissão para enviar mensagens via WhatsApp',
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  }
];

// Global constants for WhatsApp integration
export const WHATSAPP_DEFAULTS = {
  GLOBAL_API_KEY: 'd9919cda7e370839d33b8946584dac93',
  DEFAULT_SERVER_URL: 'https://evolutionapi.gpstracker-16.com.br',
};

// Function to check if a user has permission
export function hasPermission(user: User | null, permissionKey: string): boolean {
  if (!user) return false;
  
  const permission = PERMISSIONS.find(p => p.key === permissionKey);
  if (!permission) return false;
  
  return permission.roles.includes(user.role);
}
