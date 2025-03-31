
/**
 * Types for Asaas API entities and responses
 */

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  cpfCnpj: string;
  personType?: 'FISICA' | 'JURIDICA';
  city?: string;
  state?: string;
  country?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

export interface AsaasCustomersResponse {
  data: AsaasCustomer[];
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
}

export interface AsaasCreditCard {
  creditCardNumber?: string;
  creditCardBrand?: string;
  creditCardToken?: string | null;
}

export interface AsaasFineInterest {
  value: number;
}

export interface AsaasDiscount {
  value: number;
  dueDateLimitDays: number;
  type: string;
}

export interface AsaasRefund {
  dateCreated: string;
  status: string;
  value: number;
  description?: string | null;
  effectiveDate: string;
  transactionReceiptUrl?: string | null;
}

export interface AsaasPayment {
  id: string;
  status: string;
  dueDate: string;
  value: number;
  netValue?: number;
  description: string;
  billingType: string;
  bankSlipUrl?: string;
  invoiceUrl?: string;
  customer: string;
  externalReference?: string;
  dateCreated?: string;
  creditCard?: AsaasCreditCard;
  fine?: AsaasFineInterest;
  interest?: AsaasFineInterest;
  discount?: AsaasDiscount;
  clientPaymentDate?: string | null;
  paymentDate?: string | null;
  invoiceNumber?: string;
  deleted?: boolean;
  anticipated?: boolean;
  anticipable?: boolean;
  creditDate?: string;
  estimatedCreditDate?: string;
  transactionReceiptUrl?: string | null;
  nossoNumero?: string;
  originalValue?: number | null;
  interestValue?: number | null;
  originalDueDate?: string;
  paymentLink?: string | null;
  subscription?: string | null;
  installment?: string | null;
  refunds?: AsaasRefund[];
}

export interface AsaasPaymentsResponse {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: AsaasPayment[];
}

export interface AsaasPaymentResponse {
  id: string;
  status: string;
  dueDate: string;
  value: number;
  description: string;
  bankSlipUrl?: string;
  invoiceUrl?: string;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasIdentificationFieldResponse {
  identificationField: string;
}
