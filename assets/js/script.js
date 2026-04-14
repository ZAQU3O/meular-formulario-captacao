const form = document.getElementById('captacaoForm');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const protocolValue = document.getElementById('protocolValue');
const timestampValue = document.getElementById('timestampValue');
const fillTestDataButton = document.getElementById('fillTestData');
const sendWhatsAppButton = document.getElementById('sendWhatsApp');
const sendEmailButton = document.getElementById('sendEmail');
const savePdfButton = document.getElementById('savePdf');
const saveSheetsButton = document.getElementById('saveSheets');

const labelMap = {
  corretor: 'Nome do corretor',
  dataCaptacao: 'Data da captação',
  proprietario: 'Nome do proprietário',
  rg: 'RG',
  email: 'E-mail',
  cpf: 'CPF',
  celular: 'Celular',
  estadoCivil: 'Estado civil',
  conjuge: 'Nome do cônjuge',
  rgConjuge: 'RG do cônjuge',
  emailConjuge: 'E-mail do cônjuge',
  exclusividade: 'Exclusividade',
  endereco: 'Endereço',
  condominio: 'Condomínio',
  unidade: 'Unidade',
  bairro: 'Bairro',
  cep: 'CEP',
  matricula: 'Matrícula do imóvel',
  valor: 'Valor do imóvel',
  cpfImovel: 'CPF adicional',
  celularImovel: 'Celular adicional',
  tipoImovel: 'Tipo do imóvel',
  descricaoImovel: 'Descrição do imóvel',
  observacoes: 'Observações',
  assinaturaProprietario: 'Nome da assinatura do proprietário',
  assinaturaImobiliaria: 'Nome da assinatura da imobiliária',
};

function generateProtocol() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `MEU-${datePart}-${randomPart}`;
}

function updateProtocolInfo() {
  if (protocolValue.textContent === 'AGUARDANDO') {
    protocolValue.textContent = generateProtocol();
  }

  timestampValue.textContent = new Date().toLocaleString('pt-BR');
}

function showFeedback(message, isError = false) {
  successText.textContent = message;
  updateProtocolInfo();
  successMessage.classList.remove('hidden');
  successMessage.classList.toggle('error', isError);
  successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setupSignaturePad(canvasId, inputId) {
  const canvas = document.getElementById(canvasId);
  const hiddenInput = document.getElementById(inputId);
  const context = canvas.getContext('2d');
  let drawing = false;
  let hasSignature = false;

  context.lineWidth = 2;
  context.lineCap = 'round';
  context.strokeStyle = '#241b14';

  function getPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const source = event.touches ? event.touches[0] : event;
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    };
  }

  function startDrawing(event) {
    drawing = true;
    const pos = getPosition(event);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
    event.preventDefault();
  }

  function draw(event) {
    if (!drawing) return;
    const pos = getPosition(event);
    context.lineTo(pos.x, pos.y);
    context.stroke();
    hasSignature = true;
    hiddenInput.value = canvas.toDataURL('image/png');
    event.preventDefault();
  }

  function stopDrawing() {
    drawing = false;
    context.closePath();
    if (hasSignature) {
      hiddenInput.value = canvas.toDataURL('image/png');
    }
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);

  return {
    clear() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      hiddenInput.value = '';
      hasSignature = false;
    },
  };
}

function getDeliverySettings() {
  return {
    emailDestino: document.getElementById('emailDestino').value.trim(),
    whatsappDestino: document.getElementById('whatsappDestino').value.replaceAll(/\D/g, ''),
    webhookPlanilha: document.getElementById('webhookPlanilha').value.trim(),
  };
}

function collectFormData() {
  const rawData = Object.fromEntries(new FormData(form).entries());
  const excludedKeys = new Set([
    'assinaturaProprietarioImagem',
    'assinaturaImobiliariaImagem',
    'emailDestino',
    'whatsappDestino',
    'webhookPlanilha',
  ]);
  const data = {};

  Object.entries(rawData).forEach(([key, value]) => {
    if (!excludedKeys.has(key) && String(value).trim() !== '') {
      data[key] = value;
    }
  });

  data.assinaturaProprietarioCapturada = rawData.assinaturaProprietarioImagem ? 'Sim' : 'Não';
  data.assinaturaImobiliariaCapturada = rawData.assinaturaImobiliariaImagem ? 'Sim' : 'Não';

  return data;
}

function formatFormData(data) {
  return Object.entries(data)
    .map(([key, value]) => `${labelMap[key] || key}: ${value}`)
    .join('\n');
}

const assinaturaProprietario = setupSignaturePad('signaturePadProprietario', 'assinaturaProprietarioImagem');
const assinaturaImobiliaria = setupSignaturePad('signaturePadImobiliaria', 'assinaturaImobiliariaImagem');

document.querySelectorAll('.clear-signature').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    if (target === 'signaturePadProprietario') assinaturaProprietario.clear();
    if (target === 'signaturePadImobiliaria') assinaturaImobiliaria.clear();
  });
});

fillTestDataButton.addEventListener('click', () => {
  const sampleData = {
    corretor: 'Corretor Teste',
    dataCaptacao: '2026-04-14',
    proprietario: 'João da Silva',
    rg: '1234567',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    celular: '(89) 99999-1111',
    estadoCivil: 'Casado(a)',
    conjuge: 'Maria da Silva',
    rgConjuge: '7654321',
    emailConjuge: 'maria@email.com',
    exclusividade: 'Sim',
    endereco: 'Rua das Flores, 100',
    condominio: 'Residencial Jardim',
    unidade: '12B',
    bairro: 'Centro',
    cep: '64000-000',
    matricula: 'MAT123456',
    valor: '450000',
    cpfImovel: '123.456.789-00',
    celularImovel: '(89) 98888-2222',
    tipoImovel: 'Casa',
    descricaoImovel: 'Imóvel com 3 quartos, suíte, garagem e área gourmet.',
    observacoes: 'Cliente disponível para visitas no período da tarde.',
    assinaturaProprietario: 'João da Silva',
    assinaturaImobiliaria: 'Responsável Meular',
  };

  Object.entries(sampleData).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  });

  showFeedback('Dados de teste preenchidos. Agora você pode clicar em qualquer opção de envio.');
});

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const data = collectFormData();
  console.log('Dados do formulário:', data);
  showFeedback('Dados salvos no navegador. Agora você pode enviar por WhatsApp, e-mail, PDF ou Google Sheets.');
});

sendWhatsAppButton.addEventListener('click', () => {
  const { whatsappDestino } = getDeliverySettings();
  if (!whatsappDestino) {
    showFeedback('Informe o número de WhatsApp de destino no topo do formulário.', true);
    return;
  }

  const texto = encodeURIComponent(`Nova ficha de captação\n\n${formatFormData(collectFormData())}`);
  globalThis.open(`https://wa.me/${whatsappDestino}?text=${texto}`, '_blank');
  showFeedback('WhatsApp aberto com a mensagem preenchida.');
});

sendEmailButton.addEventListener('click', () => {
  const { emailDestino } = getDeliverySettings();
  if (!emailDestino) {
    showFeedback('Informe o e-mail de destino no topo do formulário.', true);
    return;
  }

  const subject = encodeURIComponent('Nova ficha de captação - Meular Imóveis');
  const body = encodeURIComponent(formatFormData(collectFormData()));
  globalThis.location.href = `mailto:${emailDestino}?subject=${subject}&body=${body}`;
  showFeedback('Cliente de e-mail aberto com os dados do formulário.');
});

savePdfButton.addEventListener('click', () => {
  globalThis.print();
  showFeedback('A janela de impressão foi aberta. Escolha Salvar como PDF.');
});

saveSheetsButton.addEventListener('click', async () => {
  const { webhookPlanilha } = getDeliverySettings();
  if (!webhookPlanilha) {
    showFeedback('Informe a URL do webhook do Google Sheets no topo do formulário.', true);
    return;
  }

  const payload = collectFormData();

  try {
    await fetch(webhookPlanilha, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    showFeedback('Dados enviados para o Google Sheets. Verifique a sua planilha.');
  } catch (error) {
    console.error(error);
    showFeedback('Não foi possível enviar para o Google Sheets. Confira a URL do webhook.', true);
  }
});