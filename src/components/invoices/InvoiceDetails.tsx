import React, { useState, useEffect } from 'react';
import { Invoice } from '@/models/invoice';
import { formatDateDisplay } from '@/utils/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea"

interface InvoiceDetailsProps {
  invoice: Invoice;
  onUpdate?: (id: string, data: Partial<Invoice>) => Promise<void>;
  onClose: () => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice, onUpdate, onClose }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: invoice.invoice_number,
    contract_id: invoice.contract_id,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    amount: invoice.amount,
    tax_amount: invoice.tax_amount,
    status: invoice.status,
    payment_date: invoice.payment_date,
    payment_method: invoice.payment_method,
    notes: invoice.notes,
  });

  useEffect(() => {
    setFormData({
      invoice_number: invoice.invoice_number,
      contract_id: invoice.contract_id,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      amount: invoice.amount,
      tax_amount: invoice.tax_amount,
      status: invoice.status,
      payment_date: invoice.payment_date,
      payment_method: invoice.payment_method,
      notes: invoice.notes,
    });
  }, [invoice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prevData => ({
        ...prevData,
        [name]: date,
      }));
    }
  };

  // Corrigir a manipulação de data
  const formatISODate = (date: string | Date | undefined): string => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toISOString().split('T')[0];
    } catch (e) {
      console.error("Invalid date:", date);
      return '';
    }
  };

  // Atualizar o envio de formulário para usar a função de formatação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onUpdate) {
      const updatedData = {
        ...formData,
        issue_date: formatISODate(formData.issue_date),
        due_date: formatISODate(formData.due_date),
      };
      
      await onUpdate(invoice.id, updatedData);
    }
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Ver Detalhes</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Fatura</DialogTitle>
          <DialogDescription>
            Visualize e edite os detalhes da fatura.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Número da Fatura</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                value={formData.invoice_number || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_id">ID do Contrato</Label>
              <Input
                id="contract_id"
                name="contract_id"
                value={formData.contract_id || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Emissão</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formData.issue_date && "text-muted-foreground"
                    )}
                  >
                    {formData.issue_date ? (
                      format(new Date(formData.issue_date), "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={formData.issue_date ? new Date(formData.issue_date) : undefined}
                    onSelect={(date) => handleDateChange('issue_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    {formData.due_date ? (
                      format(new Date(formData.due_date), "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={(date) => handleDateChange('due_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={String(formData.amount || '')}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_amount">Impostos</Label>
              <Input
                id="tax_amount"
                name="tax_amount"
                type="number"
                value={String(formData.tax_amount || '')}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={invoice.status}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Pagamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formData.payment_date && "text-muted-foreground"
                    )}
                  >
                    {formData.payment_date ? (
                      format(new Date(formData.payment_date), "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={formData.payment_date ? new Date(formData.payment_date) : undefined}
                    onSelect={(date) => handleDateChange('payment_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pagamento</Label>
            <Input
              id="payment_method"
              name="payment_method"
              value={formData.payment_method || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
            />
          </div>

          <Button type="submit">Salvar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetails;
