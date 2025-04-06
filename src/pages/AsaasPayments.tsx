
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  ArrowLeft, 
  Plus, 
  AlertCircle, 
  RefreshCw, 
  Search
} from 'lucide-react';
import { Client } from '@/models/client';

// Mock data for payments since we don't have the real API yet
const mockPayments = [
  {
    id: 'pay_123456',
    invoiceId: 'INV-001',
    clientName: 'João Silva',
    value: 1500.0,
    netValue: 1455.0,
    status: 'RECEIVED',
    paymentDate: new Date(2023, 10, 10),
    dueDate: new Date(2023, 10, 15),
    billingType: 'CREDIT_CARD'
  },
  {
    id: 'pay_234567',
    invoiceId: 'INV-002',
    clientName: 'Maria Oliveira',
    value: 750.5,
    netValue: 728.0,
    status: 'PENDING',
    paymentDate: null,
    dueDate: new Date(2023, 11, 20),
    billingType: 'BOLETO'
  },
  {
    id: 'pay_345678',
    invoiceId: 'INV-003',
    clientName: 'Carlos Santos',
    value: 2250.0,
    netValue: 2182.5,
    status: 'OVERDUE',
    paymentDate: null,
    dueDate: new Date(2023, 9, 10),
    billingType: 'PIX'
  }
];

const AsaasPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState(mockPayments);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPayments, setFilteredPayments] = useState(mockPayments);

  useEffect(() => {
    // Filter payments based on search term
    const filtered = payments.filter(payment => {
      return (
        payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulating API call
    setTimeout(() => {
      setPayments(mockPayments);
      setIsLoading(false);
      toast.success('Dados atualizados com sucesso!');
    }, 1000);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Recebido</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendente</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Vencido</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
        return <Badge variant="outline">Cartão de Crédito</Badge>;
      case 'BOLETO':
        return <Badge variant="outline">Boleto</Badge>;
      case 'PIX':
        return <Badge variant="outline">PIX</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Create a type-safe empty client object
  const createEmptyClient = (): Client => ({
    id: '',
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    role: 'CLIENT',
    created_at: new Date(),
    updated_at: new Date()
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Pagamentos Asaas</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gerencie todos os pagamentos via Asaas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            <Button onClick={() => navigate('/invoices')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Faturas
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
            <CardTitle>Lista de Pagamentos</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="search"
                  placeholder="Buscar por fatura ou cliente..."
                  className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleRefresh} className="w-full md:w-auto">
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
            ) : filteredPayments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fatura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Valor Líquido</TableHead>
                      <TableHead>Forma</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                        <TableCell>{payment.invoiceId}</TableCell>
                        <TableCell>{payment.clientName}</TableCell>
                        <TableCell>{formatDate(payment.dueDate)}</TableCell>
                        <TableCell>{formatCurrency(payment.value)}</TableCell>
                        <TableCell>{formatCurrency(payment.netValue)}</TableCell>
                        <TableCell>{getPaymentTypeBadge(payment.billingType)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg">
                <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Nenhum pagamento encontrado</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  {searchTerm
                    ? 'Tente ajustar os filtros ou criar uma nova fatura.'
                    : 'Comece criando sua primeira fatura com pagamento Asaas.'}
                </p>
                <Button onClick={() => navigate('/invoices/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Fatura
                </Button>
              </div>
            )}

            <Alert className="mt-4" variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Informação</AlertTitle>
              <AlertDescription>
                Para utilizar o Asaas, é necessário configurar a chave de API nas configurações do sistema.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AsaasPayments;
