
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, UserRole } from '@/types';
import { Users, Plus, Search, Edit, Trash2, UserPlus, ShieldCheck, ShieldAlert, UserCheck } from 'lucide-react';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Helper to generate mock users
const generateMockUsers = (): User[] => {
  return [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      avatar: 'https://i.pravatar.cc/150?u=admin'
    },
    {
      id: '2',
      name: 'Manager User',
      email: 'manager@example.com',
      role: UserRole.MANAGER,
      avatar: 'https://i.pravatar.cc/150?u=manager'
    },
    {
      id: '3',
      name: 'Regular User',
      email: 'user@example.com',
      role: UserRole.USER,
      avatar: 'https://i.pravatar.cc/150?u=user'
    },
    {
      id: '4',
      name: 'Support Staff',
      email: 'support@example.com',
      role: UserRole.USER,
      avatar: 'https://i.pravatar.cc/150?u=support'
    },
    {
      id: '5',
      name: 'Technician',
      email: 'tech@example.com',
      role: UserRole.USER,
      avatar: 'https://i.pravatar.cc/150?u=tech'
    },
    {
      id: '6',
      name: 'Sales Manager',
      email: 'sales@example.com',
      role: UserRole.MANAGER,
      avatar: 'https://i.pravatar.cc/150?u=sales'
    },
  ];
};

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: UserRole.USER,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate fetching users
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(generateMockUsers());
      } catch (error) {
        toast.error("Erro ao carregar usuários. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: UserRole.USER,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as UserRole }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user-${users.length + 1}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: `https://i.pravatar.cc/150?u=${formData.email}`,
      };
      
      setUsers([...users, newUser]);
      toast.success("Usuário criado com sucesso!");
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao criar usuário. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUsers = users.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              name: formData.name,
              email: formData.email,
              role: formData.role,
            } 
          : user
      );
      
      setUsers(updatedUsers);
      toast.success("Usuário atualizado com sucesso!");
      setEditingUser(null);
      resetForm();
    } catch (error) {
      toast.error("Erro ao atualizar usuário. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUsers = users.filter(user => user.id !== deleteConfirmUser.id);
      setUsers(updatedUsers);
      toast.success("Usuário excluído com sucesso!");
      setDeleteConfirmUser(null);
    } catch (error) {
      toast.error("Erro ao excluir usuário. Por favor, tente novamente.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case UserRole.MANAGER:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Gerente
          </Badge>
        );
      case UserRole.USER:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Usuário
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout requiredRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema e suas permissões de acesso
            </p>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowCreateDialog(true);
          }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários pelo nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Gerencie os usuários que têm acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-md"></div>
                ))}
              </div>
            ) : (
              <>
                {filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">Nenhum usuário encontrado</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery 
                        ? "Tente ajustar sua busca ou criar um novo usuário." 
                        : "Comece adicionando um novo usuário ao sistema."}
                    </p>
                    <Button onClick={() => {
                      resetForm();
                      setShowCreateDialog(true);
                    }}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead className="text-right w-[120px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="animate-fade-in">
                            <TableCell>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setDeleteConfirmUser(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Adicione um novo usuário ao sistema
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="required">Nome</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="required">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="required">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Criar senha"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="required">Função</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={UserRole.MANAGER}>Gerente</SelectItem>
                  <SelectItem value={UserRole.USER}>Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="required">Nome</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="required">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Senha</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                placeholder="Deixe em branco para manter a senha atual"
                value={formData.password}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para manter a senha atual
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="required">Função</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={UserRole.MANAGER}>Gerente</SelectItem>
                  <SelectItem value={UserRole.USER}>Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmUser !== null} onOpenChange={(open) => !open && setDeleteConfirmUser(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-3 p-3 border rounded-md bg-red-50">
            <Avatar className="h-9 w-9">
              <AvatarImage src={deleteConfirmUser?.avatar} alt={deleteConfirmUser?.name} />
              <AvatarFallback>{deleteConfirmUser?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{deleteConfirmUser?.name}</p>
              <p className="text-sm text-muted-foreground">{deleteConfirmUser?.email}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmUser(null)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteUser}
            >
              Excluir Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UsersManagement;
