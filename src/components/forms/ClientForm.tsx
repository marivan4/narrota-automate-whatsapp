
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { asaasService } from "@/services/asaas";
import { Client } from "@/models/client";

const clientSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" }),
  document: z.string().min(11, { message: "CPF/CNPJ inválido" }),
  address: z.string().min(5, { message: "Endereço deve ter pelo menos 5 caracteres" }),
  city: z.string().min(2, { message: "Cidade deve ter pelo menos 2 caracteres" }),
  state: z.string().min(2, { message: "Estado deve ter pelo menos 2 caracteres" }),
  zipCode: z.string().min(8, { message: "CEP deve ter pelo menos 8 dígitos" }),
  role: z.enum(["admin", "client", "viewer"], { 
    required_error: "Selecione um tipo de usuário" 
  }),
  syncWithAsaas: z.boolean().default(false)
});

export type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => void;
  initialData?: ClientFormValues;
  isLoading?: boolean;
  isEditing?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading = false,
  isEditing = false
}) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      role: "client",
      syncWithAsaas: false
    },
  });

  const handleSubmit = async (data: ClientFormValues) => {
    try {
      // Se a sincronização com Asaas estiver habilitada
      if (data.syncWithAsaas) {
        if (!asaasService.isConfigured()) {
          toast.error("API Asaas não configurada. Configure o token de acesso nas configurações.");
          return;
        }

        // Verifica se o cliente já existe no Asaas
        const existingCustomer = await asaasService.findCustomerByCpfCnpj(data.document);
        
        if (existingCustomer) {
          toast.info(`Cliente já cadastrado no Asaas: ${existingCustomer.name}`);
        } else {
          toast.loading("Sincronizando cliente com Asaas...", { id: "sync-asaas" });
          // Convertendo para o tipo correto de Cliente
          const clientData: Client = {
            id: "temp-id",
            name: data.name,
            email: data.email,
            phone: data.phone,
            document: data.document,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            role: data.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          await asaasService.createCustomer(clientData);
          toast.success("Cliente sincronizado com Asaas com sucesso!", { id: "sync-asaas" });
        }
      }

      // Chama o callback de submit passado como prop
      onSubmit(data);
    } catch (error) {
      console.error("Erro ao sincronizar cliente com Asaas:", error);
      toast.error("Erro ao sincronizar cliente com Asaas");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
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
          
          <FormField
            control={form.control}
            name="document"
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
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="Estado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="zipCode"
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
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Usuário</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Define os privilégios do usuário no sistema.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {asaasService.isConfigured() && (
            <FormField
              control={form.control}
              name="syncWithAsaas"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Sincronizar com Asaas</FormLabel>
                    <FormDescription>
                      Cadastrar cliente automaticamente no Asaas
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : isEditing ? "Atualizar Cliente" : "Cadastrar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
