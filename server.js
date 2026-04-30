const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// API: Busca todos os produtos
app.get('/api/produtos', async (req, res) => {
  const { data, error } = await supabase
.from('produtos')
.select('*')
.order('criado_em', { ascending: false });

  if (error) {
    console.log('Erro ao buscar:', error);
    return res.status(500).json({ erro: error.message });
  }
  res.json(data);
});

// API: Salva produto novo
app.post('/api/produtos', async (req, res) => {
  let { nome, preco, img, link, categoria, destaque } = req.body;

  if (!nome ||!img ||!link) {
    return res.status(400).json({ erro: 'Nome, imagem e link são obrigatórios' });
  }

  if (preco) {
    preco = parseFloat(preco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  }

  if (!categoria) categoria = 'Geral';
  if (destaque === undefined || destaque === null) destaque = false;

  const { data, error } = await supabase
.from('produtos')
.insert([{ nome, preco, img, link, categoria, destaque }])
.select();

  if (error) {
    console.log('Erro ao inserir:', error);
    return res.status(500).json({ erro: error.message });
  }
  res.status(201).json(data[0]);
});

// API: Edita produto existente
app.put('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;
  let { nome, preco, img, link, categoria, destaque } = req.body;

  if (preco) {
    preco = parseFloat(preco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  }

  const { data, error } = await supabase
.from('produtos')
.update({ nome, preco, img, link, categoria, destaque })
.eq('id', id)
.select();

  if (error) {
    console.log('Erro ao atualizar:', error);
    return res.status(500).json({ erro: error.message });
  }
  res.json(data[0]);
});

// API: Deleta produto
app.delete('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
.from('produtos')
.delete()
.eq('id', id);

  if (error) {
    console.log('Erro ao deletar:', error);
    return res.status(500).json({ erro: error.message });
  }
  res.json({ mensagem: 'Produto deletado com sucesso' });
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => console.log(`Servidor rodando suave na porta ${port}`));