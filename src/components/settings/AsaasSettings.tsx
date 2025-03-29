
import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, CreditCard, RefreshCw, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { asaasService, AsaasPayment, AsaasPaymentsResponse } from "@/services/asaasService";
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const asaasFormSchema = z.object({
  apiKey: z.string().min(10, {
    message: "O token de acesso deve ter pelo menos 10 caracteres.",
  }),
  environment: z.enum(["sandbox", "production"], {
    required_error: "Selecione o ambiente da API.",
  }),
  companyName: z.string().optional(),
  saveToLocalStorage: z.boolean().default(true),
});

type AsaasFormValues = z.infer<typeof asaasFormSchema>;

// Schema para consulta de pagamentos
const searchFormSchema = z.object({
  reference: z.string().optional(),
  customer: z.string().optional(),
  billingType: z.enum(["BOLETO", "PIX", "CREDIT_CARD", "ALL"], {
    required_error: "Selecione o tipo de cobrança.",
  }).default("ALL"),
  status: z.enum(["PENDING", "RECEIVED", "CONFIRMED", "OVERDUE", "REFUNDED", "CANCELED", "ALL"], {
    required_error: "Selecione o status do pagamento.",
  }).default("ALL"),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export function AsaasSettings() {
  const { authState } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);
  const [payments, setPayments] = useState<AsaasPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');
  const [configError, setConfigError] = useState<string | null>(null);

  // Inicializa o formulário com os dados salvos
  const form = useForm<AsaasFormValues>({
    resolver: zodResolver(asaasFormSchema),
    defaultValues: {
      apiKey: "",
      environment: "sandbox",
      companyName: "",
      saveToLocalStorage: true,
    },
  });

  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      reference: "",
      customer: "",
      billingType: "ALL",
      status: "ALL",
    },
  });

  // Carrega a configuração existente
  useEffect(() => {
    const config = asaasService.getConfig();
    if (config.apiKey) {
      form.setValue("apiKey", config.apiKey);
      form.setValue("environment", config.environment);
      form.setValue("companyName", config.companyName || '');
      setIsConfigured(true);
      
      if (config.companyId) {
        setCompanyId(config.companyId);
      } else if (authState.user?.id) {
        setCompanyId(authState.user.id);
      }
    }
  }, [form, authState]);

  async function onSubmit(data: AsaasFormValues) {
    try {
      setIsLoading(true);
      setConfigError(null);
      const currentCompanyId = companyId || authState.user?.id || 'default';
      
      // Salva a configuração
      asaasService.setConfig(
        data.apiKey, 
        data.environment, 
        currentCompanyId, 
        data.companyName || 'Minha Empresa'
      );
      
      // Salva a configuração específica da empresa
      asaasService.setCompanyConfig(
        currentCompanyId,
        data.companyName || 'Minha Empresa',
        data.apiKey,
        data.environment
      );
      
      // Se não quiser salvar no localStorage, remove
      if (!data.saveToLocalStorage) {
        localStorage.removeItem(`asaas_config_${currentCompanyId}`);
        localStorage.removeItem('asaas_config');
      }
      
      console.log('Testing Asaas API configuration...');
      console.log('API Key (first 5 chars):', data.apiKey.substring(0, 5));
      console.log('Environment:', data.environment);
      
      // Verifica se a configuração é válida fazendo uma chamada simples
      await asaasService.callApi('/customers?limit=1');
      
      setIsConfigured(true);
      toast.success("Configuração da API Asaas salva com sucesso!");
    } catch (error) {
      console.error('Erro ao validar configuração Asaas:', error);
      
      // Extrair mensagem de erro mais amigável
      let errorMessage = "Erro ao configurar API Asaas. Verifique o token de acesso.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setConfigError(errorMessage);
      toast.error(errorMessage);
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSearch(data: SearchFormValues) {
    try {
      setIsLoading(true);
      
      // Use the getPayments function from asaasService directly
      const result = await asaasService.getPayments(
        buildQueryString(data)
      );
      
      if (result && result.data) {
        setPayments(result.data);
        toast.success(`${result.data.length} pagamentos encontrados.`);
      } else {
        setPayments([]);
        toast.info("Nenhum pagamento encontrado.");
      }
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      
      let errorMessage = "Erro ao consultar pagamentos. Verifique sua conexão com a API Asaas.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Helper function to build the query string
  function buildQueryString(data: SearchFormValues): string {
    const queryParams = [];
    if (data.reference) queryParams.push(`externalReference=${data.reference}`);
    if (data.customer) queryParams.push(`customer=${data.customer}`);
    if (data.billingType !== "ALL") queryParams.push(`billingType=${data.billingType}`);
    if (data.status !== "ALL") queryParams.push(`status=${data.status}`);
    
    return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  }

  return (
    <Tabs defaultValue="config">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="config">Configuração</TabsTrigger>
        <TabsTrigger value="search">Consultar Pagamentos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="config">
        <Card>
          <CardHeader>
            <CardTitle>Configuração da API Asaas</CardTitle>
            <CardDescription>
              Configure sua integração com a API Asaas para emissão de pagamentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isConfigured && !configError && (
              <Alert className="mb-6 border-green-500 text-green-500">
                <Check className="h-4 w-4" />
                <AlertTitle>Integração configurada</AlertTitle>
                <AlertDescription>
                  Sua integração com a API Asaas está configurada e pronta para uso.
                </AlertDescription>
              </Alert>
            )}
            
            {configError && (
              <Alert className="mb-6 border-amber-500 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro na configuração</AlertTitle>
                <AlertDescription>
                  {configError}
                  <div className="mt-2">
                    <p className="text-xs text-amber-600">
                      Dicas para resolver:
                      <ul className="list-disc pl-4 mt-1">
                        <li>Verifique se o token de acesso está correto</li>
                        <li>Confirme se você selecionou o ambiente correto (Sandbox ou Produção)</li>
                        <li>Certifique-se que o token tem as permissões necessárias</li>
                      </ul>
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Minha Empresa"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Nome para identificação da empresa no sistema.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token de Acesso (API Key)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="$aact_YourAccessToken"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormDescription>
                        Token de acesso fornecido pela Asaas em sua área de desenvolvedor.
                        <br />
                        <span className="text-xs text-amber-600">
                          Tokens de sandbox começam com $aact_YourAccessToken
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ambiente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o ambiente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                          <SelectItem value="production">Produção</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        O ambiente Sandbox é recomendado para testes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="saveToLocalStorage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Salvar configurações no navegador
                        </FormLabel>
                        <FormDescription>
                          As configurações ficarão salvas neste dispositivo.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <CardFooter className="flex justify-end pt-6 px-0">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Salvar configuração"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="search">
        <Card>
          <CardHeader>
            <CardTitle>Consultar Pagamentos</CardTitle>
            <CardDescription>
              Consulte pagamentos gerados pela sua empresa na API Asaas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConfigured && (
              <Alert className="mb-6 border-amber-500">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuração necessária</AlertTitle>
                <AlertDescription>
                  Configure sua integração com a API Asaas antes de consultar pagamentos.
                </AlertDescription>
              </Alert>
            )}

            <Form {...searchForm}>
              <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={searchForm.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência Externa</FormLabel>
                        <FormControl>
                          <Input placeholder="Código da fatura..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={searchForm.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="ID do cliente no Asaas..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={searchForm.control}
                    name="billingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Cobrança</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={searchForm.control}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!isConfigured || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Consultando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Consultar Pagamentos
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            
            {payments.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Resultados ({payments.length} pagamentos)</h3>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">
                              ID: <span className="font-normal">{payment.id}</span>
                            </p>
                            <p className="text-sm font-medium">
                              Descrição: <span className="font-normal">{payment.description || 'Sem descrição'}</span>
                            </p>
                            <p className="text-sm font-medium">
                              Valor: <span className="font-normal">R$ {payment.value.toFixed(2)}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Tipo: <span className="font-normal">{payment.billingType}</span>
                            </p>
                            <p className="text-sm font-medium">
                              Status: <span className="font-normal">{payment.status}</span>
                            </p>
                            <p className="text-sm font-medium">
                              Vencimento: <span className="font-normal">{payment.dueDate}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {payment.invoiceUrl && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => window.open(payment.invoiceUrl, '_blank')}
                              >
                                Ver Fatura
                              </Button>
                            )}
                            
                            {payment.bankSlipUrl && payment.billingType === 'BOLETO' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => window.open(payment.bankSlipUrl, '_blank')}
                              >
                                Ver Boleto
                              </Button>
                            )}
                            
                            <Button 
                              variant="default"
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                // Aqui poderia mostrar mais detalhes, como em um modal
                                toast.info(`Pagamento ${payment.id} selecionado.`);
                              }}
                            >
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
