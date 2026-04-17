const form = document.getElementById('captacaoForm');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const protocolValue = document.getElementById('protocolValue');
const timestampValue = document.getElementById('timestampValue');
const confirmModal = document.getElementById('confirmModal');
const fillTestDataButton = document.getElementById('fillTestData');
const sendWhatsAppButton = document.getElementById('sendWhatsApp');
const savePdfButton = document.getElementById('savePdf');

// Fechar modal
document.getElementById('closeModal').addEventListener('click', () => {
  confirmModal.classList.add('hidden');
});

// ─── Configurações da empresa (editáveis pelo admin) ─────────────────────────
const CONFIG_DEFAULTS = {
  email: 'bartworld14@gmail.com',
  whatsapp: '558994111573',
  webhook: 'https://script.google.com/macros/s/AKfycbyEyuUC3CuFYkUdU06ps1nAra_xaMqANDaH3XXcwDKbuLw0d_7cr-dMn7lrXHBmqE4hRQ/exec',
};

function getConfig() {
  try {
    return Object.assign({}, CONFIG_DEFAULTS, JSON.parse(localStorage.getItem('meularConfig') || '{}'));
  } catch {
    return CONFIG_DEFAULTS;
  }
}

const EMAIL_DESTINO    = () => getConfig().email;
const WEBHOOK_PLANILHA = () => getConfig().webhook;
const WHATSAPP_DESTINO = () => getConfig().whatsapp;

// ─── EmailJS config ───────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_935b0pu';
const EMAILJS_TEMPLATE_ID = 'template_74ix2rt';
const EMAILJS_PUBLIC_KEY = 'Tp3KkqmXfULnu2dl2';

function buildEmailJsTable(data) {
  // Gera tabela HTML para o campo {{conteudo}}
  let html = '<table class="data-table" style="border-collapse:collapse;width:100%;font-size:14px;">';
  Object.entries(data).forEach(([key, value]) => {
    if (labelMap[key] && String(value).trim() !== '') {
      html += `<tr><td class="label" style="padding:8px 8px 4px 0;font-weight:700;color:#241b14;width:40%;border-bottom:1px solid #eee;">${labelMap[key]}</td><td class="value" style="padding:8px 0 4px 0;color:#444;border-bottom:1px solid #eee;">${value}</td></tr>`;
    }
  });
  html += '</table>';
  return html;
}

function sendEmailJs(payload) {
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload, EMAILJS_PUBLIC_KEY);
}
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

function collectFormData() {
  const rawData = Object.fromEntries(new FormData(form).entries());
  const excludedKeys = new Set([
    'assinaturaProprietarioImagem',
    'assinaturaImobiliariaImagem',
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

// ─── Submit principal: envia e-mail + Google Sheets automaticamente ──────────
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  const formData = collectFormData();
  const protocolo = protocolValue.textContent === 'AGUARDANDO' ? generateProtocol() : protocolValue.textContent;
  updateProtocolInfo();

  let emailOk = false;
  let sheetsOk = false;

  // 1. Enviar e-mail via EmailJS
  try {
    const payload = {
      ...formData,
      protocolo,
      to_email: EMAIL_DESTINO(),
      conteudo: buildEmailJsTable(formData),
    };
    await sendEmailJs(payload);
    emailOk = true;
  } catch (err) {
    console.error('Erro EmailJS:', err);
  }

  // 2. Enviar para Google Sheets
  try {
    await fetch(WEBHOOK_PLANILHA(), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...formData, protocolo }),
    });
    sheetsOk = true;
  } catch (err) {
    console.error('Erro Sheets:', err);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Enviar Ficha';

  if (emailOk || sheetsOk) {
    // Abre modal de confirmação
    updateProtocolInfo();
    confirmModal.classList.remove('hidden');
  }

  if (!emailOk && !sheetsOk) {
    showFeedback('Falha ao enviar. Verifique sua conexão e tente novamente.', true);
  } else if (!emailOk) {
    showFeedback('Planilha atualizada, mas houve falha no envio do e-mail.', true);
  } else if (!sheetsOk) {
    showFeedback('E-mail enviado, mas houve falha ao registrar na planilha.', true);
  }
});

// ─── Botões opcionais ─────────────────────────────────────────────────────────
sendWhatsAppButton.addEventListener('click', () => {
  const texto = encodeURIComponent(`Nova ficha de captação\n\n${formatFormData(collectFormData())}`);
  globalThis.open(`https://wa.me/${WHATSAPP_DESTINO()}?text=${texto}`, '_blank');
  showFeedback('WhatsApp aberto com a mensagem preenchida.');
});

savePdfButton.addEventListener('click', () => {
  globalThis.print();
  showFeedback('A janela de impressão foi aberta. Escolha Salvar como PDF.');
});