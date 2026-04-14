const nodemailer = require('nodemailer');

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
  assinaturaProprietarioCapturada: 'Assinatura do proprietário capturada',
  assinaturaImobiliariaCapturada: 'Assinatura da imobiliária capturada'
};

function normalizePayload(body) {
  if (!body) return {};

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

function buildPlainText(payload) {
  return Object.entries(payload)
    .filter(([key, value]) => key !== 'emailDestino' && String(value ?? '').trim() !== '')
    .map(([key, value]) => `${labelMap[key] || key}: ${value}`)
    .join('\n');
}

function buildHtml(payload) {
  const rows = Object.entries(payload)
    .filter(([key, value]) => key !== 'emailDestino' && String(value ?? '').trim() !== '')
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;">${labelMap[key] || key}</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;">${String(value)}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#241b14;">
      <h2>Nova ficha de captação</h2>
      <p>Os dados abaixo foram enviados pelo formulário da Meular Imóveis.</p>
      <table style="border-collapse:collapse;width:100%;max-width:900px;">${rows}</table>
    </div>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });
  }

  const payload = normalizePayload(req.body);
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    MAIL_FROM,
    MAIL_TO,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({
      ok: false,
      message: 'Backend de e-mail ainda não configurado com as variáveis SMTP.',
    });
  }

  const destinatario = MAIL_TO || payload.emailDestino;

  if (!destinatario) {
    return res.status(400).json({
      ok: false,
      message: 'Nenhum e-mail de destino foi definido.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: MAIL_FROM || `Meular Imóveis <${SMTP_USER}>`,
      to: destinatario,
      replyTo: payload.email || SMTP_USER,
      subject: `Nova ficha de captação - ${payload.proprietario || 'Meular Imóveis'}`,
      text: buildPlainText(payload),
      html: buildHtml(payload),
    });

    return res.status(200).json({ ok: true, message: 'E-mail enviado com sucesso.' });
  } catch (error) {
    console.error('Erro no envio de e-mail:', error);
    return res.status(500).json({ ok: false, message: 'Falha ao enviar e-mail.' });
  }
};