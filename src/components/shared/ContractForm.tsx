
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { FileText, Save, SendHorizontal, Info } from 'lucide-react';
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

const contractFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  status: z.string(),
  // Cliente data
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
    installationLocation: ''
  },
  isEditing = false,
}) => {
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentSection, setCurrentSection] = useState<'basic' | 'client' | 'vehicle' | 'preview'>('basic');

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      title: initialData.title || '',
      content: initialData.content || '',
      status: initialData.status || 'draft',
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
    }
  });

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
    // Format the current date in Brazilian format
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    return (
      <div className="p-4 bg-white border rounded-md max-h-[400px] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-4">{values.title}</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Dados do Cliente</h3>
          <p><strong>CPF/CNPJ:</strong> {values.clientDocument}</p>
          <p><strong>Nome:</strong> {values.clientName}</p>
          <p><strong>E-mail:</strong> {values.clientEmail}</p>
          <p><strong>Telefone:</strong> {values.clientPhone}</p>
          <p><strong>Endereço:</strong> {values.clientAddress}, {values.clientNumber}</p>
          <p><strong>Bairro:</strong> {values.clientNeighborhood}</p>
          <p><strong>Cidade/Estado:</strong> {values.clientCity}/{values.clientState}</p>
          <p><strong>CEP:</strong> {values.clientZipCode}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Informações do Veículo e Rastreador</h3>
          <p><strong>Modelo do Veículo:</strong> {values.vehicleModel}</p>
          <p><strong>Placa:</strong> {values.vehiclePlate}</p>
          <p><strong>Modelo do Rastreador:</strong> {values.trackerModel}</p>
          <p><strong>IMEI do Rastreador:</strong> {values.trackerIMEI}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Informações Adicionais</h3>
          <p><strong>Data de Registro:</strong> {currentDate}</p>
          <p><strong>Local de Instalação:</strong> {values.installationLocation}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Termos do Contrato</h3>
          <p className="whitespace-pre-line">{values.content}</p>
        </div>
        
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo do Contrato</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Termos e condições do contrato..." 
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentSection === 'client' && (
              <div className="space-y-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da rua" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
