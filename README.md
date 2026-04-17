# Formulário de Captação — Meular Imóveis

Formulário profissional de captação imobiliária, 100% estático (HTML + CSS + JS), sem dependência de servidor próprio. Publicado via Vercel.

🔗 **Produção:** https://meular-formulario-captacao.vercel.app  
🔧 **Admin:** https://meular-formulario-captacao.vercel.app/admin.html

---

## Funcionalidades

- Ficha completa de captação com dados do proprietário, imóvel e condições comerciais
- Assinaturas digitais (proprietário + responsável da imobiliária) via canvas
- Envio automático de e-mail para a imobiliária via **EmailJS**
- E-mail de confirmação automático para o proprietário (se informou e-mail)
- Registro em **Google Sheets** via webhook (Google Apps Script)
- Envio por **WhatsApp** com mensagem pré-formatada
- Salvar em **PDF** via impressão do navegador
- Modal de confirmação de envio com número de protocolo e horário
- Formulário limpo automaticamente ao fechar o modal

---

## Painel Administrativo (`/admin.html`)

Acesso protegido por senha. Permite configurar tudo sem tocar no código:

| Seção | O que configura |
|---|---|
| Canais de recebimento | E-mail, WhatsApp, URL do webhook |
| Testar e-mail | Envia e-mail de teste direto pelo painel |
| Testar webhook | Dispara POST de teste na planilha |
| Identidade visual | Upload de logo (PNG/JPG/SVG), nome da imobiliária |
| Textos do formulário | Título, subtítulo, tag, card da marca |
| Segurança | Troca de senha do próprio painel |
| Link do formulário | Exibe e copia o link com 1 clique |
| Info do sistema | Última alteração, status da config, versão |
| Timeout de sessão | Logout automático após 30 min de inatividade |

Todas as configurações são salvas no `localStorage` do navegador e aplicadas imediatamente no formulário.

---

## Estrutura do projeto

```
├── index.html                          # Formulário principal
├── admin.html                          # Painel administrativo
├── assets/
│   ├── css/style.css                   # Estilos
│   ├── js/script.js                    # Lógica do formulário
│   └── img/logo.png                    # Logo padrão
└── integrations/
    └── google-sheets/
        ├── Code.gs                     # Apps Script (webhook)
        └── Como-publicar.md            # Guia de publicação
```

> O guia completo de replicação para novos clientes está em **GUIA-REPLICACAO.md**.

---

## Tecnologias

- **EmailJS v3** — envio de e-mail sem backend (CDN)
- **Google Apps Script** — webhook para Google Sheets
- **Vercel** — hospedagem estática
- **GitHub** — versionamento (`ZAQU3O/meular-formulario-captacao`)

---

## Credenciais (configurar no EmailJS)

| Variável | Valor |
|---|---|
| Public Key | `Tp3KkqmXfULnu2dl2` |
| Service ID | `service_935b0pu` |
| Template ID | `template_74ix2rt` |

> Configure **Allowed Origins** no painel do EmailJS → Security para restringir ao domínio da Vercel.

---

## Como replicar para outro cliente

Consulte o arquivo **GUIA-REPLICACAO.md** — contém o passo a passo completo com os scripts prontos.
