
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { ArrowLeft, Search, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { asaasService } from '@/services/asaas';
import type { AsaasPayment } from '@/services/asaas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema para o formulário de busca
const searchFormSchema = z.object({
  customer: z.string().optional(),
  externalReference: z.string().optional(),
  billingType: z.enum(["BOLETO", "PIX", "CREDIT_CARD", "ALL"], {
    required_error: "Selecione o tipo de cobrança.",
  }).default("ALL"),
  status: z.enum(["PENDING", "RECEIVED", "CONFIRMED", "OVERDUE", "REFUNDED", "CANCELED", "ALL"], {
    required_error: "Selecione o status do pagamento.",
  }).default("ALL"),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  dateType: z.enum(["dateCreated", "dueDate", "paymentDate"], {
    required_error: "Selecione o tipo de data.",
  }).default("dueDate"),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const AsaasPaymentsList = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();
  const [payments, setPayments] = useState<AsaasPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Formulário para filtragem
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      customer: "",
      externalReference: "",
      billingType: "ALL",
      status: "ALL",
      dateType: "dueDate",
    },
  });

  // Verificar se o Asaas está configurado
  useEffect(() => {
    const configured = asaasService.isConfigured();
    setIsConfigured(configured);
    
    if (configured) {
      // Fazer busca inicial de pagamentos
      handleSearch(form.getValues());
    }
  }, []);

  // Verificação de permissão
  if (!authState.isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (!isAuthorized([UserRole.ADMIN, UserRole.MANAGER])) {
    navigate('/dashboard');
    return null;
  }

  // Função para buscar pagamentos com os filtros
  const handleSearch = async (data: SearchFormValues) => {
    if (!isConfigured) {
      toast.error("API Asaas não configurada. Configure nas configurações.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Construir a query de busca
      const queryParams: string[] = [];
      
      if (data.customer) queryParams.push(`customer=${data.customer}`);
      if (data.externalReference) queryParams.push(`externalReference=${data.externalReference}`);
      if (data.billingType !== "ALL") queryParams.push(`billingType=${data.billingType}`);
      if (data.status !== "ALL") queryParams.push(`status=${data.status}`);
      
      // Adicionar filtros de data se existirem
      if (data.dateRange?.from && data.dateType) {
        const formattedFrom = format(data.dateRange.from, 'yyyy-MM-dd');
        queryParams.push(`${data.dateType}[ge]=${formattedFrom}`);
      }
      
      if (data.dateRange?.to && data.dateType) {
        const formattedTo = format(data.dateRange.to, 'yyyy-MM-dd');
        queryParams.push(`${data.dateType}[le]=${formattedTo}`);
      }
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      // Buscar pagamentos
      const result = await asaasService.getPayments(queryString);
      
      if (result && result.data) {
        setPayments(result.data);
        toast.success(`${result.data.length} cobranças encontradas.`);
      } else {
        setPayments([]);
        toast.info("Nenhuma cobrança encontrada.");
      }
    } catch (error) {
      console.error('Erro ao buscar cobranças:', error);
      
      let errorMessage = "Erro ao consultar cobranças. Verifique sua conexão com a API Asaas.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Mapeia o status para uma cor e texto em português
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pendente' },
      'RECEIVED': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Recebido' },
      'CONFIRMED': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Confirmado' },
      'OVERDUE': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Vencido' },
      'REFUNDED': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Estornado' },
      'CANCELED': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', label: 'Cancelado' },
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cobranças do Asaas</h1>
          <div className="flex space-x-2">
            <Button onClick={() => navigate('/settings')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Configurações
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
            <CardDescription>
              Busque cobranças utilizando os filtros abaixo. Deixe um filtro vazio para não aplicá-lo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConfigured && (
              <Alert className="mb-6 border-amber-500" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>API Asaas não configurada</AlertTitle>
                <AlertDescription>
                  Configure o token de acesso nas configurações antes de consultar cobranças.
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="externalReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência Externa (ID da Fatura)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 12345" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Cliente no Asaas</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: cus_abc123" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="billingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="BOLETO">Boleto</SelectItem>
                            <SelectItem value="PIX">PIX</SelectItem>
                            <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="PENDING">Pendente</SelectItem>
                            <SelectItem value="RECEIVED">Recebido</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                            <SelectItem value="OVERDUE">Vencido</SelectItem>
                            <SelectItem value="REFUNDED">Estornado</SelectItem>
                            <SelectItem value="CANCELED">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Data</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de data" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dateCreated">Data de Criação</SelectItem>
                            <SelectItem value="dueDate">Data de Vencimento</SelectItem>
                            <SelectItem value="paymentDate">Data de Pagamento</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Período</FormLabel>
                      <DatePickerWithRange 
                        value={field.value as DateRange | undefined} 
                        onChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!isConfigured || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar Cobranças
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado da Busca</CardTitle>
            <CardDescription>
              {payments.length > 0 
                ? `Mostrando ${payments.length} cobranças encontradas` 
                : "Nenhuma cobrança encontrada"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : payments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.description || "Sem descrição"}</TableCell>
                        <TableCell>R$ {payment.value.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{payment.dueDate}</TableCell>
                        <TableCell>{payment.billingType}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {payment.invoiceUrl && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(payment.invoiceUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" /> Fatura
                              </Button>
                            )}
                            {payment.bankSlipUrl && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(payment.bankSlipUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" /> Boleto
                              </Button>
                            )}
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
                <p className="text-muted-foreground">Nenhuma cobrança encontrada. Tente ajustar os filtros.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AsaasPaymentsList;
