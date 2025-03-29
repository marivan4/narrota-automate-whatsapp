
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from "sonner";
import { FileText, CheckCircle2, Loader2, Lock, Calendar } from 'lucide-react';
import { ContractFormValues } from '@/components/shared/contract/types';
import { getDefaultContractContent } from '@/components/shared/contracts/contractVariables';
import { whatsappService } from '@/utils/whatsappService';

const ContractSignature = () => {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contractId');
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [clientIp, setClientIp] = useState('');
  const [signatureInfo, setSignatureInfo] = useState({
    name: '',
    document: '',
  });
  const [signed, setSigned] = useState(false);

  // Fetch contract data
  useEffect(() => {
    const fetchContractData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call to get the contract
        // For demo purposes, we're simulating this with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock contract data retrieval
        if (!contractId) {
          toast.error("ID do contrato não encontrado");
          navigate('/contracts');
          return;
        }
        
        // Mock data - in real implementation, fetch from API
        const mockContract: ContractFormValues = {
          title: "Contrato de Rastreamento Veicular",
          content: getDefaultContractContent(),
          status: "active",
          clientId: "client123",
          clientName: "João Silva",
          clientDocument: "123.456.789-00",
          clientEmail: "joao.silva@example.com",
          clientPhone: "(11) 98765-4321",
          clientAddress: "Rua das Flores, 123",
          clientNumber: "123",
          clientNeighborhood: "Centro",
          clientCity: "São Paulo",
          clientState: "SP",
          clientZipCode: "01234-567",
          vehicleModel: "Honda Civic",
          vehiclePlate: "ABC1234",
          trackerModel: "GT06N",
          trackerIMEI: "123456789012345",
          installationLocation: "São Paulo, SP",
          serviceMonthlyAmount: "79,90"
        };
        
        setContract(mockContract);
        
        // Get client IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        setClientIp(ipData.ip);

      } catch (error) {
        toast.error("Erro ao carregar contrato");
        console.error("Error loading contract:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [contractId, navigate]);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signatureInfo.name || !signatureInfo.document) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setSigning(true);
    
    try {
      // Get current time in Brasilia timezone (GMT-3)
      const now = new Date();
      const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)).toISOString();
      
      // Get geolocation from IP (mock implementation)
      const geoData = {
        city: "Desconhecido",
        region: "Desconhecido",
        country: "BR",
        latitude: 0,
        longitude: 0
      };
      
      // In a real implementation, this would be an API call to sign the contract
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful signature
      const signatureData = {
        contractId,
        signedBy: signatureInfo.name,
        signedDocument: signatureInfo.document,
        signatureIP: clientIp,
        signatureTime: brasiliaTime,
        signatureLocation: `${geoData.city}, ${geoData.region}, ${geoData.country}`,
        signatureCoordinates: `${geoData.latitude}, ${geoData.longitude}`
      };
      
      console.log("Contract signed:", signatureData);
      setSigned(true);
      toast.success("Contrato assinado com sucesso!");
      
      // In a real implementation, send this data to your backend
    } catch (error) {
      toast.error("Erro ao assinar contrato");
      console.error("Error signing contract:", error);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <h2 className="text-2xl font-semibold">Carregando contrato...</h2>
              <p className="text-muted-foreground mt-2">Aguarde enquanto buscamos as informações do seu contrato</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8">
              <FileText className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold">Contrato não encontrado</h2>
              <p className="text-muted-foreground mt-2">O contrato solicitado não foi encontrado ou o link expirou</p>
              <Button className="mt-6" onClick={() => navigate('/')}>Voltar ao início</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="border-b">
          <CardTitle className="text-center flex items-center justify-center">
            <FileText className="mr-2 h-6 w-6" />
            Assinatura de Contrato Online
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          {signed ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-semibold text-center">Contrato Assinado com Sucesso!</h2>
              
              <p className="text-muted-foreground mt-4 text-center max-w-md">
                Obrigado! O contrato foi assinado e registrado com sucesso. Uma cópia será enviada para o seu email.
              </p>
              
              <div className="mt-8 bg-gray-50 p-4 rounded-md w-full">
                <div className="flex items-center text-sm mb-2">
                  <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Assinado com IP: {clientIp}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>
              
              <Button className="mt-8" onClick={() => navigate('/')}>
                Voltar ao início
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{contract.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Por favor, leia atentamente o contrato antes de assinar.
                </p>
                
                <div className="border rounded-md p-4 max-h-96 overflow-y-auto mb-4 bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: contract.content.replace(/\n/g, '<br />') }} />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h3 className="font-medium text-blue-800 mb-2">Informações do Contrato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="font-medium">Cliente:</span> {contract.clientName}
                    </div>
                    <div>
                      <span className="font-medium">Documento:</span> {contract.clientDocument}
                    </div>
                    <div>
                      <span className="font-medium">Veículo:</span> {contract.vehicleModel}
                    </div>
                    <div>
                      <span className="font-medium">Placa:</span> {contract.vehiclePlate}
                    </div>
                    <div>
                      <span className="font-medium">Valor Mensal:</span> R$ {contract.serviceMonthlyAmount}
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSign}>
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Assinatura Digital</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para assinar o contrato, confirme seu nome e documento de identificação abaixo.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nome Completo
                      </label>
                      <Input
                        id="name"
                        value={signatureInfo.name}
                        onChange={(e) => setSignatureInfo({ ...signatureInfo, name: e.target.value })}
                        placeholder="Digite seu nome completo"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="document" className="block text-sm font-medium mb-1">
                        CPF/CNPJ
                      </label>
                      <Input
                        id="document"
                        value={signatureInfo.document}
                        onChange={(e) => setSignatureInfo({ ...signatureInfo, document: e.target.value })}
                        placeholder="Digite seu CPF ou CNPJ"
                        required
                      />
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                      <p>
                        Ao clicar em "Assinar Contrato", você confirma que leu e concorda com todos os termos apresentados.
                        Esta assinatura é legalmente vinculativa.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    type="submit"
                    disabled={signing}
                  >
                    {signing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>Assinar Contrato</>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractSignature;
