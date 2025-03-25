
import React, { useState } from 'react';
import { Client } from '@/types';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);

  // Function to handle client creation
  const handleCreateClient = (formData: {
    name: string;
    email?: string;
    phone?: string;
    document?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) => {
    // Ensure name is required and not optional
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    // Create new client following the Client interface structure
    const newClient: Client = {
      id: String(Date.now()),
      name: formData.name, // Name is now required
      email: formData.email || '',
      phone: formData.phone || '',
      document: formData.document,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      role: 'client',
      createdAt: new Date(),
      contracts: []
    };

    // Add new client to state
    setClients([...clients, newClient]);
    toast.success('Cliente criado com sucesso!');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Clientes</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Gerencie seus clientes e contratos</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Funcionalidade de gerenciamento de clientes em implementação.</p>
            {/* Client form and list will be implemented here */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
