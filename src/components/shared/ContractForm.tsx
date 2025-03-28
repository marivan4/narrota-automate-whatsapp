
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { FileText, Save, SendHorizontal, Info, Plus, User, Search, Variable } from 'lucide-react';
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
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ClientFormValues } from '../forms/ClientForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ClientForm from '../forms/ClientForm';
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock de clientes para demonstração
const mockClients = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    role: 'client'
  },
  {
    id: '2',
    name: 'Maria Souza',
    email: 'maria.souza@exemplo.com',
    phone: '(21) 98765-4321',
    document: '987.654.321-00',
    address: 'Avenida Central, 456',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '21234-567',
    role: 'client'
  },
  {
    id: '3',
    name: 'Carlos Pereira',
    email: 'carlos.pereira@exemplo.com',
    phone: '(31) 98765-4321',
    document: '456.789.123-00',
    address: 'Rua Principal, 789',
    city: 'Belo Horizonte',
    state: 'MG',
    zipCode: '31234-567',
    role: 'client'
  }
];

// Variáveis disponíveis para inserção no contrato
const contractVariables = [
  { key: '{cliente_firstname}', description: 'Primeiro nome do cliente' },
  { key: '{cliente_lastname}', description: 'Sobrenome do cliente' },
  { key: '{cliente_name}', description: 'Nome completo do cliente' },
  { key: '{cliente_document}', description: 'CPF/CNPJ do cliente' },
  { key: '{cliente_email}', description: 'Email do cliente' },
  { key: '{cliente_phone}', description: 'Telefone do cliente' },
  { key: '{cliente_address1}', description: 'Endereço do cliente' },
  { key: '{cliente_city}', description: 'Cidade do cliente' },
  { key: '{cliente_state}', description: 'Estado do cliente' },
  { key: '{cliente_postcode}', description: 'CEP do cliente' },
  { key: '{cliente_customfields1}', description: 'CPF/CNPJ do cliente' },
  { key: '{servico_recurringamount}', description: 'Valor mensal do serviço' },
  { key: '{servico_regdate}', description: 'Data de registro do serviço' },
  { key: '{veiculo_modelo}', description: 'Modelo do veículo' },
  { key: '{veiculo_placa}', description: 'Placa do veículo' },
  { key: '{rastreador_modelo}', description: 'Modelo do rastreador' },
  { key: '{rastreador_imei}', description: 'IMEI do rastreador' },
];

const contractFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  status: z.string(),
  // Cliente data
  clientId: z.string().optional(),
  clientName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  clientDocument: z.string().min(11, "CPF/CNPJ inválido"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().min(10, "Telefone inválido"),
  // Address
  clientAddress: z.string().min(5, "Endereço inválido"),
  clientNumber: z.string(),
  clientNeighborhood: z.string(),
  clientCity: z.string(),
  clientState: z.string(),
  clientZipCode: z.string(),
  // Vehicle data
  vehicleModel: z.string(),
  vehiclePlate: z.string(),
  trackerModel: z.string(),
  trackerIMEI: z.string(),
  // Additional info
  installationLocation: z.string(),
  // Service data
  serviceMonthlyAmount: z.string(),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormProps {
  onSubmit?: (data: ContractFormValues) => void;
  onSendWhatsApp?: (phoneNumber: string, contractData: ContractFormValues) => void;
  initialData?: Partial<ContractFormValues>;
  isEditing?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({
  onSubmit,
  onSendWhatsApp,
  initialData = {
    title: '',
    content: '',
    status: 'draft',
    clientId: '',
    clientName: '',
    clientDocument: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientNumber: '',
    clientNeighborhood: '',
    clientCity: '',
    clientState: '',
    clientZipCode: '',
    vehicleModel: '',
    vehiclePlate: '',
    trackerModel: '',
    trackerIMEI: '',
    installationLocation: '',
    serviceMonthlyAmount: '79,90'
  },
  isEditing = false,
}) => {
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentSection, setCurrentSection] = useState<'basic' | 'client' | 'vehicle' | 'preview'>('basic');
  const [clients, setClients] = useState(mockClients);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showVariablesPopover, setShowVariablesPopover] = useState(false);
  const [contentCursorPosition, setContentCursorPosition] = useState(0);
  
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      title: initialData.title || '',
      content: initialData.content || getDefaultContractContent(),
      status: initialData.status || 'draft',
      clientId: initialData.clientId || '',
      clientName: initialData.clientName || '',
      clientDocument: initialData.clientDocument || '',
      clientEmail: initialData.clientEmail || '',
      clientPhone: initialData.clientPhone || '',
      clientAddress: initialData.clientAddress || '',
      clientNumber: initialData.clientNumber || '',
      clientNeighborhood: initialData.clientNeighborhood || '',
      clientCity: initialData.clientCity || '',
      clientState: initialData.clientState || '',
      clientZipCode: initialData.clientZipCode || '',
      vehicleModel: initialData.vehicleModel || '',
      vehiclePlate: initialData.vehiclePlate || '',
      trackerModel: initialData.trackerModel || '',
      trackerIMEI: initialData.trackerIMEI || '',
      installationLocation: initialData.installationLocation || '',
      serviceMonthlyAmount: initialData.serviceMonthlyAmount || '79,90',
    }
  });

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.document.includes(searchTerm)
  );

  useEffect(() => {
    if (selectedClient) {
      form.setValue('clientId', selectedClient.id);
      form.setValue('clientName', selectedClient.name);
      form.setValue('clientDocument', selectedClient.document);
      form.setValue('clientEmail', selectedClient.email);
      form.setValue('clientPhone', selectedClient.phone);
      form.setValue('clientAddress', selectedClient.address);
      form.setValue('clientCity', selectedClient.city);
      form.setValue('clientState', selectedClient.state);
      form.setValue('clientZipCode', selectedClient.zipCode);
    }
  }, [selectedClient, form]);

  function getDefaultContractContent() {
    return `CONTRATO DE COMODATO DE EQUIPAMENTO, MONITORAMENTO DE VEÍCULO, SISTEMA DE AUTO-GESTÃO E OUTRAS AVENÇAS

Por este Instrumento particular, de um lado NARROTA GPSTRACKER SERVIÇOS DE MONITORAMENTO, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 52.273.723/0001-68, com sede (matriz) à Rua: dr urbano figueira 125,Bairro Ns da Guia, cidade Tremembé, São Paulo CEP:12125-030, aqui denominado "CONTRATADA" e de outro lado {cliente_firstname} {cliente_lastname}, na cidade de {cliente_city}, estado de {cliente_state}, Rua:{cliente_address1}, cep: {cliente_postcode}, inscrita no CPF/CNPJ sob o n° {cliente_customfields1}, neste ato representado na forma como representante legal, doravante referida simplesmente como {cliente_firstname} {cliente_lastname}, aqui denominado devidamente qualificado no Pedido de Adesão Comodato de Rastreamento NARROTA GPSTRACKER, parte integrante deste Contrato, têm entre si justo e acertado o presente INSTRUMENTO PARTICULAR DE CONTRATO DE COMODATO, PRESTAÇÃO DE SERVIÇOS E OUTRAS AVENÇAS que se regerá pela cláusulas e condições descritas, conforme segue:

1 DO OBJETO DO CONTRATO

1.1 A "CONTRATADA" cede em comodato ao CONTRATANTE o Equipamento descrito no Pedido de Compra ou Comodato parte integrante deste instrumento, bem como a Prestação de Serviços de rastreamento por parte da "CONTRATADA", possibilitando, localização, rastreamento ou a localização por aproximação setorial do veículo do CONTRATANTE, por GSM/GPRS (General Packet Radio Serviço) da sua Central 24 (vinte e quatro) horas, de acordo com a opção feita pelo cliente.
`;
  }

  const handleFormSubmit = async (values: ContractFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Capture IP and geolocation data
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;
      
      // Get geolocation from IP (mock implementation)
      const geoData = {
        city: "Desconhecido",
        region: "Desconhecido",
        country: "BR",
        latitude: 0,
        longitude: 0
      };
      
      // Get current time in Brasilia timezone (GMT-3)
      const now = new Date();
      const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)).toISOString();
      
      // Add contract signature metadata
      const contractWithMetadata = {
        ...values,
        signatureIP: ip,
        signatureTime: brasiliaTime,
        signatureLocation: `${geoData.city}, ${geoData.region}, ${geoData.country}`,
        signatureCoordinates: `${geoData.latitude}, ${geoData.longitude}`
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onSubmit) {
        onSubmit(values);
      }
      
      toast.success(isEditing ? "Contrato atualizado com sucesso!" : "Contrato criado com sucesso!");
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o contrato. Por favor, tente novamente.");
      console.error("Error submitting contract:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setSearchTerm('');
  };

  const handleAddNewClient = (clientData: ClientFormValues) => {
    const newClient = {
      id: String(Date.now()),
      ...clientData
    };
    
    setClients([...clients, newClient]);
    setSelectedClient(newClient);
    setShowNewClientForm(false);
    toast.success("Cliente adicionado com sucesso!");
  };

  const handleInsertVariable = (variable: string) => {
    const contentTextarea = document.getElementById('content') as HTMLTextAreaElement;
    const currentContent = form.getValues('content');
    const cursorPos = contentCursorPosition || 0;
    
    const newContent = currentContent.substring(0, cursorPos) + 
                       variable + 
                       currentContent.substring(cursorPos);
    
    form.setValue('content', newContent);
    setShowVariablesPopover(false);
    
    // Focus back on textarea and set cursor position after the inserted variable
    setTimeout(() => {
      if (contentTextarea) {
        contentTextarea.focus();
        const newCursorPos = cursorPos + variable.length;
        contentTextarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 100);
  };

  const handleCaptureTextareaCursor = (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    setContentCursorPosition(textarea.selectionStart);
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Brazilian phone number validation
    const phoneRegex = /^(\+55|55)?(\d{2})(\d{8,9})$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      toast.error("Por favor, informe um número de telefone válido (DDD + número).");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (onSendWhatsApp) {
        onSendWhatsApp(phoneNumber, form.getValues());
      }
      
      toast.success("Contrato enviado por WhatsApp com sucesso!");
      setShowWhatsAppForm(false);
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar o contrato. Por favor, tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  const generateContractPreview = () => {
    const values = form.getValues();
    
    // Process variable replacements
    let processedContent = values.content;
    
    // Get first and last name from full name
    const nameParts = values.clientName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Format the current date in Brazilian format
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Replace variables with actual values
    processedContent = processedContent
      .replace(/{cliente_firstname}/g, firstName)
      .replace(/{cliente_lastname}/g, lastName)
      .replace(/{cliente_name}/g, values.clientName)
      .replace(/{cliente_document}/g, values.clientDocument)
      .replace(/{cliente_customfields1}/g, values.clientDocument)
      .replace(/{cliente_email}/g, values.clientEmail)
      .replace(/{cliente_phone}/g, values.clientPhone)
      .replace(/{cliente_address1}/g, `${values.clientAddress}, ${values.clientNumber}`)
      .replace(/{cliente_city}/g, values.clientCity)
      .replace(/{cliente_state}/g, values.clientState)
      .replace(/{cliente_postcode}/g, values.clientZipCode)
      .replace(/{servico_recurringamount}/g, values.serviceMonthlyAmount)
      .replace(/{servico_regdate}/g, currentDate)
      .replace(/{veiculo_modelo}/g, values.vehicleModel)
      .replace(/{veiculo_placa}/g, values.vehiclePlate)
      .replace(/{rastreador_modelo}/g, values.trackerModel)
      .replace(/{rastreador_imei}/g, values.trackerIMEI);
    
    return (
      <div className="p-4 bg-white border rounded-md max-h-[400px] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-4">{values.title}</h2>
        <div className="whitespace-pre-line text-gray-800">{processedContent}</div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Assinatura do Cliente:</p>
              <div className="h-10 w-48 border-b border-dashed mt-6"></div>
              <p>{values.clientName}</p>
              <p>CPF/CNPJ: {values.clientDocument}</p>
            </div>
            
            <div>
              <p className="font-semibold">Assinatura da Empresa:</p>
              <div className="h-10 w-48 border-b border-dashed mt-6"></div>
              <p>Sistema de Rastreamento Veicular</p>
              <p>CNPJ: 00.000.000/0001-00</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>{isEditing ? 'Editar Contrato' : 'Novo Contrato'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <Button 
              variant={currentSection === 'basic' ? 'default' : 'outline'} 
              onClick={() => setCurrentSection('basic')}
            >
              Informações Básicas
            </Button>
            <Button 
              variant={currentSection === 'client' ? 'default' : 'outline'} 
              onClick={() => setCurrentSection('client')}
            >
              Dados do Cliente
            </Button>
            <Button 
              variant={currentSection === 'vehicle' ? 'default' : 'outline'} 
              onClick={() => setCurrentSection('vehicle')}
            >
              Veículo e Rastreador
            </Button>
            <Button 
              variant={currentSection === 'preview' ? 'default' : 'outline'} 
              onClick={() => setCurrentSection('preview')}
            >
              Pré-visualização
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {currentSection === 'basic' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Contrato</FormLabel>
                      <FormControl>
                        <Input placeholder="Contrato de Serviço de Rastreamento Veicular" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="serviceMonthlyAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mensal (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="79,90" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel htmlFor="content">Conteúdo do Contrato</FormLabel>
                    <Popover open={showVariablesPopover} onOpenChange={setShowVariablesPopover}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" type="button">
                          <Variable className="h-4 w-4 mr-1" />
                          Inserir Variável
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end">
                        <div className="p-2 border-b">
                          <h4 className="text-sm font-medium">Variáveis Disponíveis</h4>
                          <p className="text-xs text-muted-foreground">
                            Clique em uma variável para inseri-la no contrato
                          </p>
                        </div>
                        <ScrollArea className="h-72">
                          <div className="p-2">
                            {contractVariables.map((variable) => (
                              <button
                                key={variable.key}
                                type="button"
                                onClick={() => handleInsertVariable(variable.key)}
                                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-secondary flex items-center justify-between mb-1"
                              >
                                <span className="font-mono">{variable.key}</span>
                                <span className="text-xs text-muted-foreground">{variable.description}</span>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            id="content"
                            placeholder="Termos e condições do contrato..." 
                            className="min-h-[400px] font-mono text-sm" 
                            {...field} 
                            onClick={handleCaptureTextareaCursor}
                            onKeyUp={handleCaptureTextareaCursor}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentSection === 'client' && (
              <div className="space-y-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Selecionar Cliente</h3>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Buscar cliente por nome ou CPF/CNPJ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                      <Dialog open={showNewClientForm} onOpenChange={setShowNewClientForm}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" /> Novo Cliente
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                          </DialogHeader>
                          <ClientForm onSubmit={handleAddNewClient} />
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {searchTerm && filteredClients.length > 0 && (
                      <div className="bg-white border rounded-md shadow-sm">
                        {filteredClients.map(client => (
                          <div
                            key={client.id}
                            className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSelectClient(client)}
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.document} | {client.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedClient && (
                      <div className="bg-white border rounded-md p-3">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Cliente Selecionado</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClient(null)}
                          >
                            Remover
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <p><span className="font-medium">Nome:</span> {selectedClient.name}</p>
                          <p><span className="font-medium">Documento:</span> {selectedClient.document}</p>
                          <p><span className="font-medium">E-mail:</span> {selectedClient.email}</p>
                          <p><span className="font-medium">Telefone:</span> {selectedClient.phone}</p>
                          <p><span className="font-medium">Endereço:</span> {selectedClient.address}</p>
                          <p><span className="font-medium">Cidade/Estado:</span> {selectedClient.city}/{selectedClient.state}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Dados do Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do cliente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF/CNPJ</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="clientAddress"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da rua" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="clientNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientNeighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientZipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="clientCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AC">Acre</SelectItem>
                              <SelectItem value="AL">Alagoas</SelectItem>
                              <SelectItem value="AP">Amapá</SelectItem>
                              <SelectItem value="AM">Amazonas</SelectItem>
                              <SelectItem value="BA">Bahia</SelectItem>
                              <SelectItem value="CE">Ceará</SelectItem>
                              <SelectItem value="DF">Distrito Federal</SelectItem>
                              <SelectItem value="ES">Espírito Santo</SelectItem>
                              <SelectItem value="GO">Goiás</SelectItem>
                              <SelectItem value="MA">Maranhão</SelectItem>
                              <SelectItem value="MT">Mato Grosso</SelectItem>
                              <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                              <SelectItem value="MG">Minas Gerais</SelectItem>
                              <SelectItem value="PA">Pará</SelectItem>
                              <SelectItem value="PB">Paraíba</SelectItem>
                              <SelectItem value="PR">Paraná</SelectItem>
                              <SelectItem value="PE">Pernambuco</SelectItem>
                              <SelectItem value="PI">Piauí</SelectItem>
                              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                              <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                              <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                              <SelectItem value="RO">Rondônia</SelectItem>
                              <SelectItem value="RR">Roraima</SelectItem>
                              <SelectItem value="SC">Santa Catarina</SelectItem>
                              <SelectItem value="SP">São Paulo</SelectItem>
                              <SelectItem value="SE">Sergipe</SelectItem>
                              <SelectItem value="TO">Tocantins</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentSection === 'vehicle' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo do Veículo</FormLabel>
                        <FormControl>
                          <Input placeholder="Marca e modelo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vehiclePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="trackerModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo do Rastreador</FormLabel>
                        <FormControl>
                          <Input placeholder="Modelo do rastreador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="trackerIMEI"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IMEI do Rastreador</FormLabel>
                        <FormControl>
                          <Input placeholder="Número IMEI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="installationLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local de Instalação</FormLabel>
                      <FormControl>
                        <Input placeholder="Local onde o rastreador foi instalado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentSection === 'preview' && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Esta é uma pré-visualização do contrato. Verifique todos os dados antes de finalizar.</span>
                </div>
                
                {generateContractPreview()}
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              <div>
                {currentSection !== 'basic' && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (currentSection === 'client') setCurrentSection('basic');
                      if (currentSection === 'vehicle') setCurrentSection('client');
                      if (currentSection === 'preview') setCurrentSection('vehicle');
                    }}
                  >
                    Voltar
                  </Button>
                )}
              </div>
              
              <div className="space-x-2">
                {currentSection !== 'preview' ? (
                  <Button 
                    type="button"
                    onClick={() => {
                      if (currentSection === 'basic') setCurrentSection('client');
                      if (currentSection === 'client') setCurrentSection('vehicle');
                      if (currentSection === 'vehicle') setCurrentSection('preview');
                    }}
                  >
                    Próximo
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowWhatsAppForm(!showWhatsAppForm)}
                      disabled={isSubmitting}
                    >
                      <SendHorizontal className="h-4 w-4 mr-2" />
                      Enviar por WhatsApp
                    </Button>
                    
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Salvando...' : 'Finalizar Contrato'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
        
        {showWhatsAppForm && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/50 animate-slide-up">
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Número de WhatsApp</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Ex: 5511999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Formato: DDD + número (apenas números)
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Os contratos são enviados como PDF via WhatsApp</span>
        {isEditing && (
          <span>Última modificação: {new Date().toLocaleDateString('pt-BR')}</span>
        )}
      </CardFooter>
    </Card>
  );
};

export default ContractForm;
