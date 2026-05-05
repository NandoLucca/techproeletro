const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

const SENHA_ADMIN = 'Fhl330282@';

app.use(express.json());

const protegerAdmin = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Acesso negado');
  }
  const base64Credentials = authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  if (password === SENHA_ADMIN) return next();
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).send('Senha incorreta');
};

app.get('/admin', protegerAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use(express.static('public'));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/api/produtos', async (req, res) => {
  try {
    const { data, error } = await supabase.from('produtos').select('*').order('criado_em', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Erro GET /api/produtos:', error);
    res.status(500).json({ erro: error.message });
  }
});

app.post('/api/produtos', async (req, res) => {
  try {
    let { nome, preco, img, link, linkAmazon, linkShopee, categoria, destaque } = req.body;

    if (!nome ||!img) return res.status(400).json({ erro: 'Nome e imagem são obrigatórios' });
    if (!linkAmazon &&!linkShopee &&!link) return res.status(400).json({ erro: 'Informe pelo menos um link: Amazon ou Shopee' });

    if (preco) preco = parseFloat(String(preco).replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    if (!categoria) categoria = 'Geral';
    if (destaque === undefined) destaque = false;

    const { data, error } = await supabase.from('produtos').insert([{
      nome,
      preco,
      img,
      link: link || null,
      linkAmazon: linkAmazon || null,
      linkShopee: linkShopee || null,
      categoria,
      destaque
    }]).select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro POST /api/produtos:', error);
    res.status(500).json({ erro: error.message });
  }
});

app.put('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { nome, preco, img, link, linkAmazon, linkShopee, categoria, destaque } = req.body;

    if (!linkAmazon &&!linkShopee &&!link) return res.status(400).json({ erro: 'Informe pelo menos um link: Amazon ou Shopee' });
    if (preco) preco = parseFloat(String(preco).replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

    const { data, error } = await supabase.from('produtos').update({
      nome,
      preco,
      img,
      link: link || null,
      linkAmazon: linkAmazon || null,
      linkShopee: linkShopee || null,
      categoria,
      destaque
    }).eq('id', id).select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Erro PUT /api/produtos:', error);
    res.status(500).json({ erro: error.message });
  }
});

app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Erro DELETE /api/produtos:', error);
    res.status(500).json({ erro: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`Rodando na porta ${port}`));