const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

// SENHA DO ADMIN - TROCA AQUI
const SENHA_ADMIN = 'Fhl330282@';

app.use(express.json());

// PROTEÇÃO DO ADMIN - TEM QUE VIR ANTES DO STATIC
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

// ROTA DO ADMIN PROTEGIDA
app.get('/admin', protegerAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// STATIC DEPOIS DA ROTA PROTEGIDA
app.use(express.static('public'));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// API: Busca produtos - JÁ TÁ CERTO, PEGA TUDO COM SELECT *
app.get('/api/produtos', async (req, res) => {
  const { data, error } = await supabase.from('produtos').select('*').order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

// API: Salva produto - ATUALIZADO PRA SHOPEE
app.post('/api/produtos', async (req, res) => {
  let { nome, preco, img, link, linkAmazon, linkShopee, categoria, destaque } = req.body;
  if (!nome ||!img) return res.status(400).json({ erro: 'Nome e imagem são obrigatórios' });
  if (!linkAmazon &&!linkShopee &&!link) return res.status(400).json({ erro: 'Precisa ter pelo menos 1 link: Amazon ou Shopee' });
  if (preco) preco = parseFloat(preco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  if (!categoria) categoria = 'Geral';
  if (destaque === undefined) destaque = false;
  const { data, error } = await supabase.from('produtos').insert([{ nome, preco, img, link, linkAmazon, linkShopee, categoria, destaque }]).select();
  if (error) return res.status(500).json({ erro: error.message });
  res.status(201).json(data[0]);
});

// API: Edita produto - ATUALIZADO PRA SHOPEE
app.put('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;
  let { nome, preco, img, link, linkAmazon, linkShopee, categoria, destaque } = req.body;
  if (preco) preco = parseFloat(preco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  const { data, error } = await supabase.from('produtos').update({ nome, preco, img, link, linkAmazon, linkShopee, categoria, destaque }).eq('id', id).select();
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data[0]);
});

// API: Deleta produto
app.delete('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ mensagem: 'Produto deletado' });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => console.log(`Rodando na porta ${port}`));