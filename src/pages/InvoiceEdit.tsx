import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { InvoiceForm, InvoiceFormValues, InvoiceFormSubmitValues } from '@/components/invoices/InvoiceForm';
import { InvoiceDetails } from '@/components/invoices/InvoiceDetails';
import { invoiceService } from '@/services/invoiceService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const InvoiceEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Determine if this is a new invoice
  const isNew = !id || id === 'new';

  // Fetch invoice data if not new
  const {
    data: invoice,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getInvoice(id!),
    enabled: !isNew && !!id,
  });

  // Mock contracts data (would be from a real API in production)
  const contracts = [
    { id: 'CONT-001', client_name: 'João Silva' },
    { id: 'CONT-002', client_name: 'Maria Oliveira' },
    { id: 'CONT-003', client_name: 'Carlos Santos' },
    { id: 'CONT-004', client_name: 'Ana Pereira' },
    { id: 'CONT-005', client_name: 'Pedro Almeida' },
  ];

  // Create invoice mutation
  const createMutation = useMutation({
    mutationFn: (data: InvoiceFormSubmitValues) => {
      // Convert from form values to API data format
      const invoiceData = {
        invoice_number: data.invoice_number,
        contract_id: data.contract_id,
        issue_date: data.issue_date,
        due_date: data.due_date,
        amount: data.amount, // Now a number after zod transform
        tax_amount: data.tax_amount, // Now a number after zod transform
        status: data.status,
        payment_method: data.payment_method,
        notes: data.notes,
      };
      return invoiceService.createInvoice(invoiceData);
    },
    onSuccess: () => {
      toast.success('Fatura criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
    onError: (error) => {
      console.error('Erro ao criar fatura:', error);
      toast.error('Erro ao criar fatura. Verifique os dados e tente novamente.');
    }
  });

  // Update invoice mutation
  const updateMutation = useMutation({
    mutationFn: (data: InvoiceFormSubmitValues) => {
      // Convert from form values to API data format
      const invoiceData = {
        invoice_number: data.invoice_number,
        contract_id: data.contract_id,
        issue_date: data.issue_date,
        due_date: data.due_date,
        amount: data.amount, // Now a number after zod transform
        tax_amount: data.tax_amount, // Now a number after zod transform
        status: data.status,
        payment_method: data.payment_method,
        notes: data.notes,
      };
      return invoiceService.updateInvoice(id!, invoiceData);
    }, 
    onSuccess: () => {
      toast.success('Fatura atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar fatura:', error);
      toast.error('Erro ao atualizar fatura. Verifique os dados e tente novamente.');
    }
  });

  // Delete invoice mutation
  const deleteMutation = useMutation({
    mutationFn: () => invoiceService.deleteInvoice(id!),
    onSuccess: () => {
      toast.success('Fatura excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
    onError: (error) => {
      console.error('Erro ao excluir fatura:', error);
      toast.error('Erro ao excluir fatura');
    }
  });

  // Handle form submission
  const handleSubmit = (data: InvoiceFormSubmitValues) => {
    console.log('Form data submitted:', data);
    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  // Handle delete
  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Permissions check
  if (!authState.isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (!isAuthorized([UserRole.ADMIN, UserRole.MANAGER])) {
    navigate('/dashboard');
    return null;
  }

  // Loading state
  if (!isNew && isLoading) {
    return (
      <DashboardLayout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (!isNew && isError) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Erro ao Carregar Fatura</h1>
            <Button onClick={() => navigate('/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {error instanceof Error ? error.message : 'Fatura não encontrada'}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {isNew ? 'Nova Fatura' : `Fatura ${invoice?.invoice_number}`}
          </h1>
          <Button onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {isNew ? (
          <InvoiceForm 
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            contracts={contracts}
          />
        ) : (
          <>
            <InvoiceDetails
              invoice={invoice!}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
              whatsappConfig={{
                instance: 'default',
                apiKey: 'client-specific-key',
                isConnected: true
              }}
            />

            <Sheet open={isEditing} onOpenChange={setIsEditing}>
              <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Editar Fatura</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <InvoiceForm
                    defaultValues={{
                      invoice_number: invoice?.invoice_number,
                      contract_id: invoice?.contract_id,
                      issue_date: invoice?.issue_date ? new Date(invoice.issue_date) : new Date(),
                      due_date: invoice?.due_date ? new Date(invoice.due_date) : new Date(),
                      amount: invoice?.amount?.toString() || '',
                      tax_amount: invoice?.tax_amount?.toString() || '',
                      payment_method: invoice?.payment_method,
                      status: invoice?.status,
                      notes: invoice?.notes,
                    }}
                    onSubmit={handleSubmit}
                    isSubmitting={updateMutation.isPending}
                    contracts={contracts}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InvoiceEdit;
