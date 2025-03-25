
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  PlusCircle,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvoicesProps {}

// Mock data for invoices
const mockInvoices = [
  {
    id: 'INV-001',
    customerId: 'CUST-001',
    customerName: 'João Silva',
    amount: 1500.0,
    dueDate: new Date(2023, 10, 15),
    status: 'paid',
    createdAt: new Date(2023, 9, 15),
  },
  {
    id: 'INV-002',
    customerId: 'CUST-002',
    customerName: 'Maria Oliveira',
    amount: 750.5,
    dueDate: new Date(2023, 11, 20),
    status: 'pending',
    createdAt: new Date(2023, 10, 20),
  },
  {
    id: 'INV-003',
    customerId: 'CUST-003',
    customerName: 'Carlos Santos',
    amount: 2350.0,
    dueDate: new Date(2023, 9, 10),
    status: 'overdue',
    createdAt: new Date(2023, 8, 10),
  },
  {
    id: 'INV-004',
    customerId: 'CUST-004',
    customerName: 'Ana Pereira',
    amount: 480.25,
    dueDate: new Date(2023, 12, 5),
    status: 'cancelled',
    createdAt: new Date(2023, 11, 5),
  },
  {
    id: 'INV-005',
    customerId: 'CUST-005',
    customerName: 'Pedro Almeida',
    amount: 1275.75,
    dueDate: new Date(2023, 11, 30),
    status: 'pending',
    createdAt: new Date(2023, 10, 30),
  },
];

const Invoices: React.FC<InvoicesProps> = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState(mockInvoices);

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Atrasado
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-500">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Permissions check - fixed to always return JSX
  if (!authState.isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (!isAuthorized([UserRole.ADMIN, UserRole.MANAGER])) {
    navigate('/dashboard');
    return null;
  }

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Faturas</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gerenciamento de Faturas</CardTitle>
            <CardDescription>Visualize e gerencie todas as faturas do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar faturas..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Fatura
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>
                          {format(invoice.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          {format(invoice.createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        Nenhuma fatura encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Faturas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {invoices.filter((inv) => inv.status === 'pending').length}
              </div>
              <p className="text-muted-foreground text-sm">
                {formatCurrency(
                  invoices
                    .filter((inv) => inv.status === 'pending')
                    .reduce((acc, inv) => acc + inv.amount, 0)
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Faturas Pagas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {invoices.filter((inv) => inv.status === 'paid').length}
              </div>
              <p className="text-muted-foreground text-sm">
                {formatCurrency(
                  invoices
                    .filter((inv) => inv.status === 'paid')
                    .reduce((acc, inv) => acc + inv.amount, 0)
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Faturas Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {invoices.filter((inv) => inv.status === 'overdue').length}
              </div>
              <p className="text-muted-foreground text-sm">
                {formatCurrency(
                  invoices
                    .filter((inv) => inv.status === 'overdue')
                    .reduce((acc, inv) => acc + inv.amount, 0)
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
