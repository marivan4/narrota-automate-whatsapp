
export const contractVariables = [
  { key: '{cliente_nome}', description: 'Nome completo do cliente' },
  { key: '{cliente_documento}', description: 'CPF/CNPJ do cliente' },
  { key: '{cliente_email}', description: 'Email do cliente' },
  { key: '{cliente_telefone}', description: 'Telefone do cliente' },
  { key: '{cliente_endereco}', description: 'Endereço do cliente' },
  { key: '{cliente_numero}', description: 'Número do endereço' },
  { key: '{cliente_bairro}', description: 'Bairro do cliente' },
  { key: '{cliente_cidade}', description: 'Cidade do cliente' },
  { key: '{cliente_estado}', description: 'Estado do cliente' },
  { key: '{cliente_cep}', description: 'CEP do cliente' },
  { key: '{veiculo_modelo}', description: 'Modelo do veículo' },
  { key: '{veiculo_placa}', description: 'Placa do veículo' },
  { key: '{rastreador_modelo}', description: 'Modelo do rastreador' },
  { key: '{rastreador_imei}', description: 'IMEI do rastreador' },
  { key: '{instalacao_local}', description: 'Local de instalação' },
  { key: '{servico_valor_mensal}', description: 'Valor mensal do serviço' },
  { key: '{data_atual}', description: 'Data atual' },
];

export const getDefaultContractContent = () => {
  return `CONTRATO DE COMODATO DE EQUIPAMENTO, MONITORAMENTO DE VEÍCULO, SISTEMA DE AUTO-GESTÃO E OUTRAS AVENÇAS

Por este Instrumento particular, de um lado NARROTA GPSTRACKER SERVIÇOS DE MONITORAMENTO, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 52.273.723/0001-68, com sede (matriz) à Rua: dr urbano figueira 125,Bairro Ns da Guia, cidade Tremembé, São Paulo CEP:12125-030, aqui denominado "CONTRATADA" e de outro lado {cliente_nome}, na cidade de {cliente_cidade}, estado de {cliente_estado}, Rua:{cliente_endereco}, cep: {cliente_cep}, inscrita no CPF/CNPJ sob o n° {cliente_documento}, neste ato representado na forma como representante legal, doravante referida simplesmente como {cliente_nome}, aqui denominado devidamente qualificado no Pedido de Adesão Comodato de Rastreamento NARROTA GPSTRACKER, parte integrante deste Contrato, têm entre si justo e acertado o presente INSTRUMENTO PARTICULAR DE CONTRATO DE COMODATO, PRESTAÇÃO DE SERVIÇOS E OUTRAS AVENÇAS que se regerá pela cláusulas e condições descritas, conforme segue:

1 DO OBJETO DO CONTRATO

1.1 A "CONTRATADA" cede em comodato ao CONTRATANTE o Equipamento descrito no Pedido de Compra ou Comodato parte integrante deste instrumento, bem como a Prestação de Serviços de rastreamento por parte da "CONTRATADA", possibilitando, localização, rastreamento ou a localização por aproximação setorial do veículo do CONTRATANTE, por GSM/GPRS (General Packet Radio Serviço) da sua Central 24 (vinte e quatro) horas, de acordo com a opção feita pelo cliente.
`;
};
