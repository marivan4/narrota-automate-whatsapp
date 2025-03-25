
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { FileText, Save, SendHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContractFormProps {
  onSubmit?: (data: { title: string; content: string; status: string; }) => void;
  onSendWhatsApp?: (phoneNumber: string) => void;
  initialData?: { title: string; content: string; status: string; };
  isEditing?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({
  onSubmit,
  onSendWhatsApp,
  initialData = { title: '', content: '', status: 'draft' },
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [status, setStatus] = useState<string>(initialData.status);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() === '') {
      toast.error("Por favor, informe um título para o contrato.");
      return;
    }
    
    if (content.trim() === '') {
      toast.error("Por favor, informe o conteúdo do contrato.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onSubmit) {
        onSubmit({
          title,
          content,
          status,
        });
      }
      
      toast.success(isEditing ? "Contrato atualizado com sucesso!" : "Contrato criado com sucesso!");
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o contrato. Por favor, tente novamente.");
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
        onSendWhatsApp(phoneNumber);
      }
      
      toast.success("Contrato enviado por WhatsApp com sucesso!");
      setShowWhatsAppForm(false);
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar o contrato. Por favor, tente novamente.");
    } finally {
      setIsSending(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título do contrato"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              placeholder="Conteúdo do contrato..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWhatsAppForm(!showWhatsAppForm)}
              disabled={isSubmitting || isSending || title.trim() === '' || content.trim() === ''}
            >
              <SendHorizontal className="h-4 w-4 mr-2" />
              Enviar por WhatsApp
            </Button>
            
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Salvar Contrato'}
            </Button>
          </div>
        </form>
        
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
          <span>Última modificação: {new Date().toLocaleDateString()}</span>
        )}
      </CardFooter>
    </Card>
  );
};

export default ContractForm;
