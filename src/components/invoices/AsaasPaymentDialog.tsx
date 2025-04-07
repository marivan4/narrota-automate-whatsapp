import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface AsaasPaymentDialogProps {
  invoiceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AsaasPaymentDialog: React.FC<AsaasPaymentDialogProps> = ({ invoiceId, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<any>(null);
  let errorMessage = '';

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulação de sucesso
      setSuccess(true);
    } catch (err: any) {
      setError(err);

      // Corrigir o verificador de instância
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message as string;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja confirmar o pagamento da fatura #{invoiceId} via Asaas?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody loading={loading} success={success} error={errorMessage} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={handleConfirmPayment}>
            {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface AlertDialogBodyProps {
  loading: boolean;
  success: boolean;
  error: string;
}

const AlertDialogBody: React.FC<AlertDialogBodyProps> = ({ loading, success, error }) => {
  if (loading) {
    return <AlertDialogDescription>Processando pagamento...</AlertDialogDescription>;
  }

  if (success) {
    return <AlertDialogDescription>Pagamento confirmado com sucesso!</AlertDialogDescription>;
  }

  if (error) {
    return <AlertDialogDescription>Erro ao confirmar pagamento: {error}</AlertDialogDescription>;
  }

  return null;
};

export default AsaasPaymentDialog;
