
import React, { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  User,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  requiredRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER] 
}) => {
  const { authState, isAuthorized, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER] 
    },
    { 
      name: 'Clientes', 
      path: '/clients', 
      icon: Users, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      name: 'Contratos', 
      path: '/contracts', 
      icon: FileText, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER] 
    },
    { 
      name: 'Checklists', 
      path: '/checklists', 
      icon: CheckSquare, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER] 
    },
    { 
      name: 'Faturas', 
      path: '/invoices', 
      icon: Receipt, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      name: 'WhatsApp', 
      path: '/whatsapp-settings', 
      icon: MessageSquare, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      name: 'Usuários', 
      path: '/users', 
      icon: Users, 
      roles: [UserRole.ADMIN] 
    },
    { 
      name: 'Configurações', 
      path: '/settings', 
      icon: Settings, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
  ];

  // Use useEffect for navigation if needed
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!isAuthorized(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(
    item => authState.user && item.roles.includes(authState.user.role)
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-foreground"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar - mobile */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="glassmorphism h-full w-64 p-4 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-8 mb-8 flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">N</span>
                </div>
                <h1 className="text-xl font-semibold">Narrota</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1 px-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <Link
                to="/profile"
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === "/profile"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Meu Perfil</span>
              </Link>
            </div>

            <div className="absolute bottom-4 left-0 right-0 px-6">
              <div className="border-t border-border pt-4">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start space-x-3"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - desktop */}
      <div 
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className={cn("flex items-center space-x-2", sidebarCollapsed && "justify-center w-full")}>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            {!sidebarCollapsed && <h1 className="text-xl font-semibold">Narrota</h1>}
          </div>
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  sidebarCollapsed ? "justify-center" : "space-x-3",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
            <Link
              to="/profile"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                sidebarCollapsed ? "justify-center" : "space-x-3",
                location.pathname === "/profile"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              )}
              title={sidebarCollapsed ? "Meu Perfil" : undefined}
            >
              <User className="h-5 w-5" />
              {!sidebarCollapsed && <span>Meu Perfil</span>}
            </Link>
          </div>
        </div>

        {sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(false)}
            className="m-2 self-end"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <div className="p-4 border-t border-border">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              {authState.user?.avatar && (
                <img 
                  src={authState.user.avatar} 
                  alt={authState.user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{authState.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{authState.user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="w-full"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto animate-fade-in">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
