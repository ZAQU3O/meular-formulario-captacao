# Formulário de Captação - Meular Imóveis

Projeto em HTML, CSS e JavaScript com backend próprio para envio de e-mail e integrações de captação imobiliária.

## Estrutura

- index.html
- assets/css/style.css
- assets/js/script.js
- assets/img/logo.png
- api/send-email.js
- .env.example
- integrations/google-sheets/Code.gs
- integrations/google-sheets/Como-publicar.md

## Como abrir

- Localmente: abra o arquivo index.html no navegador
- Produção: use o link publicado na Vercel

## Integrações já preparadas

- envio por WhatsApp
- envio por e-mail via backend próprio
- salvar em PDF
- envio para Google Sheets via webhook

## Backend de e-mail

A API está em api/send-email.js e usa SMTP com Nodemailer.

### Variáveis necessárias

Copie .env.example para um arquivo .env e preencha:

- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- MAIL_FROM
- MAIL_TO

### Exemplo com Gmail

Use uma senha de app do Gmail no campo SMTP_PASS.

### Produção na Vercel

Cadastre essas mesmas variáveis no painel do projeto da Vercel para o envio automático funcionar online.

## Google Sheets

Use os arquivos dentro de integrations/google-sheets para publicar seu Apps Script e colar a URL do webhook no formulário.
