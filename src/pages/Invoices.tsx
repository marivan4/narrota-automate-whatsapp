// Import necessary components and dependencies
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Printer, 
  MoreVertical, 
  FilePenLine, 
  Trash2, 
  Search, 
  RefreshCw,
  ReceiptText,
  Plus,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { invoiceService } from '@/services/invoiceService';
import { Invoice } from '@/models/invoice';
import { AlertCircle } from 'lucide-react';
import { pt } from 'date-fns/locale';

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get invoices from the service
      const data = await invoiceService.getInvoices();
      setInvoices(data);
      setDbConnected(true);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setError('Falha ao carregar faturas. Verifique a conexão com o banco de dados.');
      setDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => {
        const invoiceNumber = invoice.invoice_number?.toLowerCase() || '';
        const clientName = invoice.client?.name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return invoiceNumber.includes(search) || clientName.includes(search);
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta fatura?')) {
      setIsLoading(true);
      try {
        await invoiceService.deleteInvoice(id);
        setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== id));
        toast.success('Fatura excluída com sucesso!');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Falha ao excluir fatura.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Vencido</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Faturas</h1>
            <p className="text-gray-500 dark:text-gray-400">Gerencie todas as faturas do sistema</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            <Button onClick={() => navigate('/asaas-payments')} variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Pagamentos Asaas
            </Button>
            <Button onClick={() => navigate('/invoices/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Fatura
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Faturas</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Buscar por número ou cliente..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status-filter" className="sr-only">Filtrar por status</Label>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={fetchInvoices} className="w-full md:w-auto">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Atualizar</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredInvoices.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº da Fatura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.client?.name || 'Cliente não associado'}</TableCell>
                        <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                        <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/invoices/edit/${invoice.id}`)}>
                                <FilePenLine className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/invoices/print/${invoice.id}`)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg">
                <ReceiptText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Nenhuma fatura encontrada</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros ou criar uma nova fatura.'
                    : 'Comece criando sua primeira fatura.'}
                </p>
                <Button onClick={() => navigate('/invoices/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Fatura
                </Button>
              </div>
            )}

            {!dbConnected && !isLoading && (
              <Alert className="mt-4" variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Aviso</AlertTitle>
                <AlertDescription>
                  Exibindo dados offline. O banco de dados não está conectado. Algumas funcionalidades podem estar limitadas.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
