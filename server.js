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

app.get('/api/produtos', async (req, res) => {
  const { data, error } = await supabase
  .from('produtos')
  .select('*')
  .order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

app.post('/api/produtos', async (req, res) => {
  const { nome, preco, img, link } = req.body;
  const { data, error } = await supabase
  .from('produtos')
  .insert([{ nome, preco, img, link }])
  .select();
  if (error) return res.status(500).json({ erro: error.message });
  res.status(201).json(data[0]);
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));