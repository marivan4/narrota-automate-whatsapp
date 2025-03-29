
import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { asaasService } from "@/services/asaasService";

const asaasFormSchema = z.object({
  apiKey: z.string().min(10, {
    message: "O token de acesso deve ter pelo menos 10 caracteres.",
  }),
  environment: z.enum(["sandbox", "production"], {
    required_error: "Selecione o ambiente da API.",
  }),
  saveToLocalStorage: z.boolean().default(true),
});

type AsaasFormValues = z.infer<typeof asaasFormSchema>;

export function AsaasSettings() {
  const [isConfigured, setIsConfigured] = useState(false);

  // Inicializa o formulário com os dados salvos
  const form = useForm<AsaasFormValues>({
    resolver: zodResolver(asaasFormSchema),
    defaultValues: {
      apiKey: "",
      environment: "sandbox",
      saveToLocalStorage: true,
    },
  });

  // Carrega a configuração existente
  useEffect(() => {
    const config = asaasService.getConfig();
    if (config.apiKey) {
      form.setValue("apiKey", config.apiKey);
      form.setValue("environment", config.environment);
      setIsConfigured(true);
    }
  }, [form]);

  async function onSubmit(data: AsaasFormValues) {
    try {
      // Salva a configuração
      asaasService.setConfig(data.apiKey, data.environment);
      
      // Se não quiser salvar no localStorage, remove
      if (!data.saveToLocalStorage) {
        localStorage.removeItem('asaas_config');
      }
      
      // Verifica se a configuração é válida fazendo uma chamada simples
      await asaasService.callApi('/customers?limit=1');
      
      setIsConfigured(true);
      toast.success("Configuração da API Asaas salva com sucesso!");
    } catch (error) {
      console.error('Erro ao validar configuração Asaas:', error);
      toast.error("Erro ao configurar API Asaas. Verifique o token de acesso.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração da API Asaas</CardTitle>
        <CardDescription>
          Configure sua integração com a API Asaas para emissão de pagamentos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConfigured && (
          <Alert className="mb-6 border-green-500 text-green-500">
            <Check className="h-4 w-4" />
            <AlertTitle>Integração configurada</AlertTitle>
            <AlertDescription>
              Sua integração com a API Asaas está configurada e pronta para uso.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token de Acesso (API Key)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="$aact_YourAccessToken"
                      {...field}
                      type="password"
                    />
                  </FormControl>
                  <FormDescription>
                    Token de acesso fornecido pela Asaas em sua área de desenvolvedor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O ambiente Sandbox é recomendado para testes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saveToLocalStorage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Salvar configurações no navegador
                    </FormLabel>
                    <FormDescription>
                      As configurações ficarão salvas neste dispositivo.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <CardFooter className="flex justify-end pt-6 px-0">
              <Button type="submit">Salvar configuração</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
