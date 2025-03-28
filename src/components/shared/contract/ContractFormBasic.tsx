
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Variable } from 'lucide-react';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { contractVariables } from '../contracts/contractVariables';
import { ContractFormSectionProps } from './types';

const ContractFormBasic: React.FC<ContractFormSectionProps> = ({ 
  form, 
  showVariablesPopover, 
  setShowVariablesPopover, 
  handleInsertVariable, 
  handleCaptureTextareaCursor 
}) => {
  return (
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
