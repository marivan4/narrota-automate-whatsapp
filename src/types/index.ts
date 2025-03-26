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

// Function to check if a user has permission
export function hasPermission(user: User | null, permissionKey: string): boolean {
  if (!user) return false;
  
  const permission = PERMISSIONS.find(p => p.key === permissionKey);
  if (!permission) return false;
  
  return permission.roles.includes(user.role);
}
