
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContractWhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isSending: boolean;
  handleSendWhatsApp: (e: React.FormEvent) => void;
}

const ContractWhatsAppDialog: React.FC<ContractWhatsAppDialogProps> = ({
  open,
  onOpenChange,
  phoneNumber,
  setPhoneNumber,
  isSending,
  handleSendWhatsApp
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Contrato por WhatsApp</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSendWhatsApp} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="phoneNumber">Número do WhatsApp</Label>
            <Input 
              id="phoneNumber" 
              placeholder="(00) 00000-0000" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Informe o número com DDD, sem o +55.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSending || !phoneNumber}
            >
              {isSending ? 'Enviando...' : 'Enviar Contrato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractWhatsAppDialog;
