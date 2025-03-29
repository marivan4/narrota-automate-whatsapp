
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { ClientFormValues } from '@/components/forms/ClientForm';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
  role: string;
}

export const contractFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  status: z.string(),
  // Cliente data
  clientId: z.string().optional(),
  clientName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  clientDocument: z.string().min(11, "CPF/CNPJ inválido"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().min(10, "Telefone inválido"),
  // Address
  clientAddress: z.string().min(5, "Endereço inválido"),
  clientNumber: z.string(),
  clientNeighborhood: z.string(),
  clientCity: z.string(),
  clientState: z.string(),
  clientZipCode: z.string(),
  // Vehicle data
  vehicleModel: z.string(),
  vehiclePlate: z.string(),
  trackerModel: z.string(),
  trackerIMEI: z.string(),
  // Additional info
  installationLocation: z.string(),
  // Service data
  serviceMonthlyAmount: z.string(),
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;

export interface ContractFormProps {
  onSubmit?: (data: ContractFormValues) => void;
  onSendWhatsApp?: (phoneNumber: string, contractData: ContractFormValues) => void;
  initialData?: Partial<ContractFormValues>;
  isEditing?: boolean;
}

export interface ContractFormSectionProps {
  form: UseFormReturn<ContractFormValues>;
  showVariablesPopover?: boolean;
  setShowVariablesPopover?: (value: boolean) => void;
  handleInsertVariable?: (variable: string) => void;
  handleCaptureTextareaCursor?: (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export interface ContractFormClientProps extends ContractFormSectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredClients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  showNewClientForm: boolean;
  setShowNewClientForm: (value: boolean) => void;
  handleSelectClient: (client: Client) => void;
  handleAddNewClient: (clientData: ClientFormValues) => void;
}
