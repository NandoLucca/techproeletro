const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

// Middleware pra ler JSON e servir arquivos da pasta public
app.use(express.json());
app.use(express.static('public'));

// Conecta no Supabase - pega as chaves do Render
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// API: Pega todos os produtos do banco
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

// API: Salva produto novo no banco
app.post('/api/produtos', async (req, res) => {
  const { nome, preco, img, link } = req.body;

  if (!nome ||!img ||!link) {
    return res.status(400).json({ erro: 'Nome, imagem e link são obrigatórios' });
  }

  const { data, error } = await supabase
 .from('produtos')
 .insert([{ nome, preco, img, link }])
 .select();

  if (error) {
    console.log('Erro ao inserir:', error);
    return res.status(500).json({ erro: error.message });
  }
  res.status(201).json(data[0]);
});

app.listen(port, () => console.log(`Servidor rodando suave na porta ${port}`));