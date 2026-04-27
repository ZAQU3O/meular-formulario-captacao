const form = document.getElementById('captacaoForm');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const protocolValue = document.getElementById('protocolValue');
const timestampValue = document.getElementById('timestampValue');
const confirmModal = document.getElementById('confirmModal');
const fillTestDataButton = document.getElementById('fillTestData');
const sendWhatsAppButton = document.getElementById('sendWhatsApp');
const savePdfButton = document.getElementById('savePdf');

// Fechar modal — recarrega a página para limpar o formulário
document.getElementById('closeModal').addEventListener('click', () => {
  window.location.reload();
});

// ─── Configurações da empresa (editáveis pelo admin) ─────────────────────────
const CONFIG_DEFAULTS = {
  email:           'bartworld14@gmail.com',
  whatsapp:        '558994111573',
  webhook:         'https://script.google.com/macros/s/AKfycbyEyuUC3CuFYkUdU06ps1nAra_xaMqANDaH3XXcwDKbuLw0d_7cr-dMn7lrXHBmqE4hRQ/exec',
  nomeImobiliaria: 'Meular Imóveis',
  logoUrl:         '',
  formEyebrow:     'CAPTAÇÃO ONLINE',
  formTitulo:      'Ficha de Captação',
  formSubtitulo:   'Formulário profissional personalizado para a Meular Imóveis registrar proprietários, imóveis e condições comerciais.',
  formBrandNome:   'meular imóveis',
  formBrandDesc:   'Atendimento imobiliário com apresentação elegante e prática.',
  adminPassword:   'meular2026',
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
const EMAILJS_SERVICE_ID = 'service_klld4pl';
const EMAILJS_TEMPLATE_ID = 'template_qom9z9i';
const EMAILJS_PUBLIC_KEY = 'ZMn2Nlbz18A-cqelI';

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

const labelMap = {
  corretor: 'Nome do corretor',
  dataCaptacao: 'Data da captação',
  proprietario: 'Nome do proprietário',
  email: 'E-mail',
  cpf: 'CPF',
  celular: 'Celular',
  estadoCivil: 'Estado civil',
  exclusividade: 'Exclusividade',
  endereco: 'Endereço',
  condominio: 'Condomínio',
  unidade: 'Unidade',
  bairro: 'Bairro',
  cep: 'CEP',
  valor: 'Valor do imóvel',
  tipoImovel: 'Tipo do imóvel',
  descricaoImovel: 'Descrição do imóvel',
  observacoes: 'Observações',
  assinaturaProprietario: 'Nome da assinatura do proprietário',
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (source.clientX - rect.left) * scaleX,
      y: (source.clientY - rect.top) * scaleY,
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
  const excludedKeys = new Set(['assinaturaProprietarioImagem']);
  const data = {};

  Object.entries(rawData).forEach(([key, value]) => {
    if (!excludedKeys.has(key) && String(value).trim() !== '') {
      data[key] = value;
    }
  });

  data.assinaturaProprietarioCapturada = rawData.assinaturaProprietarioImagem ? 'Sim' : 'Não';

  return data;
}

function formatFormData(data) {
  return Object.entries(data)
    .map(([key, value]) => `${labelMap[key] || key}: ${value}`)
    .join('\n');
}

const assinaturaProprietario = setupSignaturePad('signaturePadProprietario', 'assinaturaProprietarioImagem');

document.querySelectorAll('.clear-signature').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    if (target === 'signaturePadProprietario') assinaturaProprietario.clear();
  });
});

fillTestDataButton.addEventListener('click', () => {
  const sampleData = {
    corretor: 'Corretor Teste',
    dataCaptacao: '2026-04-14',
    proprietario: 'João da Silva',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    celular: '(89) 99999-1111',
    estadoCivil: 'Casado(a)',
    exclusividade: 'Sim',
    endereco: 'Rua das Flores, 100',
    condominio: 'Residencial Jardim',
    unidade: '12B',
    bairro: 'Centro',
    cep: '64000-000',
    valor: '450000',
    tipoImovel: 'Casa',
    descricaoImovel: 'Imóvel com 3 quartos, suíte, garagem e área gourmet.',
    observacoes: 'Cliente disponível para visitas no período da tarde.',
    assinaturaProprietario: 'João da Silva',
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

  // 1. Enviar e-mail para a imobiliária via EmailJS
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

  // 1b. Enviar e-mail de confirmação ao proprietário (se informou e-mail)
  if (formData.email) {
    try {
      const nomeProprietario = formData.proprietario || 'Proprietário';
      const nomeImob = getConfig().nomeImobiliaria || CONFIG_DEFAULTS.nomeImobiliaria;
      const confirmacaoHtml = `
        <p>Olá, <strong>${nomeProprietario}</strong>!</p>
        <p>Sua ficha de captação foi recebida com sucesso pela <strong>${nomeImob}</strong>.</p>
        <p>Em breve entraremos em contato.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <p style="font-size:12px;color:#888;">Protocolo: <strong>${protocolo}</strong></p>
      `;
      await sendEmailJs({
        protocolo,
        proprietario: nomeProprietario,
        to_email: formData.email,
        conteudo: confirmacaoHtml,
      });
    } catch (err) {
      console.error('Erro e-mail proprietário:', err);
    }
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

// --- PDF estruturado com jsPDF ---
savePdfButton.addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const cfg = getConfig();
  const formData = collectFormData();
  const protocolo = protocolValue.textContent;
  const dataHora = timestampValue.textContent;

  // ─── Cores ────────────────────────────────────────────────────────────────
  const DARK   = [36, 27, 20];
  const GOLD   = [201, 163, 106];
  const GOLD2  = [180, 140, 80];
  const WHITE  = [255, 255, 255];
  const LIGHT  = [253, 250, 245];
  const GRAY   = [100, 100, 100];
  const LINE   = [226, 213, 195];

  const PW = 210; // largura A4
  const ML = 15;  // margem esquerda
  const MR = 15;  // margem direita
  const CW = PW - ML - MR; // largura útil

  // ─── Logo (base64) ────────────────────────────────────────────────────────
  async function loadLogo() {
    const src = cfg.logoUrl || 'assets/img/logo.png';
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve({ base64: c.toDataURL('image/png'), nw: img.naturalWidth, nh: img.naturalHeight });
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  const logoData = await loadLogo();

  // ─── CABEÇALHO ─────────────────────────────────────────────────────────────
  // Fundo escuro
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PW, 52, 'F');
  // Faixa dourada no topo
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, PW, 2, 'F');
  // Faixa dourada na base do cabeçalho
  doc.setFillColor(...GOLD);
  doc.rect(0, 52, PW, 1, 'F');

  // Logo centrada mantendo proporção
  if (logoData) {
    const maxH = 18, maxW = 70;
    let lh = maxH, lw = maxW;
    if (logoData.nw && logoData.nh) {
      const ratio = logoData.nw / logoData.nh;
      lh = maxH;
      lw = lh * ratio;
      if (lw > maxW) { lw = maxW; lh = lw / ratio; }
    }
    doc.addImage(logoData.base64, 'PNG', (PW - lw) / 2, (28 - lh) / 2, lw, lh);
  }

  // Nome da imobiliária
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text((cfg.formBrandNome || 'meular imóveis').toUpperCase(), PW / 2, 34, { align: 'center' });

  // Título do documento
  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.text(cfg.formTitulo || 'FICHA DE CAPTAÇÃO', PW / 2, 43, { align: 'center' });

  // ─── META INFO (protocolo + data) ─────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.rect(0, 53, PW, 14, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text('PROTOCOLO', ML, 60);
  doc.text('DATA / HORÁRIO', PW / 2 + 5, 60);

  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(protocolo, ML, 65);
  doc.text(dataHora, PW / 2 + 5, 65);

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(0, 67, PW, 67);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  let y = 72;

  function checkPage(needed = 10) {
    if (y + needed > 278) {
      doc.addPage();
      // mini cabeçalho na nova página
      doc.setFillColor(...DARK);
      doc.rect(0, 0, PW, 12, 'F');
      doc.setFillColor(...GOLD);
      doc.rect(0, 12, PW, 0.8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...GOLD);
      doc.setFont('helvetica', 'bold');
      doc.text(cfg.formTitulo || 'Ficha de Captação', PW / 2, 8, { align: 'center' });
      y = 20;
    }
  }

  function drawSectionHeader(titulo) {
    checkPage(14);
    doc.setFillColor(...DARK);
    doc.rect(ML, y, CW, 7, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(ML, y, 3, 7, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo.toUpperCase(), ML + 6, y + 4.8);
    y += 10;
  }

  function drawRow(label, value, shade) {
    const rowH = 6.5;
    const lines = doc.splitTextToSize(String(value), CW * 0.6);
    const h = Math.max(rowH, lines.length * 5);
    checkPage(h + 2);

    if (shade) {
      doc.setFillColor(248, 244, 238);
      doc.rect(ML, y - 4.5, CW, h, 'F');
    }

    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(label, ML + 2, y);

    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(lines, ML + CW * 0.38, y);

    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(ML, y + h - 4, ML + CW, y + h - 4);

    y += h;
  }

  function drawSection(titulo, campos) {
    const rows = campos.filter(k => formData[k]);
    if (!rows.length) return;
    drawSectionHeader(titulo);
    rows.forEach((key, i) => drawRow(labelMap[key] || key, formData[key], i % 2 === 0));
    y += 5;
  }

  // ─── DADOS DO CORRETOR ────────────────────────────────────────────────────
  drawSection('Dados do Corretor', ['corretor', 'dataCaptacao']);

  // ─── DADOS DO PROPRIETÁRIO ────────────────────────────────────────────────
  drawSection('Dados do Proprietário', [
    'proprietario','cpf','email','celular','estadoCivil'
  ]);

  // ─── DADOS DO IMÓVEL ──────────────────────────────────────────────────────
  drawSection('Dados do Imóvel', [
    'tipoImovel','endereco','bairro','cep','condominio','unidade',
    'valor','descricaoImovel','observacoes'
  ]);

  // ─── TERMO DE AUTORIZAÇÃO ─────────────────────────────────────────────────
  checkPage(30);
  drawSectionHeader('Termo de Autorização');
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  const termoTexto = `Autorizo ALTO PADRÃO inscrita sob o CRECI 0481 J, CNPJ n° 26.812.766/0001-64, estabelecida à Avenida Lindolfo Monteiro, 1210 — Fátima, Teresina/PI a efetuar a operação de venda de imóvel de propriedade, acima qualificado.`;
  const termoLines = doc.splitTextToSize(termoTexto, CW - 4);
  doc.text(termoLines, ML + 2, y);
  y += termoLines.length * 5 + 6;

  // ─── ASSINATURAS ──────────────────────────────────────────────────────────
  checkPage(50);
  drawSectionHeader('Assinaturas');

  const assinaturaProp = document.getElementById('assinaturaProprietarioImagem').value;
  if (formData.exclusividade) {
    drawRow('Exclusividade', formData.exclusividade, true);
    y += 3;
  }

  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  const condicoesTexto = 'Autorizo a Meular Imóveis a intermediar a venda do imóvel descrito neste formulário. Pela conclusão do negócio, fica estipulado honorários de 5% sobre o valor final da venda, válidos durante o prazo de captação acordado entre as partes.';
  const condicoesLines = doc.splitTextToSize(condicoesTexto, CW - 4);
  doc.text(condicoesLines, ML + 2, y);
  y += condicoesLines.length * 5 + 8;

  const boxW = CW;
  const boxH = 30;
  const xProp = ML;

  // Caixa de assinatura
  doc.setDrawColor(...LINE);
  doc.setFillColor(252, 249, 244);
  doc.setLineWidth(0.4);
  doc.rect(xProp, y, boxW, boxH, 'FD');

  // Faixa de título da caixa
  doc.setFillColor(...GOLD2);
  doc.rect(xProp, y, boxW, 5, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPRIETÁRIO', xProp + boxW / 2, y + 3.5, { align: 'center' });

  // Imagem da assinatura
  if (assinaturaProp) {
    doc.addImage(assinaturaProp, 'PNG', xProp + 4, y + 7, boxW - 8, 18);
  }

  // Nome abaixo da caixa
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  const nomeProp = formData['assinaturaProprietario'] || formData['proprietario'] || '';
  doc.text(nomeProp, xProp + boxW / 2, y + boxH + 5, { align: 'center' });

  y += boxH + 10;

  // ─── RODAPÉ ───────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...GOLD);
    doc.rect(0, 289, PW, 0.8, 'F');
    doc.setFillColor(...DARK);
    doc.rect(0, 289.8, PW, 8, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'normal');
    doc.text(cfg.formBrandNome || 'meular imóveis', ML, 294.5);
    doc.setTextColor(180, 170, 160);
    doc.text(`Página ${i} de ${totalPages}`, PW - MR, 294.5, { align: 'right' });
    doc.setTextColor(...GOLD);
    doc.text(cfg.formBrandDesc || '', PW / 2, 294.5, { align: 'center' });
  }

  doc.save(`ficha-captacao-${protocolo}.pdf`);
});