const fs   = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'meular2026';

  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Meular Admin"');
    res.status(401).end('Acesso não autorizado');
    return;
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const colonIndex = decoded.indexOf(':');
  const user = decoded.slice(0, colonIndex);
  const pass = decoded.slice(colonIndex + 1);

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Meular Admin"');
    res.status(401).end('Credenciais inválidas');
    return;
  }

  try {
    const adminPath = path.join(process.cwd(), 'admin.html');
    const content = fs.readFileSync(adminPath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.status(200).end(content);
  } catch (e) {
    res.status(500).end('Erro interno do servidor');
  }
};
