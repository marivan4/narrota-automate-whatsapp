
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { asaasService } from '@/services/asaas';
import { ArrowLeft, RefreshCw, Search, AlertCircle, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { invoiceService } from '@/services/invoiceService';
import { Invoice } from '@/models/invoice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AsaasPayments = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [asaasPayments, setAsaasPayments] = useState<any[]>([]);
  
  // Check authentication and permissions
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isAuthorized([UserRole.ADMIN, UserRole.MANAGER])) {
      navigate('/dashboard');
      return;
    }
    
    // Check if Asaas API is configured
    const configured = asaasService.isConfigured();
    setIsConfigured(configured);
    
    // Load invoices and payments
    loadInvoices();
    if (configured) {
      loadAsaasPayments();
    }
  }, [authState.isAuthenticated, navigate]);
  
  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const result = await invoiceService.getInvoices();
      
      if (result) {
        setInvoices(result);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Falha ao carregar faturas.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAsaasPayments = async () => {
    try {
      setIsLoading(true);
      const result = await asaasService.getPayments();
      
      if (result && result.data) {
        setAsaasPayments(result.data);
      }
    } catch (error) {
      console.error('Error loading Asaas payments:', error);
      toast.error('Falha ao carregar pagamentos do Asaas.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createPayment = async (invoice: Invoice, paymentType: 'PIX' | 'BOLETO' | 'CREDIT_CARD') => {
    if (!isConfigured) {
      toast.error('API Asaas não configurada. Acesse as configurações para configurá-la.');
      return;
    }
    
    if (!invoice.client) {
      toast.error('Fatura não possui cliente associado.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Implementation to create payment with Asaas
      const result = await asaasService.createPayment(invoice, invoice.client, paymentType);
      
      if (result && result.id) {
        toast.success(`Pagamento ${paymentType} criado com sucesso!`);
        loadAsaasPayments();
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Falha ao criar pagamento.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pendente' },
      'RECEIVED': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Recebido' },
      'CONFIRMED': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Confirmado' },
      'OVERDUE': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Vencido' },
      'REFUNDED': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Estornado' },
      'CANCELED': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', label: 'Cancelado' },
      'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pendente' },
      'paid': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Pago' },
      'overdue': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Vencido' },
      'cancelled': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', label: 'Cancelado' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pagamentos Asaas</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/asaas-payments-list')}>
              Ver lista completa de cobranças
            </Button>
            <Button onClick={() => navigate('/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Faturas
            </Button>
          </div>
        </div>

        {!isConfigured && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Asaas não configurada</AlertTitle>
            <AlertDescription>
              Configure o token de acesso nas configurações antes de usar a integração com Asaas.
              <div className="mt-2">
                <Button variant="outline" onClick={() => navigate('/settings')}>
                  Ir para Configurações
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Faturas para Cobrar</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos Asaas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Faturas Disponíveis para Cobrança</CardTitle>
                <CardDescription>
                  Selecione uma fatura e escolha o método de pagamento para gerar uma cobrança no Asaas.
                </CardDescription>
                <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
                  <Input
                    placeholder="Buscar fatura ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" disabled={isLoading} onClick={() => loadInvoices()}>
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredInvoices.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Cliente</TableHead>
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
                            <TableCell>{invoice.client?.name || 'N/A'}</TableCell>
                            <TableCell>
                              {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>R$ {Number(invoice.total_amount).toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => createPayment(invoice, 'PIX')}
                                  disabled={!isConfigured || invoice.status === 'paid' || isLoading}
                                >
                                  <QrCode className="h-4 w-4 mr-1" /> PIX
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => createPayment(invoice, 'BOLETO')}
                                  disabled={!isConfigured || invoice.status === 'paid' || isLoading}
                                >
                                  <Banknote className="h-4 w-4 mr-1" /> Boleto
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => createPayment(invoice, 'CREDIT_CARD')}
                                  disabled={!isConfigured || invoice.status === 'paid' || isLoading}
                                >
                                  <CreditCard className="h-4 w-4 mr-1" /> Cartão
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma fatura encontrada. Tente ajustar sua busca.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Recentes</CardTitle>
                <CardDescription>
                  Cobranças geradas recentemente no Asaas.
                </CardDescription>
                <div className="mt-4">
                  <Button 
                    onClick={loadAsaasPayments} 
                    disabled={!isConfigured || isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Atualizar Pagamentos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : asaasPayments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Referência</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {asaasPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.id}</TableCell>
                            <TableCell>R$ {Number(payment.value).toFixed(2)}</TableCell>
                            <TableCell>{payment.dueDate}</TableCell>
                            <TableCell>{payment.billingType}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>{payment.externalReference || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {isConfigured 
                        ? "Nenhum pagamento encontrado. Crie cobranças na aba 'Faturas para Cobrar'."
                        : "Configure a API Asaas nas configurações para ver os pagamentos."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AsaasPayments;
