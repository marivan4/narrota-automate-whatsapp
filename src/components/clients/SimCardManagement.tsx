
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, RefreshCw, Plus, Trash2, FileUp, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SimCard {
  id: string;
  cliente: string;
  conta: string;
  plano: string;
  iccid: string;
  msisdn: string;
  imsi: string;
  imei: string;
  dtAtivacao: string;
}

const SimCardManagement: React.FC<{ clientId?: string; clientName?: string }> = ({ clientId, clientName }) => {
  const [simCards, setSimCards] = useState<SimCard[]>([
    {
      id: '1',
      cliente: clientName || 'João Silva',
      conta: 'Conta Premium',
      plano: 'M2M Padrão',
      iccid: '8955001812345678901',
      msisdn: '5511987654321',
      imsi: '724010123456789',
      imei: '359909876543210',
      dtAtivacao: '15/03/2023'
    },
    {
      id: '2',
      cliente: clientName || 'João Silva',
      conta: 'Conta Premium',
      plano: 'Dual C',
      iccid: '8955001887654321098',
      msisdn: '5511912345678',
      imsi: '724010987654321',
      imei: '359901234567890',
      dtAtivacao: '20/06/2023'
    }
  ]);
  
  const [isAddSimCardOpen, setIsAddSimCardOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [uploadType, setUploadType] = useState<'csv' | 'xml'>('csv');
  const [formData, setFormData] = useState<Omit<SimCard, 'id'>>({
    cliente: clientName || '',
    conta: '',
    plano: '',
    iccid: '',
    msisdn: '',
    imsi: '',
    imei: '',
    dtAtivacao: ''
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSimCard = () => {
    // Validate required fields
    if (!formData.iccid || !formData.msisdn) {
      toast.error('ICCID e MSISDN são campos obrigatórios');
      return;
    }

    const newSimCard: SimCard = {
      id: Date.now().toString(),
      ...formData,
      cliente: clientName || formData.cliente,
    };

    setSimCards([...simCards, newSimCard]);
    toast.success('SIM Card adicionado com sucesso!');
    setIsAddSimCardOpen(false);
    resetForm();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const processUpload = () => {
    // This is a simplified implementation that assumes proper formatting
    // In a real app, you would need more robust parsing logic
    
    if (!fileContent) {
      toast.error('Nenhum arquivo carregado');
      return;
    }

    try {
      let newSimCards: SimCard[] = [];
      
      if (uploadType === 'csv') {
        // Simple CSV parsing (assumes perfect format)
        const lines = fileContent.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const simCard: any = { id: Date.now().toString() + i };
          
          headers.forEach((header, index) => {
            simCard[header.trim().toLowerCase()] = values[index]?.trim() || '';
          });
          
          newSimCards.push(simCard as SimCard);
        }
      } else if (uploadType === 'xml') {
        // Very simplified XML parsing 
        // In a real app, you would use a proper XML parser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(fileContent, "text/xml");
        const cards = xmlDoc.getElementsByTagName("simcard");
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const simCard: any = { id: Date.now().toString() + i };
          
          ['cliente', 'conta', 'plano', 'iccid', 'msisdn', 'imsi', 'imei', 'dtAtivacao'].forEach(field => {
            const element = card.getElementsByTagName(field)[0];
            simCard[field] = element?.textContent || '';
          });
          
          newSimCards.push(simCard as SimCard);
        }
      }

      setSimCards([...simCards, ...newSimCards]);
      toast.success(`${newSimCards.length} SIM Cards importados com sucesso!`);
      setIsUploadOpen(false);
      setFileContent('');
      
    } catch (error) {
      toast.error('Erro ao processar o arquivo. Verifique o formato.');
      console.error(error);
    }
  };

  const handleDeleteSimCard = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este SIM Card?')) {
      setSimCards(simCards.filter(card => card.id !== id));
      toast.success('SIM Card excluído com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({
      cliente: clientName || '',
      conta: '',
      plano: '',
      iccid: '',
      msisdn: '',
      imsi: '',
      imei: '',
      dtAtivacao: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de SIM Cards</h2>
        <div className="space-x-2">
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => setIsAddSimCardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo SIM Card
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de SIM Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {simCards.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>ICCID</TableHead>
                    <TableHead>MSISDN</TableHead>
                    <TableHead>IMSI</TableHead>
                    <TableHead>IMEI</TableHead>
                    <TableHead>Dt Ativ.</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simCards.map((simCard) => (
                    <TableRow key={simCard.id}>
                      <TableCell className="font-medium">{simCard.cliente}</TableCell>
                      <TableCell>{simCard.conta}</TableCell>
                      <TableCell>{simCard.plano}</TableCell>
                      <TableCell>{simCard.iccid}</TableCell>
                      <TableCell>{simCard.msisdn}</TableCell>
                      <TableCell>{simCard.imsi}</TableCell>
                      <TableCell>{simCard.imei}</TableCell>
                      <TableCell>{simCard.dtAtivacao}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleDeleteSimCard(simCard.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Nenhum SIM Card encontrado.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddSimCardOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar SIM Card
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add SIM Card Dialog */}
      <Dialog open={isAddSimCardOpen} onOpenChange={setIsAddSimCardOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo SIM Card</DialogTitle>
            <DialogDescription>
              Preencha as informações do SIM Card abaixo. Os campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  name="conta"
                  value={formData.conta}
                  onChange={handleFormChange}
                  placeholder="Conta do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plano">Plano</Label>
                <Input
                  id="plano"
                  name="plano"
                  value={formData.plano}
                  onChange={handleFormChange}
                  placeholder="Plano contratado"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iccid">ICCID *</Label>
                <Input
                  id="iccid"
                  name="iccid"
                  value={formData.iccid}
                  onChange={handleFormChange}
                  placeholder="ICCID do SIM Card"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msisdn">MSISDN *</Label>
                <Input
                  id="msisdn"
                  name="msisdn"
                  value={formData.msisdn}
                  onChange={handleFormChange}
                  placeholder="Número de telefone"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imsi">IMSI</Label>
                <Input
                  id="imsi"
                  name="imsi"
                  value={formData.imsi}
                  onChange={handleFormChange}
                  placeholder="IMSI do SIM Card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI</Label>
                <Input
                  id="imei"
                  name="imei"
                  value={formData.imei}
                  onChange={handleFormChange}
                  placeholder="IMEI do dispositivo"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dtAtivacao">Data de Ativação</Label>
              <Input
                id="dtAtivacao"
                name="dtAtivacao"
                value={formData.dtAtivacao}
                onChange={handleFormChange}
                placeholder="DD/MM/AAAA"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddSimCardOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddSimCard}>Salvar SIM Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar SIM Cards</DialogTitle>
            <DialogDescription>
              Importe SIM Cards através de um arquivo CSV ou XML.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="csv" onValueChange={(value) => setUploadType(value as 'csv' | 'xml')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv">Arquivo CSV</TabsTrigger>
                <TabsTrigger value="xml">Arquivo XML</TabsTrigger>
              </TabsList>
              <TabsContent value="csv" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">Selecione o arquivo CSV</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>O arquivo CSV deve conter as seguintes colunas:</p>
                  <p className="font-mono text-xs mt-1">cliente,conta,plano,iccid,msisdn,imsi,imei,dtAtivacao</p>
                </div>
              </TabsContent>
              <TabsContent value="xml" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="xmlFile">Selecione o arquivo XML</Label>
                  <Input
                    id="xmlFile"
                    type="file"
                    accept=".xml"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>O arquivo XML deve seguir a estrutura:</p>
                  <pre className="font-mono text-xs mt-1 bg-muted p-2 rounded-md">
{`<simcards>
  <simcard>
    <cliente>Nome</cliente>
    <conta>Conta</conta>
    <plano>Plano</plano>
    <iccid>ICCID</iccid>
    <msisdn>MSISDN</msisdn>
    <imsi>IMSI</imsi>
    <imei>IMEI</imei>
    <dtAtivacao>Data</dtAtivacao>
  </simcard>
</simcards>`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
            
            {fileContent && (
              <div className="space-y-2">
                <Label>Prévia do arquivo:</Label>
                <div className="bg-muted p-2 rounded-md max-h-40 overflow-auto">
                  <pre className="text-xs">{fileContent.substring(0, 500)}{fileContent.length > 500 ? '...' : ''}</pre>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsUploadOpen(false);
              setFileContent('');
            }}>
              Cancelar
            </Button>
            <Button onClick={processUpload} disabled={!fileContent}>
              <FileUp className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimCardManagement;
