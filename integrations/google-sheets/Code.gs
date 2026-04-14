function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Webhook ativo' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Captacoes');

    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Captacoes');
    }

    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    var headers = [
      'Data de registro',
      'Nome do corretor',
      'Data da captação',
      'Nome do proprietário',
      'RG',
      'E-mail',
      'CPF',
      'Celular',
      'Estado civil',
      'Nome do cônjuge',
      'RG do cônjuge',
      'E-mail do cônjuge',
      'Exclusividade',
      'Endereço',
      'Condomínio',
      'Unidade',
      'Bairro',
      'CEP',
      'Matrícula do imóvel',
      'Valor do imóvel',
      'CPF adicional',
      'Celular adicional',
      'Tipo do imóvel',
      'Descrição do imóvel',
      'Observações',
      'Nome da assinatura do proprietário',
      'Assinatura do proprietário capturada',
      'Nome da assinatura da imobiliária',
      'Assinatura da imobiliária capturada'
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    var row = [
      new Date(),
      data.corretor || '',
      data.dataCaptacao || '',
      data.proprietario || '',
      data.rg || '',
      data.email || '',
      data.cpf || '',
      data.celular || '',
      data.estadoCivil || '',
      data.conjuge || '',
      data.rgConjuge || '',
      data.emailConjuge || '',
      data.exclusividade || '',
      data.endereco || '',
      data.condominio || '',
      data.unidade || '',
      data.bairro || '',
      data.cep || '',
      data.matricula || '',
      data.valor || '',
      data.cpfImovel || '',
      data.celularImovel || '',
      data.tipoImovel || '',
      data.descricaoImovel || '',
      data.observacoes || '',
      data.assinaturaProprietario || '',
      data.assinaturaProprietarioCapturada || '',
      data.assinaturaImobiliaria || '',
      data.assinaturaImobiliariaCapturada || ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}