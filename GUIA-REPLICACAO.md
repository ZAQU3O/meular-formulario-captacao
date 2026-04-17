# Guia de Replicação — Formulário de Captação Imobiliária

Este guia explica como replicar o produto do zero para uma nova imobiliária.

---

## Visão geral do sistema

O formulário funciona 100% no frontend (sem servidor próprio). Ao submeter:
1. **EmailJS** envia o e-mail com a ficha completa para a imobiliária
2. **EmailJS** envia um e-mail de confirmação ao proprietário (se ele informou e-mail)
3. **Google Apps Script** registra os dados em uma planilha Google

---

## Passo 1 — Criar conta no EmailJS

1. Acesse [emailjs.com](https://www.emailjs.com) e crie uma conta gratuita
2. Vá em **Email Services** → **Add New Service** → escolha Gmail (ou outro provedor)
3. Autorize a conta de e-mail da imobiliária e copie o **Service ID** gerado
4. Vá em **Email Templates** → **Create New Template**
5. Configure o template assim:

   - **To Email:** `{{to_email}}`
   - **Subject:** `Nova Ficha de Captação — Protocolo {{protocolo}}`
   - **Body (HTML):** cole o HTML abaixo no corpo do template:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f9f6f1; margin: 0; padding: 0; }
    .wrapper { max-width: 620px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #241b14; padding: 28px 32px; text-align: center; }
    .header h1 { color: #c9a36a; font-size: 20px; margin: 0 0 4px; letter-spacing: 1px; }
    .header p { color: #d6c9b4; font-size: 13px; margin: 0; }
    .body { padding: 28px 32px; }
    .protocol-box { background: #f9f6f1; border: 1px solid #e0d5c5; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; display: flex; gap: 24px; }
    .protocol-box div { font-size: 12px; color: #7a6a5a; }
    .protocol-box strong { display: block; font-size: 15px; color: #241b14; margin-top: 2px; }
    .data-table { border-collapse: collapse; width: 100%; font-size: 14px; }
    .data-table td { padding: 8px 4px; border-bottom: 1px solid #eee; vertical-align: top; }
    .data-table td.label { font-weight: 700; color: #241b14; width: 40%; padding-right: 12px; }
    .data-table td.value { color: #444; }
    .footer { background: #f9f6f1; padding: 16px 32px; text-align: center; font-size: 12px; color: #a09080; border-top: 1px solid #e0d5c5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>FICHA DE CAPTAÇÃO</h1>
      <p>Recebida com sucesso</p>
    </div>
    <div class="body">
      <div class="protocol-box">
        <div><span>Protocolo</span><strong>{{protocolo}}</strong></div>
      </div>
      {{{conteudo}}}
    </div>
    <div class="footer">
      Este e-mail foi gerado automaticamente pelo sistema de captação.
    </div>
  </div>
</body>
</html>
```

   > **Atenção:** use **três chaves** `{{{conteudo}}}` para renderizar o HTML da tabela.

6. Salve e copie o **Template ID**
7. Vá em **Account** → copie a **Public Key**

---

## Passo 2 — Criar a planilha Google e publicar o webhook

1. Crie uma planilha no [Google Sheets](https://sheets.google.com)
2. Nomeie uma aba como **`Captacoes`** (exatamente assim, com C maiúsculo)
3. Abra o menu **Extensões → Apps Script**
4. Apague o código padrão e cole o script abaixo:

```javascript
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
      'Data de registro', 'Nome do corretor', 'Data da captação',
      'Nome do proprietário', 'RG', 'E-mail', 'CPF', 'Celular',
      'Estado civil', 'Nome do cônjuge', 'RG do cônjuge', 'E-mail do cônjuge',
      'Exclusividade', 'Endereço', 'Condomínio', 'Unidade', 'Bairro', 'CEP',
      'Matrícula do imóvel', 'Valor do imóvel', 'CPF adicional', 'Celular adicional',
      'Tipo do imóvel', 'Descrição do imóvel', 'Observações',
      'Nome da assinatura do proprietário', 'Assinatura do proprietário capturada',
      'Nome da assinatura da imobiliária', 'Assinatura da imobiliária capturada'
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    var row = [
      new Date(),
      data.corretor || '', data.dataCaptacao || '', data.proprietario || '',
      data.rg || '', data.email || '', data.cpf || '', data.celular || '',
      data.estadoCivil || '', data.conjuge || '', data.rgConjuge || '',
      data.emailConjuge || '', data.exclusividade || '', data.endereco || '',
      data.condominio || '', data.unidade || '', data.bairro || '', data.cep || '',
      data.matricula || '', data.valor || '', data.cpfImovel || '',
      data.celularImovel || '', data.tipoImovel || '', data.descricaoImovel || '',
      data.observacoes || '', data.assinaturaProprietario || '',
      data.assinaturaProprietarioCapturada || '', data.assinaturaImobiliaria || '',
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
```

5. Salve (Ctrl+S)
6. Clique em **Implantar → Nova implantação**
   - Tipo: **App da Web**
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
7. Clique em **Implantar** e autorize as permissões
8. Copie a **URL do app da web** gerada (será o Webhook URL)

---

## Passo 3 — Criar repositório no GitHub

1. Acesse [github.com](https://github.com) e crie um novo repositório público
2. Clone ou faça upload de todos os arquivos deste projeto
3. Faça commit e push

---

## Passo 4 — Publicar no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **Add New Project** → importe o repositório criado no Passo 3
3. Clique em **Deploy** (sem configurações extras — é site estático)
4. Anote a URL gerada (ex: `https://nome-do-projeto.vercel.app`)

---

## Passo 5 — Substituir os dados da empresa no código

Abra o arquivo `assets/js/script.js` e substitua os três valores no topo:

```js
const CONFIG_DEFAULTS = {
  email: 'EMAIL_DA_IMOBILIARIA@gmail.com',   // ← e-mail que receberá as fichas
  whatsapp: '5589XXXXXXXXX',                  // ← DDI + DDD + número (só números)
  webhook: 'https://script.google.com/...',   // ← URL do Apps Script (Passo 2)
};

const EMAILJS_SERVICE_ID  = 'service_XXXXXXX';   // ← Passo 1 item 3
const EMAILJS_TEMPLATE_ID = 'template_XXXXXXX';  // ← Passo 1 item 6
const EMAILJS_PUBLIC_KEY  = 'XXXXXXXXXXXXXXXXXXXX'; // ← Passo 1 item 7
```

---

## Passo 6 — Personalizar a identidade visual

| Arquivo | O que alterar |
|---|---|
| `index.html` | Título da página (`<title>`), texto do cabeçalho, nome da imobiliária |
| `assets/img/logo.png` | Substituir pelo logotipo da empresa (mesmo nome de arquivo) |
| `assets/css/style.css` | Cores principais nas variáveis CSS no `:root` |
| `admin.html` | Título e logotipo na tela de admin |

### Variáveis de cor no `style.css`
```css
:root {
  --gold: #c9a36a;       /* cor de destaque (dourado) */
  --dark: #241b14;       /* cor principal escura */
  --bg: #f9f6f1;         /* fundo geral */
  --text: #241b14;       /* texto padrão */
  --muted: #7a6a5a;      /* texto secundário */
  --border: #e0d5c5;     /* bordas */
}
```

---

## Passo 7 — Alterar a senha do painel admin

No arquivo `admin.html`, localize e substitua:

```js
const ADMIN_PASSWORD = 'meular2026';
```

Troque por uma senha forte da nova empresa.

---

## Passo 8 — Fazer o deploy final

```bash
git add .
git commit -m "feat: configuração para [Nome da Imobiliária]"
git push
npx vercel --prod --yes
```

---

## Como usar o painel admin

Após o deploy, acesse:
```
https://SEU-PROJETO.vercel.app/admin.html
```

No painel é possível alterar:
- **E-mail de destino** das fichas
- **Número de WhatsApp** para envio
- **URL do webhook** do Google Sheets

As configurações ficam salvas no navegador do administrador via `localStorage`.

---

## Estrutura dos arquivos

```
/
├── index.html                        ← Formulário principal
├── admin.html                        ← Painel do administrador
├── assets/
│   ├── css/style.css                 ← Todos os estilos
│   ├── js/script.js                  ← Toda a lógica (EmailJS, Sheets, modal)
│   └── img/logo.png                  ← Logotipo da empresa
├── integrations/
│   └── google-sheets/Code.gs         ← Script do Google Apps Script
├── api/
│   └── send-email.js                 ← Backend legado (não usado, pode ignorar)
└── package.json
```

---

## Resumo das credenciais a substituir

| Onde | Variável | Como obter |
|---|---|---|
| `script.js` | `CONFIG_DEFAULTS.email` | E-mail da imobiliária |
| `script.js` | `CONFIG_DEFAULTS.whatsapp` | Número com DDI (55) |
| `script.js` | `CONFIG_DEFAULTS.webhook` | URL do Apps Script (Passo 2) |
| `script.js` | `EMAILJS_SERVICE_ID` | Painel EmailJS → Email Services |
| `script.js` | `EMAILJS_TEMPLATE_ID` | Painel EmailJS → Email Templates |
| `script.js` | `EMAILJS_PUBLIC_KEY` | Painel EmailJS → Account |
| `admin.html` | `ADMIN_PASSWORD` | Definir senha da empresa |
