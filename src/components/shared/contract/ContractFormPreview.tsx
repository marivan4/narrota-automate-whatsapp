
import React from 'react';
import { ContractFormSectionProps } from './types';

const ContractFormPreview: React.FC<ContractFormSectionProps> = ({ form }) => {
  const generateContractPreview = () => {
    const values = form.getValues();
    
    // Process variable replacements
    let processedContent = values.content;
    
    // Format the current date in Brazilian format
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Replace variables with actual values
    processedContent = processedContent
      .replace(/{cliente_nome}/g, values.clientName)
      .replace(/{cliente_documento}/g, values.clientDocument)
      .replace(/{cliente_email}/g, values.clientEmail)
      .replace(/{cliente_telefone}/g, values.clientPhone)
      .replace(/{cliente_endereco}/g, values.clientAddress)
      .replace(/{cliente_numero}/g, values.clientNumber)
      .replace(/{cliente_bairro}/g, values.clientNeighborhood)
      .replace(/{cliente_cidade}/g, values.clientCity)
      .replace(/{cliente_estado}/g, values.clientState)
      .replace(/{cliente_cep}/g, values.clientZipCode)
      .replace(/{veiculo_modelo}/g, values.vehicleModel)
      .replace(/{veiculo_placa}/g, values.vehiclePlate)
      .replace(/{rastreador_modelo}/g, values.trackerModel)
      .replace(/{rastreador_imei}/g, values.trackerIMEI)
      .replace(/{instalacao_local}/g, values.installationLocation)
      .replace(/{servico_valor_mensal}/g, values.serviceMonthlyAmount)
      .replace(/{data_atual}/g, currentDate)
      // For backward compatibility
      .replace(/{cliente_firstname}/g, values.clientName.split(' ')[0] || '')
      .replace(/{cliente_lastname}/g, values.clientName.split(' ').slice(1).join(' ') || '')
      .replace(/{cliente_name}/g, values.clientName)
      .replace(/{cliente_address1}/g, `${values.clientAddress}, ${values.clientNumber}`)
      .replace(/{cliente_customfields1}/g, values.clientDocument)
      .replace(/{cliente_city}/g, values.clientCity)
      .replace(/{cliente_state}/g, values.clientState)
      .replace(/{cliente_postcode}/g, values.clientZipCode)
      .replace(/{servico_recurringamount}/g, values.serviceMonthlyAmount)
      .replace(/{servico_regdate}/g, currentDate);
  
    return (
      <div className="p-4 bg-white border rounded-md max-h-[400px] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-4">{values.title}</h2>
        <div className="whitespace-pre-line text-gray-800">{processedContent}</div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Assinatura do Cliente:</p>
              <div className="h-10 w-48 border-b border-dashed mt-6"></div>
              <p>{values.clientName}</p>
              <p>CPF/CNPJ: {values.clientDocument}</p>
            </div>
            
            <div>
              <p className="font-semibold">Assinatura da Empresa:</p>
              <div className="h-10 w-48 border-b border-dashed mt-6"></div>
              <p>Sistema de Rastreamento Veicular</p>
              <p>CNPJ: 00.000.000/0001-00</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-secondary/30 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium mb-2">Pré-visualização do Contrato</h3>
        <p className="text-sm text-muted-foreground">Esta é uma prévia de como o contrato ficará com os dados preenchidos</p>
      </div>
      
      {generateContractPreview()}
    </div>
  );
};

export default ContractFormPreview;
