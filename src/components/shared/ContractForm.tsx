import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { FileText, Save, SendHorizontal, Link } from 'lucide-react';
import {
  Form,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ClientFormValues } from '../forms/ClientForm';
import ContractFormBasic from './contract/ContractFormBasic';
import ContractFormClient from './contract/ContractFormClient';
import ContractFormVehicle from './contract/ContractFormVehicle';
import ContractFormPreview from './contract/ContractFormPreview';
import ContractWhatsAppDialog from './contract/ContractWhatsAppDialog';
import { contractFormSchema, ContractFormValues, ContractFormProps, Client } from './contract/types';
import { mockClients } from './contracts/mockClients';
import { getDefaultContractContent } from './contracts/contractVariables';
import { contractSignatureService } from '@/utils/contractSignatureService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showVariablesPopover, setShowVariablesPopover] = useState(false);
  const [contentCursorPosition, setContentCursorPosition] = useState(0);
  const [signatureLink, setSignatureLink] = useState('');
  const [showSignatureLink, setShowSignatureLink] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [uploadedPdfContent, setUploadedPdfContent] = useState('');
  
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

  // This effect will update the contract content whenever client or vehicle data changes
  useEffect(() => {
    const replaceVariablesWithData = () => {
      const values = form.getValues();
      let content = values.content;
      
      // Only proceed if we have base content and client data
      if (!content || !values.clientName) return;

      // Replace client variables
      content = content.replace(/\{\{cliente\.nome\}\}/g, values.clientName || '');
      content = content.replace(/\{\{cliente\.documento\}\}/g, values.clientDocument || '');
      content = content.replace(/\{\{cliente\.email\}\}/g, values.clientEmail || '');
      content = content.replace(/\{\{cliente\.telefone\}\}/g, values.clientPhone || '');
      content = content.replace(/\{\{cliente\.endereco\}\}/g, values.clientAddress || '');
      content = content.replace(/\{\{cliente\.numero\}\}/g, values.clientNumber || '');
      content = content.replace(/\{\{cliente\.bairro\}\}/g, values.clientNeighborhood || '');
      content = content.replace(/\{\{cliente\.cidade\}\}/g, values.clientCity || '');
      content = content.replace(/\{\{cliente\.estado\}\}/g, values.clientState || '');
      content = content.replace(/\{\{cliente\.cep\}\}/g, values.clientZipCode || '');
      
      // Replace vehicle variables
      content = content.replace(/\{\{veiculo\.modelo\}\}/g, values.vehicleModel || '');
      content = content.replace(/\{\{veiculo\.placa\}\}/g, values.vehiclePlate || '');
      content = content.replace(/\{\{rastreador\.modelo\}\}/g, values.trackerModel || '');
      content = content.replace(/\{\{rastreador\.imei\}\}/g, values.trackerIMEI || '');
      content = content.replace(/\{\{servico\.valor\}\}/g, values.serviceMonthlyAmount || '');
      content = content.replace(/\{\{instalacao\.local\}\}/g, values.installationLocation || '');
      
      // Update the form with the new content if it's different
      if (content !== values.content) {
        form.setValue('content', content);
      }
    };

    // Call the function when in preview mode or when client/vehicle data changes
    if (currentSection === 'preview') {
      replaceVariablesWithData();
    }
  }, [currentSection, form]);

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

  // Handle PDF contract upload
  const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setContractFile(file);
      
      // Here you would normally use a PDF parsing library
      // For this demo, we'll just set a placeholder message
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          toast.success(`Arquivo "${file.name}" carregado com sucesso`);
          setUploadedPdfContent(`Conteúdo do arquivo PDF "${file.name}" seria exibido aqui. Em uma implementação real, o conteúdo seria extraído usando uma biblioteca de parsing de PDF.`);
          
          // Set contract content to the placeholder
          form.setValue('content', uploadedPdfContent);
        }
      };
      reader.readAsText(file);
    }
  };

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
      
      // Generate contract ID (in a real app, this would come from the database)
      const contractId = `contract-${Date.now()}`;
      
      // Generate signature link
      const currentDomain = window.location.origin;
      const link = contractSignatureService.generateSignatureLink(contractId, currentDomain);
      setSignatureLink(link);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onSubmit) {
        onSubmit(values);
      }
      
      toast.success(isEditing ? "Contrato atualizado com sucesso!" : "Contrato criado com sucesso!");
      
      // Show signature link after contract creation
      if (!isEditing) {
        setShowSignatureLink(true);
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o contrato. Por favor, tente novamente.");
      console.error("Error submitting contract:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm('');
  };

  const handleAddNewClient = (clientData: ClientFormValues) => {
    // Create a new client with all required fields from ClientFormValues
    const newClient: Client = {
      id: String(Date.now()),
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      document: clientData.document,
      address: clientData.address,
      city: clientData.city,
      state: clientData.state,
      zipCode: clientData.zipCode,
      role: clientData.role
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

  // Send via WhatsApp with signature link
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
      const values = form.getValues();
      
      // Generate contract ID (in a real app, this would come from the database)
      const contractId = `contract-${Date.now()}`;
      
      // Send contract with signature link via WhatsApp
      await contractSignatureService.sendContractViaWhatsApp(
        phoneNumber,
        values,
        contractId,
        values.clientName
      );
      
      if (onSendWhatsApp) {
        onSendWhatsApp(phoneNumber, values);
      }
      
      toast.success("Contrato com link de assinatura enviado por WhatsApp com sucesso!");
      setShowWhatsAppForm(false);
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar o contrato. Por favor, tente novamente.");
      console.error("Error sending contract:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Copy signature link to clipboard
  const copySignatureLink = () => {
    navigator.clipboard.writeText(signatureLink);
    toast.success("Link de assinatura copiado para a área de transferência!");
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
              <>
                <ContractFormBasic 
                  form={form} 
                  showVariablesPopover={showVariablesPopover}
                  setShowVariablesPopover={setShowVariablesPopover}
                  handleInsertVariable={handleInsertVariable}
                  handleCaptureTextareaCursor={handleCaptureTextareaCursor}
                />
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Upload de Contrato PDF</h3>
                  <p className="text-xs text-muted-foreground mb-2">Você também pode fazer upload de um contrato em PDF</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleContractFileChange}
                    className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary file:text-white
                              hover:file:bg-primary/80"
                  />
                </div>
              </>
            )}

            {currentSection === 'client' && (
              <ContractFormClient 
                form={form} 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredClients={filteredClients}
                selectedClient={selectedClient}
                setSelectedClient={setSelectedClient}
                showNewClientForm={showNewClientForm}
                setShowNewClientForm={setShowNewClientForm}
                handleSelectClient={handleSelectClient}
                handleAddNewClient={handleAddNewClient}
              />
            )}

            {currentSection === 'vehicle' && (
              <ContractFormVehicle form={form} />
            )}

            {currentSection === 'preview' && (
              <ContractFormPreview form={form} />
            )}
            
            <div className="flex justify-between space-x-2 pt-4 border-t">
              <div>
                {showSignatureLink && (
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Link className="h-4 w-4 mr-2" />
                          Link de Assinatura
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Link para Assinatura Online</h4>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={signatureLink}
                              readOnly
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                            />
                            <Button size="sm" onClick={copySignatureLink}>
                              Copiar
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Compartilhe este link com o cliente para assinatura online.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {currentSection === 'preview' && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowWhatsAppForm(true)}
                  >
                    <SendHorizontal className="h-4 w-4 mr-2" />
                    Enviar por WhatsApp
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Atualizar Contrato' : 'Salvar Contrato'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            switch (currentSection) {
              case 'client':
                setCurrentSection('basic');
                break;
              case 'vehicle':
                setCurrentSection('client');
                break;
              case 'preview':
                setCurrentSection('vehicle');
                break;
            }
          }}
          disabled={currentSection === 'basic'}
        >
          Anterior
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            switch (currentSection) {
              case 'basic':
                setCurrentSection('client');
                break;
              case 'client':
                setCurrentSection('vehicle');
                break;
              case 'vehicle':
                setCurrentSection('preview');
                break;
            }
          }}
          disabled={currentSection === 'preview'}
        >
          Próximo
        </Button>
      </CardFooter>

      <ContractWhatsAppDialog
        open={showWhatsAppForm}
        onOpenChange={setShowWhatsAppForm}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        isSending={isSending}
        handleSendWhatsApp={handleSendWhatsApp}
      />
    </Card>
  );
};

export default ContractForm;
