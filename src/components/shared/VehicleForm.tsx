
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { VehicleInfo } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define the schema for the vehicle form
const vehicleFormSchema = z.object({
  model: z.string().min(3, 'Modelo deve ter pelo menos 3 caracteres'),
  plate: z.string().regex(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/, 'Placa inválida. Formato: ABC1234 ou ABC1D23'),
  trackerModel: z.string().min(2, 'Modelo do rastreador é obrigatório'),
  trackerImei: z.string().length(15, 'IMEI deve ter 15 dígitos numéricos').regex(/^\d+$/, 'IMEI deve conter apenas números'),
  installationLocation: z.string().optional(),
  chassis: z.string().min(17, 'Chassis deve ter 17 caracteres').optional(),
  color: z.string().optional(),
  year: z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos').optional(),
  installationDate: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  onSubmit: (data: VehicleFormValues) => void;
  initialData?: Partial<VehicleInfo & { chassis?: string, color?: string, year?: string, installationDate?: string }>;
  isEditing?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      model: initialData?.model || '',
      plate: initialData?.plate || '',
      trackerModel: initialData?.trackerModel || '',
      trackerImei: initialData?.trackerImei || '',
      installationLocation: initialData?.installationLocation || '',
      chassis: initialData?.chassis || '',
      color: initialData?.color || '',
      year: initialData?.year || '',
      installationDate: initialData?.installationDate || '',
    },
  });

  const handleSubmit = (values: VehicleFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo do Veículo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Honda Civic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa *</FormLabel>
                <FormControl>
                  <Input placeholder="ABC1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="chassis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Chassis</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 9BWHE21JX24060960" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Preto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2023" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="installationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Instalação</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <FormLabel>Modelo do Rastreador *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GT06">GT06</SelectItem>
                    <SelectItem value="TK103">TK103</SelectItem>
                    <SelectItem value="GPSTracker3">GPSTracker3</SelectItem>
                    <SelectItem value="GPSTracker5">GPSTracker5</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="trackerImei"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IMEI do Rastreador *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 123456789012345" {...field} />
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
                <Input placeholder="Ex: Sob o painel, próximo à caixa de fusíveis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">Cancelar</Button>
          <Button type="submit">{isEditing ? 'Atualizar Veículo' : 'Cadastrar Veículo'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default VehicleForm;
