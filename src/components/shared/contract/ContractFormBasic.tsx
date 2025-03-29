
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileText, Upload, Variable } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { contractVariables } from '../contracts/contractVariables';
import { ContractFormSectionProps } from './types';
import { toast } from "sonner";

const ContractFormBasic: React.FC<ContractFormSectionProps> = ({ 
  form, 
  showVariablesPopover, 
  setShowVariablesPopover, 
  handleInsertVariable, 
  handleCaptureTextareaCursor 
}) => {
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Verificar se é um PDF
    if (file.type !== 'application/pdf') {
      setPdfError('O arquivo deve estar no formato PDF.');
      return;
    }
    
    // Limpar erros anteriores
    setPdfError(null);
    setPdfUploading(true);
    
    try {
      // Aqui você pode implementar a lógica para extrair o texto do PDF
      // Por enquanto, simulamos um processo de extração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulamos o recebimento do texto extraído
      const extractedText = "CONTRATO DE SERVIÇO EXTRAÍDO\n\nContrato entre {cliente_nome}, portador do CPF {cliente_documento}, residente em {cliente_endereco}, {cliente_numero}, {cliente_cidade}/{cliente_estado}, e nossa empresa para instalação de rastreador no veículo {veiculo_modelo}, placa {veiculo_placa}.\n\nModelo do rastreador: {rastreador_modelo}\nIMEI: {rastreador_imei}\nValor mensal: R$ {servico_valor_mensal}\n\nData: {data_atual}";
      
      // Atualizamos o título e conteúdo no formulário
      form.setValue('title', file.name.replace('.pdf', ''), { shouldDirty: true });
      form.setValue('content', extractedText, { shouldDirty: true });
      
      toast.success("PDF importado com sucesso!");
    } catch (error) {
      setPdfError('Erro ao processar o PDF. Tente novamente.');
      console.error('PDF processing error:', error);
    } finally {
      setPdfUploading(false);
      
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Importar contrato de PDF</h3>
          <div className="flex items-center">
            <Input 
              type="file" 
              accept=".pdf" 
              id="pdfUpload" 
              onChange={handleFileChange} 
              className="hidden"
            />
            <label htmlFor="pdfUpload">
              <Button type="button" variant="outline" size="sm" disabled={pdfUploading} asChild>
                <div className="cursor-pointer">
                  {pdfUploading ? (
                    <>Processando...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Carregar PDF
                    </>
                  )}
                </div>
              </Button>
            </label>
          </div>
        </div>
        
        {pdfError && (
          <Alert variant="destructive">
            <FileText className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{pdfError}</AlertDescription>
          </Alert>
        )}
      </div>
      
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
                      onClick={() => handleInsertVariable && handleInsertVariable(variable.key)}
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
  );
};

export default ContractFormBasic;
