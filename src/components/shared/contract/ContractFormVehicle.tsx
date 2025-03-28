
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ContractFormSectionProps } from './types';

const ContractFormVehicle: React.FC<ContractFormSectionProps> = ({ form }) => {
  return (
    <div className="space-y-6">
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
              <Textarea placeholder="Detalhes sobre o local de instalação" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContractFormVehicle;
